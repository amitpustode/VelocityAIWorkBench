import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import '../styles/help.scss';
import {logEvent} from "../utility/logger"
const HelpPage = () => {
  const [formData, setFormData] = useState({
    toemail: 'gl.vaw.support@globallogic.com',
    name: '', 
    email: '',
    subject: 'Inquiry about the product', // Dummy data
    message: 'Could you please provide more details about the product?', // Dummy data
  });

  const [errors, setErrors] = useState({
    toemail: false,
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    logEvent("info", `User updated ${name} field.`);
    setFormData({ ...formData, [name]: value });

    // Reset errors for the specific field
    setErrors({ ...errors, [name]: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    const newErrors = {
      toemail: !validateEmail(formData.toemail),
      name: formData.name === '',
      email: !validateEmail(formData.email),
      subject: formData.subject === '',
      message: formData.message === '',
    };
  
    setErrors(newErrors);
  
    if (!Object.values(newErrors).some((error) => error)) {
      // Create mailto link
      const mailtoLink = `mailto:${formData.toemail}?subject=${encodeURIComponent(
        formData.subject
      )}&body=${encodeURIComponent(
        `${formData.message}`
      )}`;
  
      // Open the default mail client (e.g., Outlook)
      window.location.href = mailtoLink;
    }
  };
  

  return (
    <Box className="pageWrapper">
      <Card className="pageCard">
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              maxWidth: 500,
              mx: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            <Typography style={{color: "#f37137", marginTop:"100px"}} className="formheader" variant="h5" align="center">
              Send Mail
            </Typography>
            <TextField
              label="Send To"
              name="toemail" // Fixed the name to be unique
              value={formData.toemail}
              onChange={handleChange}
              error={errors.toemail}
              disabled
              helperText={errors.toemail ? 'Invalid email format.' : ''}
              fullWidth
            />
            <TextField
              label="From email"
              name="email" // Fixed the name to be unique
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              helperText={errors.email ? 'Invalid email format.' : ''}
              fullWidth
            />
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              helperText={errors.name ? 'Name is required.' : ''}
              fullWidth
            />
            <TextField
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              error={errors.subject}
              helperText={errors.subject ? 'Subject is required.' : ''}
              fullWidth
            />
            <TextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              error={errors.message}
              helperText={errors.message ? 'Message is required.' : ''}
              multiline
              rows={4}
              fullWidth
            />
            <Button
              className="sendmailbtn"
              type="submit"
              variant="contained"
              fullWidth
            >
              Send Mail
            </Button>
            <Snackbar
              open={success}
              autoHideDuration={4000}
              onClose={() => setSuccess(false)}
            >
              <Alert
                onClose={() => setSuccess(false)}
                severity="success"
                sx={{ width: '100%' }}
              >
                Mail sent successfully!
              </Alert>
            </Snackbar>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HelpPage;
