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
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

const Reserva = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
  });
  const [bookingStatus, setBookingStatus] = useState(null);
  const [realBookedTimes, setRealBookedTimes] = useState([]);

  const serviceOptions = ['Maquillaje', 'Manicura', 'Masaje'];
  const availableTimes = {
    morning: ['09:00', '10:00', '11:00', '12:00', '13:00'],
    afternoon: ['17:00', '18:00', '19:00'],
  };

  const API_URL = 'https://makeup-flow-web.onrender.com';

  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (selectedDate) {
        try {
          const formattedDate = selectedDate.format('YYYY-MM-DD');
          const response = await fetch(`${API_URL}/api/availability?date=${formattedDate}`);
          if (response.ok) {
            const data = await response.json();
            setRealBookedTimes(data.bookedTimes || []);
          }
        } catch (error) {
          console.error('Error al obtener disponibilidad:', error);
        }
      }
    };
    fetchBookedTimes();
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus({ type: 'info', message: 'Enviando reserva...' });

    if (!selectedService || !selectedDate || !selectedTime || !formData.name || !formData.email) {
      alert('Por favor, completa los campos obligatorios.');
      setBookingStatus(null);
      return;
    }

    const bookingDetails = {
      service: selectedService,
      date: selectedDate.format('YYYY-MM-DD'),
      time: selectedTime,
      ...formData,
    };

    try {
      const response = await fetch(`${API_URL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingDetails),
      });

      const data = await response.json();

      if (response.ok) {
        setBookingStatus({ type: 'success', message: data.message });
        // Limpiar formulario
        setSelectedDate(null);
        setSelectedTime('');
        setSelectedService('');
        setFormData({ name: '', surname: '', phone: '', email: '' });
      } else {
        setBookingStatus({ type: 'error', message: data.message || 'Error en el servidor' });
      }
    } catch (error) {
      setBookingStatus({ type: 'error', message: 'Error de conexión con el servidor.' });
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: '#FFEBEE' }}>
      <Typography variant="h4" gutterBottom>Reserva tu Cita</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>1. Servicio</InputLabel>
              <Select value={selectedService} label="1. Servicio" onChange={(e) => setSelectedService(e.target.value)}>
                {serviceOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DatePicker label="2. Día" value={selectedDate} onChange={(v) => setSelectedDate(v)} renderInput={(p) => <TextField {...p} fullWidth />} />
            </LocalizationProvider>
          </Grid>
          {selectedDate && (
            <Grid item xs={12}>
              <FormLabel>3. Hora</FormLabel>
              <RadioGroup row value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                {[...availableTimes.morning, ...availableTimes.afternoon].map((t) => (
                  <FormControlLabel key={t} value={t} control={<Radio />} label={t} disabled={realBookedTimes.includes(t)} />
                ))}
              </RadioGroup>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="h6">4. Tus Datos</Typography>
            <TextField label="Nombre" fullWidth margin="normal" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            <TextField label="Teléfono" fullWidth margin="normal" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
            <TextField label="Email" fullWidth margin="normal" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required type="email" />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" size="large">Confirmar Reserva</Button>
          </Grid>
        </Grid>
      </form>
      {bookingStatus && (
        <Alert severity={bookingStatus.type === 'info' ? 'info' : bookingStatus.type} sx={{ mt: 3 }}>
          {bookingStatus.message}
        </Alert>
      )}
    </Box>
  );
};

export default Reserva;
