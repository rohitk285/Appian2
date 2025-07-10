import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { connectToCouchbase } from "./db/couchbase.js";
import pushDetailsHandler from "./routes/pushDetailsHandler.js";
import validateAadhaarHandler from "./routes/validateAadhaarHandler.js";
import getUserDetailsHandler from "./routes/getUserDetailsHandler.js";
import getLinksHandler from "./routes/getLinksHandler.js";
import getDocumentsHandler from "./routes/getDocumentsHandler.js";
import deleteUserHandler from "./routes/deleteUserHandler.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173", methods: ["GET", "POST"] }));
app.use(bodyParser.json());

await connectToCouchbase(); // connect once to couchbase

app.use("/pushDetails", pushDetailsHandler);
app.use("/validateAadhaar", validateAadhaarHandler);
app.use("/getUserDetails", getUserDetailsHandler);
app.use("/getLinks", getLinksHandler);
app.use("/getDocuments", getDocumentsHandler);
app.use("/deleteUser", deleteUserHandler);

app.listen(3000, () => {
  console.log("Express server running on http://localhost:3000");
});