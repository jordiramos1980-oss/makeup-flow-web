import React from 'react';
import { Typography, Box } from '@mui/material';

const Promotions = () => {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Ofertas y Promociones
      </Typography>
      <Box
        component="img"
        src="/assets/images/promociones/oferta_new_1.png"
        alt="Ofertas y Promociones"
        sx={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
          boxShadow: 3,
          mt: 2
        }}
      />
      <Box
        component="img"
        src="/assets/images/promociones/oferta_new_2.png"
        alt="Ofertas y Promociones 2"
        sx={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
          boxShadow: 3,
          mt: 4 // Add more margin top for spacing
        }}
      />
    </Box>
  );
};

export default Promotions;
