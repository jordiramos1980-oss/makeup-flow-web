import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        p: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
      component="footer"
    >
      <Typography variant="body2" color="text.secondary" align="center">
        © {new Date().getFullYear()} Makeup Flow
      </Typography>
    </Box>
  );
};

export default Footer;
