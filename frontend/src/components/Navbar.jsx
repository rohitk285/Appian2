import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Handle dropdown menu open/close
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#FFFFFF", // White navbar
        color: "#000000", // Default text color to black
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for the navbar
        padding: 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Appian text */}
        <Typography
          variant="h3"
          component="div"
          sx={{
            cursor: "pointer",
            fontWeight: "bold",
            color: "#FF5722", // Orange color for Appian text
            fontFamily: "Bebas Neue",
          }}
          onClick={() => navigate("/uploadDocs")}
        >
          Appian
        </Typography>

        {/* Menu options */}
        <Box>
          {/* Retrieve Button with Dropdown */}
          <Button
            onMouseEnter={handleMenuOpen}
            sx={{
              color: "#000000", // Black text
              fontWeight: "bold",
              fontSize: "18px", // Increased font size
              textTransform: "none",
              fontFamily: "Nunito",
              marginRight: 2, // Spacing between buttons
              padding: "8px 20px", // Bubble-like padding
              borderRadius: "10px", // Rounded bubble style
              ":hover": {
                color: "#FF5722", // Change text color to orange on hover
                textDecoration: "underline", // Underline text on hover
                textDecorationThickness: "4px", // Thicker underline
                textUnderlineOffset: "5px", // Offset underline closer to bottom edge
                textDecorationColor: "#FF5722", // Orange underline
              },
            }}
          >
            Retrieve
          </Button>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onMouseLeave={handleMenuClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
            sx={{
              "& .MuiPaper-root": {
                backgroundColor: "#FFFFFF", // White background for dropdown
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
              },
            }}
          >
            {["By Upload Date", "By Customer Name", "By Document Type"].map((text, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  handleMenuClose();
                  navigate(
                    text === "By Upload Date"
                      ? "/retrievedate"
                      : text === "By Customer Name"
                      ? "/"
                      : "/retrievedoc"
                  );
                }}
                sx={{
                  color: "#000000", // Black text
                  fontSize: "1rem", // Increased font size
                  ":hover": {
                    color: "#FF5722", // Orange text on hover
                    textDecoration: "underline", // Underline text on hover
                    textDecorationThickness: "3px", // Thicker underline
                    textUnderlineOffset: "5px", // Offset underline closer to bottom edge
                    textDecorationColor: "#FF5722", // Orange underline
                  },
                }}
              >
                {text}
              </MenuItem>
            ))}
          </Menu>

          {/* Other Buttons */}
          {["Upload", "About Us", "Logout"].map((text, index) => (
            <Button
              key={index}
              onClick={() => navigate(index === 0 ? "/uploadDocs" : "#")}
              sx={{
                color: "#000000", // Black text
                fontWeight: "bold",
                fontSize: "18px", // Increased font size
                fontFamily: "Nunito",
                textTransform: "none",
                marginRight: 2, // Spacing between buttons
                padding: "8px 20px", // Bubble-like padding
                borderRadius: "10px", // Rounded bubble style
                ":hover": {
                  color: "#FF5722", // Change text color to orange on hover
                  textDecoration: "underline", // Underline text on hover
                  textDecorationThickness: "5px", // Thicker underline
                  textUnderlineOffset: "20px", // Offset underline closer to bottom edge
                  textDecorationColor: "#FF5722", // Orange underline
                },
              }}
            >
              {text}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
