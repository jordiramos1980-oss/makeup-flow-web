import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Alert,
  Link as MuiLink,
  Select, // Added Select
  MenuItem, // Added MenuItem
  InputLabel, // Added InputLabel
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Import Spanish locale


const Reserva = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState(''); // New state for selected service
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
  });
  const [bookingStatus, setBookingStatus] = useState(null); // { type: 'success' | 'error', message: string, whatsappLink?: string }
  const [realBookedTimes, setRealBookedTimes] = useState([]); // State to store real booked times

  const serviceOptions = ['Maquillaje', 'Manicura', 'Masaje']; // Hardcoded service options for now
  const availableTimes = {
    morning: ['09:00', '10:00', '11:00', '12:00', '13:00'],
    afternoon: ['17:00', '18:00', '19:00'],
  };

  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (selectedDate) {
        try {
          const formattedDate = selectedDate.format('YYYY-MM-DD');
          const response = await fetch(`https://makeup-flow-web.onrender.com/api/availability?date=${formattedDate}`);
          if (response.ok) {
            const data = await response.json();
            setRealBookedTimes(data.bookedTimes);
          } else {
            console.error('Error fetching booked times:', response.statusText);
            setRealBookedTimes([]);
          }
        } catch (error) {
          console.error('Network error fetching booked times:', error);
          setRealBookedTimes([]);
        }
      } else {
        setRealBookedTimes([]);
      }
    };
    fetchBookedTimes();
  }, [selectedDate]); // Refetch when selectedDate changes

  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
    setSelectedTime(''); // Reset time when date changes
    setBookingStatus(null); // Clear status when date changes
  };

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
    setBookingStatus(null); // Clear status when time changes
  };

  const handleServiceChange = (event) => {
    setSelectedService(event.target.value);
    setBookingStatus(null); // Clear status when service changes
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setBookingStatus(null); // Clear status when form data changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus(null); // Clear previous status
    if (!selectedService || !selectedDate || !selectedTime || !formData.name || !formData.surname || !formData.phone || !formData.email) {
      alert('Por favor, rellena todos los campos.');
      return;
    }
    const bookingDetails = {
      service: selectedService, // Include selected service
      date: selectedDate.format('YYYY-MM-DD'),
      time: selectedTime,
      ...formData,
    };

    try {
      const response = await fetch('https://makeup-flow-web.onrender.com/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingDetails),
      });

      if (response.ok) {
        const data = await response.json();
        setBookingStatus({
          type: 'success',
          message: '¡Reserva realizada con éxito! Recibirás un email de confirmación.',
          whatsappLink: data.whatsappLink,
        });
        console.log('Reserva confirmada:', data);
        // Clear form after successful submission
        setSelectedDate(null);
        setSelectedTime('');
        setSelectedService(''); // Clear selected service
        setFormData({
          name: '',
          surname: '',
          phone: '',
          email: '',
        });
        // Refetch booked times to update UI after a successful booking
        const formattedDate = selectedDate.format('YYYY-MM-DD');
        const updatedResponse = await fetch(`https://makeup-flow-web.onrender.com/api/availability?date=${formattedDate}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setRealBookedTimes(updatedData.bookedTimes);
        }
      } else {
        const errorData = await response.json();
        setBookingStatus({
          type: 'error',
          message: `Error al realizar la reserva: ${errorData.message || response.statusText}`,
        });
        console.error('Error al enviar la reserva:', errorData);
      }
    } catch (error) {
      console.error('Error de red al enviar la reserva:', error);
      setBookingStatus({ type: 'error', message: 'Error de conexión. Inténtalo de nuevo más tarde.' });
    }
  };

  // User requested Monday-Saturday, so disable Sunday only.
  const disableSunday = (date) => {
    return date.day() === 0; // Disable Sunday (0)
  };

  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh', // Ensure it covers the full viewport height
        backgroundColor: '#FFEBEE', // Set light pink background color
        color: '#000000', // Black text for contrast on light background
      }}
    >
      <Typography variant="h4" gutterBottom>
        Reserva tu Cita
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Service Selection Dropdown */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="service-select-label">1. Selecciona el Servicio</InputLabel>
              <Select
                labelId="service-select-label"
                id="service-select"
                value={selectedService}
                label="1. Selecciona el Servicio"
                onChange={handleServiceChange}
              >
                {serviceOptions.map((service) => (
                  <MenuItem key={service} value={service}>
                    {service}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Picker */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <FormLabel component="legend">2. Selecciona el día</FormLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DatePicker
                  label="Fecha"
                  value={selectedDate}
                  onChange={handleDateChange}
                  shouldDisableDate={disableSunday} // Only disable Sunday
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      readOnly
                    />
                  )}
                />
              </LocalizationProvider>
            </FormControl>
          </Grid>

          {/* Time Slot Selection */}
          <Grid item xs={12} md={6}>
            {selectedDate && (
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">3. Selecciona la hora (L-S)</FormLabel>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Mañana (09:00 - 14:00)
                  </Typography>
                  <RadioGroup
                    aria-label="morning-time"
                    name="morning-time-group"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    row
                  >
                    {availableTimes.morning.map((time) => (
                      <FormControlLabel
                        key={time}
                        value={time}
                        control={<Radio />}
                        label={time}
                        disabled={realBookedTimes.includes(time)} // Use realBookedTimes
                      />
                    ))}
                  </RadioGroup>

                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Tarde (17:00 - 20:00)
                  </Typography>
                  <RadioGroup
                    aria-label="afternoon-time"
                    name="afternoon-time-group"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    row
                  >
                    {availableTimes.afternoon.map((time) => (
                      <FormControlLabel
                        key={time}
                        value={time}
                        control={<Radio />}
                        label={time}
                        disabled={realBookedTimes.includes(time)} // Use realBookedTimes
                      />
                    ))}
                  </RadioGroup>
                </Box>
              </FormControl>
            )}
          </Grid>

          {/* Personal Details Form */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              4. Tus Datos Personales
            </Typography>
            <TextField
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Apellidos"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Correo Electrónico"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              type="email"
              required
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={!selectedService || !selectedDate || !selectedTime || !formData.name || !formData.surname || !formData.phone || !formData.email}
            >
              Confirmar Reserva
            </Button>
          </Grid>
        </Grid>
      </form>

      {bookingStatus && (
        <Box sx={{ mt: 4 }}>
          {bookingStatus.type === 'success' ? (
            <Alert severity="success">
              <Typography variant="h6">{bookingStatus.message}</Typography>
              {bookingStatus.whatsappLink && (
                <Typography sx={{ mt: 1 }}>
                  Puedes confirmarla también por WhatsApp:{' '}
                  <MuiLink href={bookingStatus.whatsappLink} target="_blank" rel="noopener noreferrer">
                    Enviar WhatsApp
                  </MuiLink>
                </Typography>
              )}
            </Alert>
          ) : (
            <Alert severity="error">
              <Typography variant="h6">{bookingStatus.message}</Typography>
            </Alert>
          )}
        </Box>
      )}


    </Box>
  );
};

export default Reserva;
