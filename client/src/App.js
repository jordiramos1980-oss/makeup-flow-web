import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import Footer from './components/Footer';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material'; // Added AppBar, Toolbar, IconButton, Typography
import { BrowserRouter as Router } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu'; // Added MenuIcon

const drawerWidth = 240; // Define drawerWidth here or import from Sidebar

function App() {
  const [open, setOpen] = useState(true); // State to control sidebar open/close

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <AppBar
            position="fixed"
            sx={{
              width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` }, // Adjust width based on sidebar state
              ml: { sm: `${open ? drawerWidth : 0}px` }, // Adjust margin-left based on sidebar state
              backgroundColor: '#9C27B0', // Violet AppBar
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }} // Removed { display: { sm: 'none' } } to always show menu icon
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                Makeup Flow
              </Typography>
            </Toolbar>
          </AppBar>
          <Sidebar open={open} handleDrawerToggle={handleDrawerToggle} /> {/* Pass open state and toggle function */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` }, // Adjust main content width
              mt: 8, // Margin top to account for AppBar height
              display: 'flex',
              flexDirection: 'column',
              minHeight: 'calc(100vh - 64px)', // Adjust minHeight, assuming AppBar is 64px tall
            }}
          >
            <Main />
            <Footer />
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

