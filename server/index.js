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
    emailHtmlTemplate = '<h1>Reserva Confirmada</h1><p>Gracias por tu reserva.</p>';
  }
} catch (error) {
  console.error('Error loading email template:', error);
}

// --- Helper functions ---
const readBookings = () => JSON.parse(fs.readFileSync(bookingsFilePath, 'utf8'));
const writeBookings = (data) => fs.writeFileSync(bookingsFilePath, JSON.stringify(data, null, 2));
const readCustomers = () => JSON.parse(fs.readFileSync(customersFilePath, 'utf8'));
const writeCustomers = (data) => fs.writeFileSync(customersFilePath, JSON.stringify(data, null, 2));

// --- Google Calendar Setup ---
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Load tokens if they exist
if (fs.existsSync(tokenFilePath)) {
  const tokenData = fs.readFileSync(tokenFilePath, 'utf8');
  if (tokenData && tokenData !== '[]') {
    oAuth2Client.setCredentials(JSON.parse(tokenData));
  }
}

// --- API Routes ---

// 1. Get Availability
app.get('/api/availability', (req, res) => {
  const { date } = req.query;
  const bookings = readBookings();
  const bookedTimes = bookings
    .filter(b => b.date === date)
    .map(b => b.time);
  res.json({ bookedTimes });
});

// 2. Create Booking
app.post('/api/book', async (req, res) => {
  const booking = { id: uuidv4(), ...req.body };
  const bookings = readBookings();
  bookings.push(booking);
  writeBookings(bookings);
  
  // Guardar como cliente también
  const customers = readCustomers();
  if (!customers.find(c => c.email === booking.email)) {
    customers.push({ id: uuidv4(), name: booking.name, email: booking.email, phone: booking.phone });
    writeCustomers(customers);
  }

  res.status(201).json({ message: 'Reserva creada', booking });
});

app.get('/', (req, res) => {
  res.send('Servidor de Makeup Flow funcionando correctamente en Render!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
