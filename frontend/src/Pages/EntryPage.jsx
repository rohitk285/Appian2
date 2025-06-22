import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory

const EntryPage = () => {
  const [formData, setFormData] = useState({ name: "", dob: "" });
  const [filteredResults, setFilteredResults] = useState([]);
  const navigate = useNavigate(); // Use useNavigate for navigation

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    try {
      const response = await axios.get("http://localhost:3000/getUserDetails", {
        params: { name: newFormData.name },
      });
      
      if (response.status === 200) {
        setFilteredResults(response.data.data); // Update filtered results with the user data
      }
    } catch (error) {
      setFilteredResults([]); // Clear results if no match
    }
  };

  const handleUserClick = (user) => {
    // Navigate to the details page and pass the selected user data
    navigate("/user-details", { state: { userData: user } });
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          minHeight: "100vh",
          backgroundColor: "#FFFFFF",
          padding: 4,
          marginTop: "64px",
        }}
      >
        <Box
          sx={{
            flex: 1,
            maxWidth: "300px",
            maxHeight: "280px",
            marginRight: 4,
            backgroundColor: "#FF5722",
            padding: 4,
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold", marginBottom: 2, color: "#FFFFFF" }}
          >
            Search User
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                sx={{ backgroundColor: "#FFFFFF", borderRadius: "4px" }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            flex: 2,
            backgroundColor: "#111810",
            padding: 4,
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            maxHeight: "600px",
            overflow: "auto",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold", marginBottom: 2, color: "#FFFFFF" }}
          >
            Results
          </Typography>
          {filteredResults.length > 0 ? (
            filteredResults.map((user, index) => (
              <Card
                key={index}
                sx={{
                  marginBottom: 2,
                  borderRadius: "8px",
                  backgroundColor: "#FF5722",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  color: "#FFFFFF",
                  ":hover": {
                    backgroundColor: "#FFFFFF",
                    color: "#000000",
                    transition: "background-color 0.3s, color 0.3s",
                  },
                  cursor: "pointer",
                }}
                onClick={() => handleUserClick(user)}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", fontFamily: "MerriWeather" }}
                  >
                    {user.name}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: "#FFFFFF" }}>
              No results found.
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
};

export default EntryPage;
