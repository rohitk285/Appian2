import express, {Request, Response} from "express";
import bodyParser from "body-parser";
import cors from "cors";
const Document = require("./models/documentModel");
const Aadhar = require("./models/aadharModel");
const Pan = require("./models/panModel");
const CreditCard = require("./models/creditCardModel");
const Cheque = require("./models/chequeModel");
const verhoeff = require("verhoeff");
const { encryptAES, decryptAES, hashName } = require("./utils/encryptionUtils");
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

app.use(bodyParser.json());

const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// /pushDetails endpoint
app.post("/pushDetails", async (req, res) => {
  try {
    const documentData = req.body;
    const { document_type, named_entities } = documentData;
    
    if (!named_entities.Name) {
      return res.status(400).json({ error: "Named entity 'name' is required" });
    }
    
    let existingDocument = await Document.findOne({
      name: named_entities.Name,
    });

    if (existingDocument) {
      if (!existingDocument.document_type.includes(document_type)) {
        existingDocument.document_type.push(document_type);
      }

      for (const [key, value] of Object.entries(named_entities)) {
        existingDocument.named_entities[key] = encryptAES(value);
      }

      await Document.updateOne(
        { name: existingDocument.name },
        {
          $set: {
            named_entities: existingDocument.named_entities,
            document_type: existingDocument.document_type,
          },
        }
      );
      return res.status(200).json({ message: "Document updated successfully" });
    } else {
      let user_name = named_entities.Name;
      for(const key in named_entities){
        if(named_entities[key])
            named_entities[key] = encryptAES(named_entities[key]);
      }
      const newDocument = {
        name: user_name,
        document_type: [document_type],
        named_entities: named_entities,
      };
      await Document.create(newDocument);
      return res.status(201).json({ message: "Document created successfully" });
    }
  } catch (error) {
    console.error("Error processing document data:", error);
    res.status(500).json({ error: "Failed to process document data" });
  }
});

app.post("/validateAadhaar", (req, res) => {
  const { aadhaar_number } = req.body;

  // remove spaces
  const cleanAadhaarNumber = aadhaar_number.replace(/\s+/g, "");

  if (
    cleanAadhaarNumber &&
    cleanAadhaarNumber.length === 12 &&
    verhoeff.validate(cleanAadhaarNumber)
  ) {
    return res.status(200).json({ message: "Aadhaar Number is valid." });
  } else {
    return res.status(400).json({ error: "Invalid Aadhaar Number." });
  }
});

app.get("/getUserDetails", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const userDocuments = await Document.find({
      name: { $regex: name, $options: "i" },
    });

    // decrypting data in named_entities
    const decryptedDocuments = userDocuments.map(doc => {
      const decryptedNamedEntities = {};
      for (const [key, value] of Object.entries(doc.named_entities)) {
        try {
          decryptedNamedEntities[key] = decryptAES(value);
        } catch (e) {
          decryptedNamedEntities[key] = null;
        }
      }
      return {
        ...doc.toObject(),
        named_entities: decryptedNamedEntities,
      };
    });

    return res.status(200).json({
      message: "User details fetched successfully",
      data: decryptedDocuments,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

app.get("/getLinks", async (req, res) => {
  const { name } = req.query;

  try {
    if (!name) return res.status(400).json({ error: "Name is required" });
    const hashedName = hashName(name);
    let docs = await Document.findOne({ name: name }, { document_type: 1 });
    docs = docs.document_type;

    if (!docs || docs.length === 0) {
      return res.status(500).send("No documents found");
    }

    let response = [];

    for (const doc of docs) {
      switch (doc) {
        case "Aadhaar Card":
          let aadhaarLink = await Aadhar.findOne(
            { nameHash: hashedName },
            { fileLink: 1 }
          );
          if (aadhaarLink) {
            response.push({ document: "Aadhar", link: aadhaarLink.fileLink });
          }
          break;
        case "PAN Card":
          let panLink = await Pan.findOne({ nameHash: hashedName }, { fileLink: 1 });
          if (panLink) {
            response.push({ document: "PAN Card", link: panLink.fileLink });
          }
          break;
        case "Cheque":
          let chequeLink = await Cheque.findOne(
            { nameHash: hashedName },
            { fileLink: 1 }
          );
          if (chequeLink) {
            response.push({ document: "Cheque", link: chequeLink.fileLink });
          }
          break;
        case "Credit Card":
          let creditCardLink = await CreditCard.findOne(
            { nameHash: hashedName },
            { fileLink: 1 }
          );
          if (creditCardLink) {
            response.push({
              document: "Credit Card",
              link: creditCardLink.fileLink,
            });
          }
          break;
        default:
          break;
      }
    }

    if (response.length === 0) {
      return res.status(404).json({ message: "No document links found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Express server running on http://localhost:${PORT}`)
);
