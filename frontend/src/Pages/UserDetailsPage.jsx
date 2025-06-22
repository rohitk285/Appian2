import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Link,
} from "@mui/material";
import { useLocation } from "react-router-dom"; // To retrieve data passed through the router
import axios from "axios";

const UserDetailsPage = () => {
  const location = useLocation(); // Get the state passed from EntryPage
  const user = location.state?.userData; // Retrieve user data
  const [links, setLinks] = useState([]);

  async function getLinks() {
    try {
      const response = await axios.get("http://localhost:3000/getLinks", {
        params: { name: user.name },
      });
      setLinks(response.data);
    } catch (err) {
      console.error("Cannot fetch links", err);
    }
  }

  useEffect(() => {
    getLinks();
  }, []);

  if (!user) {
    return (
      <Typography variant="h5" sx={{ color: "#FF5722", padding: 2 }}>
        User not found
      </Typography>
    );
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", marginBottom: 4, color: "#111810", fontFamily: "Oswald" }}
      >
        User Details
      </Typography>
      <Card
        sx={{
          padding: 4,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        <CardContent>
          <Grid container spacing={3}>
            {/* Named Entities */}
            {user.named_entities && (
              <>
                {Object.keys(user.named_entities).map((entityKey, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    key={entityKey}
                    sx={{
                      display: "flex",
                      flexDirection: index % 2 === 0 ? "row" : "row-reverse",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: "#FF5722",
                          marginBottom: 1,
                        }}
                      >
                        {entityKey}:
                      </Typography>
                      {Array.isArray(user.named_entities[entityKey]) ? (
                        <List
                          sx={{
                            backgroundColor: "#eeeeee",
                            padding: "10px",
                            borderRadius: "8px",
                          }}
                        >
                          {user.named_entities[entityKey].map((item, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={item}
                                primaryTypographyProps={{
                                  sx: { fontWeight: "bold", color: "#000000" },
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "bold", color: "#000000", fontFamily: "Nunito", fontSize: "20px" }}
                        >
                          {user.named_entities[entityKey]}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
              </>
            )}

            {/* Related Documents */}
            {user.document_type && (
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#FF5722" }}
                >
                  Related Documents:
                </Typography>
                <List
                  sx={{
                    backgroundColor: "#eeeeee",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                >
                  {links.map((doc, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={doc.document}
                        primaryTypographyProps={{
                          sx: { fontWeight: "bold", color: "#000000", fontFamily: "Merriweather" },
                        }}
                        secondary={
                          doc.link ? (
                            <Link
                              href={doc.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                color: "#FF5722",
                                fontWeight: "bold",
                                textDecoration: "underline",
                              }}
                            >
                              Click here to view
                            </Link>
                          ) : (
                            "No document available"
                          )
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDetailsPage;
