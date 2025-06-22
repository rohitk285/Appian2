import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import Navbar from "../components/Navbar";

const SettingsPage = () => {
  const [selectedDocuments, setSelectedDocuments] = useState({
    aadharcard: true, // Always checked
    pancard: false,
    passport: false,
    drivinglicense: false,
    votercard: false,
    rationcard: false,
    creditcard: false,
    bankstatement: false,
  });

  // Fetch the selected documents from the backend when the page loads
  useEffect(() => {
    const fetchSelectedDocuments = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/getSelectedDocuments",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();
        console.log(result);

        if (response.ok) {
          // Initialize the selectedDocuments state with default values
          let selectedDocs = {
            aadharcard: true, // Aadhar Card is mandatory and always checked
            pancard: false,
            passport: false,
            drivinglicense: false,
            votercard: false,
            rationcard: false,
            creditcard: false,
            bankstatement: false,
          };

          // Update selectedDocuments based on the fetched data
          result.selectedDocuments.forEach((doc) => {
            let key = doc.toLowerCase().replace(/\s+/g, ""); // Format the key to match state property names
            console.log(key);
            if (selectedDocs.hasOwnProperty(key)) {
              selectedDocs[key] = true; // Set the respective document to true
            }
          });

          // Set the updated state
          setSelectedDocuments(selectedDocs);
          console.log(selectedDocs);
        } else {
          alert(result.error || "Failed to fetch selected documents.");
        }
      } catch (error) {
        console.error("Error fetching selected documents:", error);
        alert("An error occurred while fetching the documents.");
      }
    };

    fetchSelectedDocuments();
  }, []);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setSelectedDocuments((prevState) => ({
      ...prevState, // Spread the previous state
      [name]: checked, // Update the specific checkbox
    }));
  };

  const handleSubmit = async () => {
    const selected = Object.entries(selectedDocuments)
      .filter(([key, value]) => value)
      .map(([key]) =>
        key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
      );

    const documentCount = selected.length;

    try {
      const response = await fetch("http://localhost:5000/saveDocuments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedDocuments: selected, documentCount }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Documents saved successfully!");
      } else {
        alert(result.error || "Failed to save documents.");
      }
    } catch (error) {
      console.error("Error saving documents:", error);
      alert("An error occurred while saving documents.");
    }
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#f9f9f9",
          padding: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "bold",
            marginBottom: 4,
            color: "#333",
            textAlign: "center",
          }}
        >
          Required Documents
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked disabled />}
            label="Aadhar Card (Mandatory)"
            name="aadharcard"
          />
          {[
            { name: "pancard", label: "PAN Card" },
            { name: "passport", label: "Passport" },
            { name: "drivinglicense", label: "Driving License" },
            { name: "votercard", label: "Voter Card" },
            { name: "rationcard", label: "Ration Card" },
            { name: "creditcard", label: "Credit Card" },
            { name: "bankstatement", label: "Bank Statement" },
          ].map((doc) => (
            <FormControlLabel
              key={doc.name}
              control={
                <Checkbox
                  checked={selectedDocuments[doc.name]} // Ensure this is being set correctly
                  onChange={handleChange}
                  name={doc.name}
                />
              }
              label={doc.label}
            />
          ))}
        </FormGroup>

        <Button
          variant="contained"
          color="primary"
          sx={{
            marginTop: 3,
            padding: "10px 0",
            fontWeight: "bold",
            fontSize: "16px",
          }}
          onClick={handleSubmit}
        >
          OK
        </Button>
      </Box>
    </>
  );
};

export default SettingsPage;
