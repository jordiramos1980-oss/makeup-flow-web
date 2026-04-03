console.log('--- SERVER INDEX.JS (VERSION 2025-12-22T13:40Z) IS EXECUTING ---');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { google } = require('googleapis'); // Import googleapis
const dayjs = require('dayjs'); // Import dayjs
require('dotenv').config();

const app = express();
const port = 3002; // Changed port to 3002

app.use(cors());
app.use(express.json());

// Path to store bookings data
const bookingsFilePath = path.join(__dirname, 'bookings.json');
// Path to store customers data
const customersFilePath = path.join(__dirname, 'customers.json');
// Path to store Google API tokens
const tokenFilePath = path.join(__dirname, 'token.json');
const emailTemplatePath = path.join(__dirname, 'emailTemplate.html');
let emailHtmlTemplate = '';

try {
  emailHtmlTemplate = fs.readFileSync(emailTemplatePath, 'utf8');
  console.log('Email template loaded successfully.');
} catch (error) {
  console.error('Error loading email template:', error);
  // Fallback or handle error appropriately
}


// Helper function to read bookings from file
const readBookings = () => {
  if (fs.existsSync(bookingsFilePath)) {
    const data = fs.readFileSync(bookingsFilePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
};

// Helper function to write bookings to file
const writeBookings = (bookings) => {
  fs.writeFileSync(bookingsFilePath, JSON.stringify(bookings, null, 2), 'utf8');
};

// Helper function to read customers from file
const readCustomers = () => {
  if (fs.existsSync(customersFilePath)) {
    const data = fs.readFileSync(customersFilePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
};

// Helper function to write customers to file
const writeCustomers = (customers) => {
  fs.writeFileSync(customersFilePath, JSON.stringify(customers, null, 2), 'utf8');
};

// --- Google Calendar Integration Setup ---
// Replace with your actual credentials from Google Cloud Console
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // <--- IMPORTANT: Replace this
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // <--- IMPORTANT: Replace this
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // Must match Authorized redirect URIs in Google Console and port 3002

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Check if we have stored tokens
let googleTokens = null;
if (fs.existsSync(tokenFilePath)) {
  const tokenData = fs.readFileSync(tokenFilePath, 'utf8');
  googleTokens = JSON.parse(tokenData);
  oAuth2Client.setCredentials(googleTokens);
  console.log('Google tokens loaded from file.');
}

// Function to save tokens to file
const saveTokens = (tokens) => {
  fs.writeFileSync(tokenFilePath, JSON.stringify(tokens, null, 2), 'utf8');
  console.log('Google tokens saved to file.');
};

// --- Google Calendar Authorization Endpoints ---
console.log('--- Attempting to register /api/auth/google route ---'); // Added log for debugging
app.get('/api/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  const authorizationUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    scope: scopes,
    prompt: 'consent', // Always ask for consent to ensure refresh token is provided
  });
  res.redirect(authorizationUrl);
});




app.get('/api/auth/google/callback', async (req, res) => {

  const { code } = req.query;

  try {

    const { tokens } = await oAuth2Client.getToken(code);

    oAuth2Client.setCredentials(tokens);

    googleTokens = tokens; // Assign the new tokens here

    saveTokens(tokens); // Save the initial tokens

    res.send('Autenticación con Google Calendar completada con éxito! Puedes cerrar esta ventana.');

  } catch (error) {

    console.error('Error during Google Calendar authentication:', error);

    console.error(error); // Add this line to log the full error object

    res.status(500).send('Error during Google Calendar authentication.');

  }

});



// If tokens expire, refresh them

oAuth2Client.on('tokens', (tokens) => {

  if (googleTokens) { // Only update if googleTokens is already initialized

    if (tokens.refresh_token) {

      googleTokens.refresh_token = tokens.refresh_token;

    }

    googleTokens.access_token = tokens.access_token;

    googleTokens.expiry_date = tokens.expiry_date;

    saveTokens(googleTokens);

  } else {

    // This case should ideally not happen for refreshes, but for safety.

    // If googleTokens is null here, it means we didn't load from file on startup.

    // So, we just save the new tokens and initialize googleTokens.

    console.warn("oAuth2Client.on('tokens') called but googleTokens was not initialized. Initializing now.");

    googleTokens = tokens;

    saveTokens(tokens);

  }

});

// --- End Google Calendar Integration Setup ---


// Create a test account on Ethereal.email to get credentials
// Replace with your own email credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'joany.bailey@ethereal.email',
      pass: '6C5nJqPZ8qjKjJ8g76'
  },
  tls: {
    rejectUnauthorized: false // <--- Added to fix self-signed certificate error
  }
});



