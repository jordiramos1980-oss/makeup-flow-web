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

// Load tokens safely
const loadTokens = () => {
  try {
    if (fs.existsSync(tokenFilePath)) {
      const tokenData = fs.readFileSync(tokenFilePath, 'utf8');
      if (tokenData && tokenData !== '[]') {
        const tokens = JSON.parse(tokenData);
        oAuth2Client.setCredentials(tokens);
        return true;
      }
    }
  } catch (err) {
    console.error('Error cargando tokens de Google:', err.message);
  }
  return false;
};

// --- Helper functions ---
const readBookings = () => JSON.parse(fs.readFileSync(bookingsFilePath, 'utf8'));
const writeBookings = (data) => fs.writeFileSync(bookingsFilePath, JSON.stringify(data, null, 2));
const readCustomers = () => JSON.parse(fs.readFileSync(customersFilePath, 'utf8'));
const writeCustomers = (data) => fs.writeFileSync(customersFilePath, JSON.stringify(data, null, 2));

// --- API Routes ---

app.get('/api/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
  res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(tokenFilePath, JSON.stringify(tokens, null, 2), 'utf8');
    res.send('<h1>¡Autorización completada!</h1><p>Ya puedes volver a tu web y hacer una reserva.</p>');
  } catch (error) {
    console.error('Error en la autorización de Google:', error);
    res.status(500).send('Error en la autorización.');
  }
});

app.get('/api/availability', (req, res) => {
  const { date } = req.query;
  try {
    const bookings = readBookings();
    const bookedTimes = bookings.filter(b => b.date === date).map(b => b.time);
    res.json({ bookedTimes });
  } catch (e) {
    res.json({ bookedTimes: [] });
  }
});

app.post('/api/book', async (req, res) => {
  console.log('--- Nueva solicitud de reserva recibida ---');
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

    // 1. Intentar Google Calendar (Sin bloquear lo demás)
    try {
      if (loadTokens()) {
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
        const startDateTime = dayjs(`${booking.date}T${booking.time}:00`).toISOString();
        const endDateTime = dayjs(`${booking.date}T${booking.time}:00`).add(1, 'hour').toISOString();
        await calendar.events.insert({
          calendarId: 'primary',
          resource: {
            summary: `💄 Cita: ${booking.service} - ${booking.name}`,
            description: `Cliente: ${booking.name} ${booking.surname}\nTeléfono: ${booking.phone}`,
            start: { dateTime: startDateTime, timeZone: 'Europe/Madrid' },
            end: { dateTime: endDateTime, timeZone: 'Europe/Madrid' },
          },
        });
        console.log('Evento guardado en Google Calendar.');
      } else {
        console.log('Google Calendar: Falta autorización del usuario.');
      }
    } catch (calErr) {
      console.error('Error con Google Calendar:', calErr.message);
    }

    // 2. Intentar Enviar Correos
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `💄 Nueva Reserva: ${booking.service} - ${booking.name}`,
        html: `<h2>¡Tienes una nueva reserva!</h2><p>Cliente: ${booking.name}</p><p>Servicio: ${booking.service}</p><p>Fecha: ${booking.date}</p><p>Hora: ${booking.time}</p>`
      };
      await transporter.sendMail(mailOptions);
      console.log('Correo de aviso al dueño enviado.');

      const customerMailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.email,
        subject: '💄 Confirmación de tu reserva en Makeup Flow',
        html: `<h2>¡Reserva Confirmada!</h2><p>Hola ${booking.name}, tu reserva para ${booking.service} el día ${booking.date} a las ${booking.time} se ha realizado con éxito.</p>`
      };
      await transporter.sendMail(customerMailOptions);
      console.log('Correo de confirmación a clienta enviado.');

      res.status(201).json({ message: 'Reserva creada y todo enviado correctamente', booking });
    } catch (mailErr) {
      console.error('Error con los correos:', mailErr.message);
      res.status(201).json({ message: 'Reserva creada, pero falló el envío del correo', booking, error: mailErr.message });
    }

  } catch (error) {
    console.error('Error general en /api/book:', error);
    res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

app.get('/', (req, res) => {
  res.send('Servidor de Makeup Flow funcionando y listo!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
