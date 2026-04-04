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

// --- Google Calendar Setup ---
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Load tokens if they exist
const loadTokens = () => {
  if (fs.existsSync(tokenFilePath)) {
    const tokenData = fs.readFileSync(tokenFilePath, 'utf8');
    if (tokenData && tokenData !== '[]') {
      const tokens = JSON.parse(tokenData);
      oAuth2Client.setCredentials(tokens);
      console.log('Google tokens cargados con éxito.');
      return true;
    }
  }
  return false;
};

// --- Helper functions ---
const readBookings = () => JSON.parse(fs.readFileSync(bookingsFilePath, 'utf8'));
const writeBookings = (data) => fs.writeFileSync(bookingsFilePath, JSON.stringify(data, null, 2));
const readCustomers = () => JSON.parse(fs.readFileSync(customersFilePath, 'utf8'));
const writeCustomers = (data) => fs.writeFileSync(customersFilePath, JSON.stringify(data, null, 2));

// --- API Routes ---

// 1. Iniciar autorización de Google
app.get('/api/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
  res.redirect(url);
});

// 2. Callback de autorización de Google
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(tokenFilePath, JSON.stringify(tokens, null, 2), 'utf8');
    res.send('<h1>¡Autorización completada!</h1><p>Ya puedes cerrar esta ventana.</p>');
  } catch (error) {
    console.error('Error en la autorización de Google:', error);
    res.status(500).send('Error en la autorización.');
  }
});

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

    // --- GOOGLE CALENDAR EVENT ---
    const tokensCargados = loadTokens();
    if (tokensCargados) {
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
      const startDateTime = dayjs(`${booking.date}T${booking.time}:00`).toISOString();
      const endDateTime = dayjs(`${booking.date}T${booking.time}:00`).add(1, 'hour').toISOString();

      const event = {
        summary: `💄 Cita: ${booking.service} - ${booking.name}`,
        description: `Cliente: ${booking.name} ${booking.surname}\nTeléfono: ${booking.phone}\nEmail: ${booking.email}`,
        start: { dateTime: startDateTime, timeZone: 'Europe/Madrid' },
        end: { dateTime: endDateTime, timeZone: 'Europe/Madrid' },
      };

      try {
        await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
        });
        console.log('Evento guardado en Google Calendar.');
      } catch (calError) {
        console.error('Error al guardar en el calendario:', calError);
      }
    } else {
      console.log('No se pudo guardar en el calendario porque falta la autorización.');
    }

    // --- ENVIAR CORREOS ---
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `💄 Nueva Reserva: ${booking.service} - ${booking.name}`,
      html: `<h2>¡Tienes una nueva reserva!</h2><p>Cliente: ${booking.name}</p><p>Servicio: ${booking.service}</p><p>Fecha: ${booking.date}</p><p>Hora: ${booking.time}</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
      const customerMailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.email,
        subject: '💄 Confirmación de tu reserva en Makeup Flow',
        html: `<h2>¡Reserva Confirmada!</h2><p>Hola ${booking.name}, gracias por confiar en nosotros.</p><p>Servicio: ${booking.service}</p><p>Fecha: ${booking.date}</p><p>Hora: ${booking.time}</p>`
      };
      await transporter.sendMail(customerMailOptions);
      res.status(201).json({ message: 'Reserva creada y todo enviado', booking });
    } catch (mailError) {
      console.error('Error al enviar los correos:', mailError);
      res.status(201).json({ message: 'Reserva creada, pero el correo falló', booking });
    }
  } catch (error) {
    console.error('Error en la reserva:', error);
    res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

app.get('/', (req, res) => {
  res.send('Servidor de Makeup Flow listo para el calendario!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
