import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const Contact = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });
      if (response.ok) {
        alert('Email sent successfully!');
        setFormState({ name: '', email: '', message: '' });
      } else {
        alert('Error sending email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Contacto
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Para contactar directamente, llámanos o envíanos un WhatsApp:
      </Typography>
      <Typography variant="h6" sx={{ mb: 3 }}>
        📞 <a href="tel:+34605350251" style={{ color: 'inherit', textDecoration: 'none' }}>+34 605 35 02 51</a>
        &nbsp;&nbsp;&nbsp;
        📱 <a href="https://wa.me/34605350251" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>WhatsApp</a>
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Nombre"
          name="name"
          value={formState.name}
          onChange={handleInputChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formState.email}
          onChange={handleInputChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Mensaje"
          name="message"
          value={formState.message}
          onChange={handleInputChange}
          fullWidth
          required
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained">
          Enviar
        </Button>
      </Box>
    </Box>
  );
};

export default Contact;
