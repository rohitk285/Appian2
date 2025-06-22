import React, { useState, useRef } from "react"; 
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogContent,
} from "@mui/material";
import { CloudUpload, CheckCircle, Cancel } from "@mui/icons-material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Navbar from "../components/Navbar";
import UploadImage from "../assets/icon1.png";
import CustomerVerified from "../assets/icon2.jpg";
import IndiaBanks from "../assets/icon4.png";
import WorldBanks from "../assets/icon3.png";
import AIPowered from "../assets/icon5.jpg";
import ProcessIntelligence from "../assets/icon6.png";

const UploadPage = () => {
  const [formData, setFormData] = useState({
    employeeId: "",
    pin: "",
    files: [],
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [alert, setAlert] = useState({ open: false, success: false, message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    setFormData({
      ...formData,
      files: [...formData.files, ...Array.from(files)],
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("employeeId", formData.employeeId);
      formDataToSend.append("pin", formData.pin);

      formData.files.forEach((file, index) => {
        formDataToSend.append(`file_${index}`, file);
      });

      const response = await fetch("http://localhost:5000/uploadDetails", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();
      if (response.ok) {
        setAlert({
          open: true,
          success: true,
          message: "Successfully Processed",
        });
        setTimeout(() => {
          setAlert({ open: false, success: false, message: "" });
        }, 3000);
      } else {
        setAlert({
          open: true,
          success: false,
          message: result.error || "An error occurred.",
        });
        setTimeout(() => {
          setAlert({ open: false, success: false, message: "" });
        }, 3000);
      }      

      setFormData({
        employeeId: "",
        pin: "",
        files: [],
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setAlert({
        open: true,
        success: false,
        message: "An error occurred while submitting the form.",
      });
    } finally {
      setLoading(false);
      if(fileInputRef.current){
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCloseAlert = () => {
    setAlert({ open: false, success: false, message: "" });;
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
  };

  const carouselImages = [
    { src: CustomerVerified, text: "10M Customer Records Verified" },
    { src: IndiaBanks, text: "Partnered with 10+ Banks in India" },
    { src: WorldBanks, text: "Partnered with 25+ Banks Worldwide" },
    { src: AIPowered, text: "Pioneers in AI-powered technology" },
    { src: ProcessIntelligence, text: "Process Intelligence" },
  ];

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#000000",
          padding: 4,
        }}
      >
        <Box
          sx={{ width: { xs: "100%", sm: "40%" } }}
          className="-translate-y-24 translate-x-10"
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "#FFFFFF",
              marginBottom: 3,
              fontFamily: "Oswald",
            }}
          >
            Upload Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employeeId"
                variant="outlined"
                value={formData.employeeId}
                onChange={handleChange}
                sx={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 1,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="PIN Number"
                name="pin"
                variant="outlined"
                type="password"
                value={formData.pin}
                onChange={handleChange}
                sx={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 1,
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                sx={{
                  color: "#FFFFFF",
                  borderColor: "#FFFFFF",
                  flexShrink: 0,
                  minWidth: "150px",
                  marginRight: "10px",
                }}
              >
                Upload Files (PDFs)
                <input
                  type="file"
                  name="files"
                  hidden
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </Button>
              {formData.files.length > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    color: "#FFFFFF",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "calc(100% - 170px)",
                  }}
                >
                  {formData.files.map((file) => file.name).join(", ")}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{
                  backgroundColor: "#FF5722",
                  padding: "10px 0",
                  fontWeight: "bold",
                  fontSize: "16px",
                  borderRadius: "30px",
                }}
              >
                Upload
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            display: { xs: "none", sm: "block" },
            width: "50%",
          }}
        >
          <img
            className="translate-x-32 -translate-y-24"
            src={UploadImage}
            alt="Illustration"
            style={{
              height: "350px",
              width: "400px",
              borderRadius: "10px",
            }}
          />
        </Box>
      </Box>

      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <Box sx={{ textAlign: "center", color: "#FFFFFF" }}>
            <CircularProgress sx={{ color: "#FFFFFF" }} />
            <Typography variant="h6" sx={{ marginTop: 2, color: "#FFFFFF" }}>
              Please wait, this might take a few moments.
            </Typography>
          </Box>
        </Box>
      )}

      <Dialog
        open={alert.open}
        onClose={handleCloseAlert}
        sx={{
          "& .MuiDialog-paper": {
            padding: 4,
            borderRadius: "15px",
            minWidth: "300px",
          },
        }}
      >
        <DialogContent
          sx={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {alert.success ? (
            <CheckCircle
              sx={{ fontSize: "60px", color: "green", marginBottom: 2 }}
            />
          ) : (
            <Cancel sx={{ fontSize: "60px", color: "red", marginBottom: 2 }} />
          )}
          <Typography variant="h6">{alert.message}</Typography>
        </DialogContent>
      </Dialog>

      <Box
        className="-translate-y-64"
        sx={{
          minHeight: "100vh",
          backgroundColor: "#FFFFFF",
          padding: 4,
        }}
      >
        <Slider {...carouselSettings} style={{ margin: "0 -15px" }}>
          {carouselImages.map((item, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                margin: "0 15px",
                width: "70%",
                height: "200px",
                backgroundImage: `url(${item.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  textAlign: "center",
                }}
              >
                {item.text}
              </Typography>
            </Box>
          ))}
        </Slider>
      </Box>
    </>
  );
};

export default UploadPage;
