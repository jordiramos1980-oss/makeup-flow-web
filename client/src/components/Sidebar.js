import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SpaIcon from '@mui/icons-material/Spa';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MailIcon from '@mui/icons-material/Mail';
import logoImage from '../assets/images/logo.jpg';
import SocialLinks from './SocialLinks'; // Import the new component


const drawerWidth = 240;

const menuItems = [
  { text: 'Inicio', icon: <HomeIcon />, path: '/' },
  { text: 'Tratamientos', icon: <SpaIcon />, path: '/tratamientos' },
  { text: 'Ofertas y Promociones', icon: <LocalOfferIcon />, path: '/promociones' },
  { text: 'Reserva', icon: <EventIcon />, path: '/reserva' },
];

const Sidebar = ({ open, handleDrawerToggle }) => {
  return (
    <Drawer
      variant="persistent" // Changed to persistent
      open={open} // Added open prop
      onClose={handleDrawerToggle} // Added onClose prop
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#FFC0CB', // Bubblegum pink
          display: 'flex',
          flexDirection: 'column',
          // Transition properties for smooth open/close
          transition: (theme) =>
            theme.transitions.create('transform', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
          Makeup Flow
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem button component={Link} to={item.path} key={item.text} onClick={handleDrawerToggle}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <SocialLinks variant="sidebar" /> {/* Moved here */}
      <Box sx={{ marginTop: 'auto', textAlign: 'center' }}>
        <Box
          component="img"
          src={logoImage}
          alt="Logo"
          sx={{
            width: '80%', // Make the logo responsive to the sidebar width
            height: 'auto',
            borderRadius: '8px',
            p: 2,
          }}
        />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
