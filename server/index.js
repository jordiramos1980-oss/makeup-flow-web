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

// Ensure JSON files exist
[bookingsFilePath, customersFilePath, tokenFilePath].forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]', 'utf8');
  }
});

// --- Configuración del Cartero (Nodemailer) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- Google Calendar Setup ---
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const loadTokens = () => {
  try {
    if (fs.existsSync(tokenFilePath)) {
      const tokenData = fs.readFileSync(tokenFilePath, 'utf8');
      if (tokenData && tokenData !== '[]') {
        oAuth2Client.setCredentials(JSON.parse(tokenData));
        return true;
      }
    }
  } catch (err) {
    console.error('Error cargando tokens:', err.message);
  }
  return false;
};

// --- Helper functions ---
const readBookings = () => JSON.parse(fs.readFileSync(bookingsFilePath, 'utf8') || '[]');
const writeBookings = (data) => fs.writeFileSync(bookingsFilePath, JSON.stringify(data, null, 2));
const readCustomers = () => JSON.parse(fs.readFileSync(customersFilePath, 'utf8') || '[]');
const writeCustomers = (data) => fs.writeFileSync(customersFilePath, JSON.stringify(data, null, 2));

// --- API Routes ---

app.get('/api/auth/google', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/calendar.events'], prompt: 'consent' });
  res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { tokens } = await oAuth2Client.getToken(req.query.code);
    fs.writeFileSync(tokenFilePath, JSON.stringify(tokens, null, 2));
    res.send('<h1>Autorización completada</h1>');
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/api/availability', (req, res) => {
  const { date } = req.query;
  const bookings = readBookings();
  const bookedTimes = bookings.filter(b => b.date === date).map(b => b.time);
  res.json({ bookedTimes });
});

app.post('/api/book', async (req, res) => {
  console.log('Nueva reserva recibida:', req.body.name);
  try {
    const booking = { id: uuidv4(), ...req.body };
    const bookings = readBookings();
    bookings.push(booking);
    writeBookings(bookings);
    
    // Respondemos RÁPIDO a la web para que no se cuelgue
    res.status(201).json({ message: '¡Reserva realizada con éxito!', booking });

    // Todo lo demás lo hacemos "en silencio" por detrás
    setImmediate(async () => {
      // 1. Google Calendar
      try {
        if (loadTokens()) {
          const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
          await calendar.events.insert({
            calendarId: 'primary',
            resource: {
              summary: `💄 Cita: ${booking.service} - ${booking.name}`,
              description: `Tel: ${booking.phone}`,
              start: { dateTime: dayjs(`${booking.date}T${booking.time}:00`).toISOString(), timeZone: 'Europe/Madrid' },
              end: { dateTime: dayjs(`${booking.date}T${booking.time}:00`).add(1, 'hour').toISOString(), timeZone: 'Europe/Madrid' },
            },
          });
          console.log('Calendario actualizado.');
        }
      } catch (e) { console.error('Fallo Calendario:', e.message); }

      // 2. Correos
      try {
        const mailOptions = { from: process.env.EMAIL_USER, to: process.env.EMAIL_USER, subject: '💄 Nueva Reserva', html: `<p>Nueva cita de ${booking.name} el ${booking.date} a las ${booking.time}</p>` };
        await transporter.sendMail(mailOptions);
        
        const clientOptions = { from: process.env.EMAIL_USER, to: booking.email, subject: 'Confirmación Reserva', html: `<p>Hola ${booking.name}, cita confirmada.</p>` };
        await transporter.sendMail(clientOptions);
        console.log('Correos enviados.');
      } catch (e) { console.error('Fallo Correos:', e.message); }
    });

  } catch (error) {
    console.error('Error general:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Error' });
  }
});

app.get('/', (req, res) => res.send('Servidor Makeup Flow Activo!'));

app.listen(port, () => console.log(`Puerto ${port}`));
