import React, { useState, useEffect } from "react";
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
  TextField,
  Modal,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { DocumentScanner } from "@mui/icons-material";
import axios from "axios";

const RetrievalPageDoc = () => {
  const [selectedDocument, setSelectedDocument] = useState("");
  const [docQuery, setDocQuery] = useState("");
  const [searchName, setSearchName] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleDocumentChange = (e) => {
    switch (e.target.value) {
      case "Aadhaar Card":
        setDocQuery("aadhaar");
        break;
      case "PAN Card":
        setDocQuery("pan");
        break;
      case "Credit Card":
        setDocQuery("creditcard");
        break;  
      case "Cheque":
        setDocQuery("cheque");
        break;
      default:
        setDocQuery("");
        break;
    }
    setSelectedDocument(e.target.value);
    setSearchName(""); // resetting search name when document type changes
  };

  const handleNameChange = (e) => {
    setSearchName(e.target.value);
  };

  const handleCardClick = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    const fetchFilteredData = async () => {
      if (!selectedDocument || !searchName) {
        setFilteredResults([]);
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/getDocuments", {
          params: {
            name: searchName,
            documentType: docQuery,
          },
        });
        setFilteredResults(response.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchFilteredData();
  }, [selectedDocument, searchName]);

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "#FFFFFF",
          padding: 4,
          marginTop: "64px",
        }}
      >
        {/* Filter Input Box */}
        <Box
          sx={{
            backgroundColor: "#000",
            padding: 2,
            maxWidth: "500px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            marginBottom: 4,
            gap: 2,
          }}
        >
          <FormControl sx={{ width: "200px" }}>
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
              <MenuItem value="Aadhaar Card">Aadhaar Card</MenuItem>
              <MenuItem value="PAN Card">PAN Card</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="Cheque">Cheque</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Name"
            variant="filled"
            value={searchName}
            onChange={handleNameChange}
            sx={{
              input: { color: "#FFF" },
              label: { color: "#FFF" },
              backgroundColor: "#333",
              borderRadius: "4px",
              width: "200px",
            }}
          />
        </Box>

        {/* Results Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 2,
          }}
        >
          {filteredResults.length > 0 ? (
            filteredResults.map((user, index) => (
              <Card
                key={index}
                onClick={() => handleCardClick(user)}
                sx={{
                  padding: 2,
                  backgroundColor: "#E65100",
                  color: "#FFFFFF",
                  borderRadius: "8px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                  position: "relative",
                  transition: "transform 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#F5F5F5",
                    color: "#000000",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", fontFamily: "Merriweather" }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "Kanit" }}>
                    Document Type: {user.document_type}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "Kanit" }}>
                    Uploaded At: {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    color: "#FFFFFF",
                    "&:hover": {
                      color: "#000000",
                    },
                  }}
                >
                  <DocumentScanner fontSize="large" />
                </Box>
              </Card>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: "#000000" }}>
              No results found.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Modal for file details */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedUser && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Document Details
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong> {selectedUser.name}
              </Typography>
              <Typography variant="body1">
                <strong>Uploaded At:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                <strong>File Link:</strong>{" "}
                <a
                  href={selectedUser.fileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1976d2" }}
                >
                  View File
                </a>
              </Typography>
              <Box sx={{ textAlign: "right", mt: 3 }}>
                <Button variant="contained" onClick={handleModalClose}>
                  Close
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default RetrievalPageDoc;