app.get('/api/availability', (req, res) => {
  const { date } = req.query; // Expects date in YYYY-MM-DD format
  if (!date) {
    return res.status(400).json({ message: 'Date query parameter is required.' });
  }

  try {
    const allBookings = readBookings();
    const bookedTimes = allBookings
      .filter(booking => booking.date === date)
      .map(booking => booking.time);

    res.status(200).json({ bookedTimes });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
});

app.post('/api/book', async (req, res) => {
  const bookingData = req.body;
  const { date, time, name, surname, email, phone, service } = bookingData; // Added 'surname'

  if (!date || !time || !name || !surname || !email || !phone || !service) { // Added 'surname' to validation
    return res.status(400).json({ message: 'Missing required booking details.' });
  }

  try {
    let customers = readCustomers();
    let customer = customers.find(c => c.email === email || c.phone === phone);
    let customerId;

    if (!customer) {
      // Create new customer
      customerId = uuidv4();
      customer = {
        id: customerId,
        name,
        surname,
        email,
        phone,
        createdAt: new Date().toISOString(),
        bookings: [], // Initialize with an empty array of booking IDs
      };
      customers.push(customer);
      writeCustomers(customers);
      console.log('New customer created:', customer);
    } else {
      customerId = customer.id;
      // Update existing customer info if necessary (e.g., if phone or name changed)
      customer.name = name;
      customer.surname = surname;
      customer.phone = phone;
      // You might want to update email too if it's the same person
      writeCustomers(customers);
      console.log('Existing customer updated:', customer);
    }

    const bookings = readBookings();

    // Basic availability check: Prevent double booking the exact same date and time
    const isAlreadyBooked = bookings.some(
      (booking) => booking.date === date && booking.time === time
    );

    if (isAlreadyBooked) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another.' });
    }

    const newBooking = {
      id: uuidv4(), // Generate a unique ID for the booking
      customerId: customerId, // Link booking to customer
      ...bookingData, // Includes date, time, name, surname, email, phone, service
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    writeBookings(bookings);
    console.log('New booking saved:', newBooking);

    // Link booking to customer's history
    customer.bookings.push(newBooking.id);
    writeCustomers(customers); // Update customers with new booking ID

    // --- Google Calendar Event Creation ---
    if (googleTokens) {
      try {
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client }); // Moved calendar creation here
        const dateTimeStart = dayjs(`${date} ${time}`).toDate();
        const dateTimeEnd = dayjs(dateTimeStart).add(1, 'hour').toDate(); // Assuming 1 hour appointment

        const event = {
          summary: `${service} con ${name}`, // Added 'service'
          description: `Servicio: ${service}\nCliente: ${name} ${bookingData.surname}\nTeléfono: ${phone}\nEmail: ${email}`, // Added 'service'
          start: {
            dateTime: dateTimeStart.toISOString(),
            timeZone: 'Europe/Madrid', // Adjust timezone as needed
          },
          end: {
            dateTime: dateTimeEnd.toISOString(),
            timeZone: 'Europe/Madrid', // Adjust timezone as needed
          },
          attendees: [{ email: email }],
        };

        const response = await calendar.events.insert({
          calendarId: 'primary', // 'primary' refers to the user's primary calendar
          resource: event,
        });
        console.log('Google Calendar event created:', response.data.htmlLink);
      } catch (calendarError) {
        console.error('Error creating Google Calendar event:', calendarError);
        // Continue with booking even if calendar event fails
      }
    } else {
      console.warn('Google Calendar not authorized. Please visit /api/auth/google to authorize.');
    }
    // --- End Google Calendar Event Creation ---

    // --- Send Email Confirmation ---
    const mailOptions = {
      from: '"Maria Muñoz Pujol" <no-reply@makeupflow.com>', // Sender email
      to: email,
      subject: `Confirmación de Cita: ${service}`, // Added 'service' to subject
      html: emailHtmlTemplate
        .replace('{{name}}', name)
        .replace('{{service}}', service)
        .replace('{{date}}', date)
        .replace('{{time}}', time),
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent: ' + info.response);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Decide whether to return an error to the client if email fails
      // For now, we'll log it but still consider the booking successful
    }
    // --- End Email Confirmation ---

    const whatsappMessage = encodeURIComponent(
      `¡Hola ${name}! Tu cita para **${service}** el ${date} a las ${time} ha sido confirmada. ¡Te esperamos!` // Added 'service'
    );
    const whatsappLink = `https://wa.me/34605350251?text=${whatsappMessage}`; // Using Maria's contact number

    res.status(201).json({ message: 'Booking created successfully', booking: newBooking, whatsappLink: whatsappLink });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ message: 'Error saving booking', error: error.message });
  }
});

// New API endpoint to get all customers
app.get('/api/customers', (req, res) => {
  try {
    const customers = readCustomers();
    // For security, you might want to omit sensitive info like phone/email if not needed
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
});

// New API endpoint to get bookings for a specific customer
app.get('/api/customers/:id/bookings', (req, res) => {
  const customerId = req.params.id;
  try {
    const customers = readCustomers();
    const customer = customers.find(c => c.id === customerId);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const allBookings = readBookings();
    const customerBookings = allBookings.filter(booking => booking.customerId === customerId);

    res.status(200).json(customerBookings);
  } catch (error) {
    console.error(`Error fetching bookings for customer ${customerId}:`, error);
    res.status(500).json({ message: 'Error fetching customer bookings', error: error.message });
  }
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
