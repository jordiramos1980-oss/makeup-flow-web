import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { events as initialEvents } from '../data/events';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { addHours, format as formatDate } from 'date-fns';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Define available time slots
const availableTimes = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '16:00', '17:00', '18:00', '19:00', '20:00',
];

const Agenda = () => {
  const [events, setEvents] = useState(initialEvents.map(e => ({...e, start: new Date(e.start), end: new Date(e.end)})));
  const [open, setOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    clientName: '',
    phone: '',
    email: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const availableSlots = useMemo(() => {
    if (!newEvent.date) return [];
    
    const selectedDateStr = formatDate(new Date(newEvent.date), 'yyyy-MM-dd');
    
    const bookedTimes = events
      .filter(event => formatDate(event.start, 'yyyy-MM-dd') === selectedDateStr)
      .map(event => formatDate(event.start, 'HH:mm'));
      
    return availableTimes.filter(time => !bookedTimes.includes(time));
  }, [newEvent.date, events]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewEvent({ title: '', date: '', time: '', clientName: '', phone: '', email: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleAddEvent = async () => {
    const { title, date, time, clientName, email, phone } = newEvent;
    
    if (title && date && time && clientName && email && phone) {
      const start = new Date(`${date}T${time}`);
      const end = addHours(start, 1);

      const appointmentData = { title, start, end, clientName, email, phone };

      setEvents([...events, appointmentData]);

      try {
        await fetch('http://localhost:3001/send-appointment-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData),
        });
      } catch (error) {
        console.error('Error sending confirmation email:', error);
      }
      
      const message = `Hola ${clientName}, te recordamos tu cita para ${title} el ${start.toLocaleString()}.`;
      const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, '_blank');

      setSnackbarOpen(true);
      handleClose();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Agenda de Clientes
        </Typography>
        <Button variant="contained" onClick={handleOpen}>
          Crear Nueva Cita
        </Button>
      </Box>
      <Box sx={{ height: 'calc(100vh - 200px)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="es"
          style={{ height: '100%' }}
        />
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Crear Nueva Cita</DialogTitle>
        <DialogContent>
          <TextField name="clientName" label="Nombre y Apellidos" type="text" fullWidth required margin="dense" onChange={handleInputChange} />
          <TextField name="phone" label="Teléfono (con código de país)" type="text" fullWidth required margin="dense" onChange={handleInputChange} />
          <TextField name="email" label="Email" type="email" fullWidth required margin="dense" onChange={handleInputChange} />
          <TextField name="title" label="Título de la Cita" type="text" fullWidth required margin="dense" onChange={handleInputChange} />
          <TextField name="date" label="Día de la Cita" type="date" fullWidth required margin="dense" InputLabelProps={{ shrink: true }} onChange={handleInputChange} />
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="time-slot-label">Hora</InputLabel>
            <Select labelId="time-slot-label" name="time" value={newEvent.time} label="Hora" onChange={handleInputChange} disabled={!newEvent.date}>
              {availableSlots.length > 0 ? (
                availableSlots.map(time => <MenuItem key={time} value={time}>{time}</MenuItem>)
              ) : (
                <MenuItem disabled>No hay horas disponibles para este día</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleAddEvent}>Guardar Cita</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          ¡Cita creada y notificaciones enviadas!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Agenda;
