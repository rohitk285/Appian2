import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { DocumentScanner } from "@mui/icons-material";

const RetrievalPageDoc = () => {
  const users = [
    { name: "Rohan Bakshi", dob: "1987-11-09", uploadedOn: "29/09/2024" },
    { name: "Rohini Deshpande", dob: "2001-07-17", uploadedOn: "29/09/2024" },
    { name: "Rohit Kumar", dob: "1995-12-12", uploadedOn: "28/09/2024" },
    { name: "Yousaf M", dob: "1975-05-14", uploadedOn: "28/09/2024" },
    { name: "Rohaan Acharya", dob: "1992-06-24", uploadedOn: "02/12/2024" },
    { name: "Rohandeep Reddy", dob: "1997-07-06", uploadedOn: "12/09/2024" },
    { name: "Manoj Reddy", dob: "1998-09-09", uploadedOn: "12/10/2024" },
    { name: "Aditya Bakshi", dob: "1988-12-30", uploadedOn: "02/12/2024" },
    { name: "Amyra Pandey", dob: "1999-07-10", uploadedOn: "01/11/2024" },
    { name: "Alapati Raju", dob: "1985-11-11", uploadedOn: "02/11/2024" },
    { name: "Govindan Narasimha", dob: "1990-08-09", uploadedOn: "01/11/2024" },
    { name: "Lakshmi Narayanan", dob: "1985-09-08", uploadedOn: "02/11/2024" },
  ];

  const [selectedDocument, setSelectedDocument] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);

  const handleDocumentChange = (e) => {
    const documentType = e.target.value;
    setSelectedDocument(documentType);

    const updatedResults = users.map((user) => ({
      ...user,
      document: `${user.name} ${documentType}`,
    }));
    setFilteredResults(updatedResults);
  };

  const handleSubmit = () => {
    alert("Documents submitted successfully!");
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "#FFFFFF", // White background
          padding: 4,
          marginTop: "64px",
        }}
      >
        {/* Black Box Surrounding Input */}
        <Box
          sx={{
            backgroundColor: "#000", // Black background for the box
            padding: 2,
            maxWidth: "350px",
            maxHeight: "150px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <FormControl sx={{ width: "200px", marginRight: 2 }}>
            <InputLabel sx={{ color: "#FFFFFF" }}>Document Type</InputLabel>
            <Select
              value={selectedDocument}
              onChange={handleDocumentChange}
              sx={{
                color: "#FFFFFF",
                backgroundColor: "#333",
                "& .MuiSelect-icon": {
                  color: "#FFFFFF",
                },
              }}
            >
              <MenuItem value="Aadhar card">Aadhar card</MenuItem>
              <MenuItem value="PAN card">PAN card</MenuItem>
              <MenuItem value="Driving License">Driving License</MenuItem>
              <MenuItem value="Passport">Passport</MenuItem>
              <MenuItem value="Voter Card">Voter Card</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{
              padding: "8px 16px",
              fontWeight: "bold",
              borderRadius: "30px"
            }}
          >
            Submit
          </Button>
        </Box>

        {/* Display Results in Grid Format */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
          }}
        >
          {filteredResults.length > 0 ? (
            filteredResults.map((user, index) => (
              <Card
                key={index}
                sx={{
                  padding: 2,
                  backgroundColor: "#E65100", // Slightly darker orange background
                  color: "#FFFFFF", // White text
                  borderRadius: "8px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                  position: "relative", // Required for positioning the icon
                  transition: "transform 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#F5F5F5", // Light gray background on hover
                    color: "#000000", // Black text on hover
                    transform: "scale(1.05)", // Slightly larger size
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", fontFamily: "Merriweather" }}>
                    {user.document}
                  </Typography>
                  <Typography variant="body2" sx={{fontFamily: "Kanit"}}>
                    Date of Birth: {user.dob}
                  </Typography>
                  <Typography variant="body2" sx={{fontFamily: "Kanit"}}>
                    Uploaded on: {user.uploadedOn}
                  </Typography>
                </CardContent>

                {/* Document Icon */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: "8px", // Adjust to position relative to the card
                    right: "8px", // Adjust to position relative to the card
                    color: "#FFFFFF",
                    "&:hover": {
                      color: "#000000", // Change color on hover
                    },
                  }}
                >
                  <DocumentScanner fontSize="large" />
                </Box>
              </Card>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: "#000000" }}>
              No results found. Please select a document.
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
};

export default RetrievalPageDoc;
