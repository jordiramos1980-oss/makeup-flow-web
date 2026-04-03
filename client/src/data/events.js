import { addHours } from 'date-fns';

export const events = [
  {
    title: 'Cita con Juan Perez',
    start: new Date(2025, 11, 22, 10, 0, 0),
    end: addHours(new Date(2025, 11, 22, 10, 0, 0), 1),
  },
  {
    title: 'Cita con Maria Garcia',
    start: new Date(2025, 11, 23, 14, 0, 0),
    end: addHours(new Date(2025, 11, 23, 14, 0, 0), 1),
  },
];
