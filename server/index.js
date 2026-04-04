console.log('--- SERVER INDEX.JS IS EXECUTING ---');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { google } = require('googleapis');
const dayjs = require('dayjs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Path to store data files
const bookingsFilePath = path.join(__dirname, 'bookings.json');
const customersFilePath = path.join(__dirname, 'customers.json');
const tokenFilePath = path.join(__dirname, 'token.json');
const emailTemplatePath = path.join(__dirname, 'emailTemplate.html');

// Ensure JSON files exist
[bookingsFilePath, customersFilePath, tokenFilePath].forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]', 'utf8');
  }
});

let emailHtmlTemplate = '';
try {
  if (fs.existsSync(emailTemplatePath)) {
    emailHtmlTemplate = fs.readFileSync(emailTemplatePath, 'utf8');
    console.log('Email template loaded successfully.');
  } else {
    emailHtmlTemplate = '<h1>Nueva Reserva de Makeup Flow</h1><p>Has recibido una nueva reserva.</p>';
  }
} catch (error) {
  console.error('Error loading email template:', error);
}

// --- Configuración del Cartero (Nodemailer) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- Helper functions ---
const readBookings = () => JSON.parse(fs.readFileSync(bookingsFilePath, 'utf8'));
const writeBookings = (data) => fs.writeFileSync(bookingsFilePath, JSON.stringify(data, null, 2));
const readCustomers = () => JSON.parse(fs.readFileSync(customersFilePath, 'utf8'));
const writeCustomers = (data) => fs.writeFileSync(customersFilePath, JSON.stringify(data, null, 2));

// --- API Routes ---

app.get('/api/availability', (req, res) => {
  const { date } = req.query;
  const bookings = readBookings();
  const bookedTimes = bookings.filter(b => b.date === date).map(b => b.time);
  res.json({ bookedTimes });
});

app.post('/api/book', async (req, res) => {
  try {
    const booking = { id: uuidv4(), ...req.body };
    const bookings = readBookings();
    bookings.push(booking);
    writeBookings(bookings);
    
    // Guardar cliente
    const customers = readCustomers();
    if (!customers.find(c => c.email === booking.email)) {
      customers.push({ id: uuidv4(), name: booking.name, email: booking.email, phone: booking.phone });
      writeCustomers(customers);
    }

    // --- ENVIAR CORREO DE AVISO ---
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Te lo mandas a ti mismo
      subject: `💄 Nueva Reserva: ${booking.service} - ${booking.name}`,
      html: `
        <h2>¡Tienes una nueva reserva!</h2>
        <p><strong>Cliente:</strong> ${booking.name} ${booking.surname}</p>
        <p><strong>Servicio:</strong> ${booking.service}</p>
        <p><strong>Fecha:</strong> ${booking.date}</p>
        <p><strong>Hora:</strong> ${booking.time}</p>
        <p><strong>Teléfono:</strong> ${booking.phone}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Correo de aviso enviado con éxito.');
      res.status(201).json({ message: 'Reserva creada y aviso enviado correctamente', booking });
    } catch (mailError) {
      console.error('Error al enviar el correo de aviso:', mailError);
      res.status(201).json({ message: 'Reserva creada, pero el correo de aviso falló', booking, error: mailError.message });
    }
  } catch (error) {
    console.error('Error en la reserva:', error);
    res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

app.get('/', (req, res) => {
  res.send('Servidor de Makeup Flow listo para enviar correos!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
