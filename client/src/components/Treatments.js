import React from 'react';
import { Card, CardContent, Typography, Grid, Box, CardMedia } from '@mui/material';
import { treatments } from '../data/treatments';

const Treatments = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tratamientos
      </Typography>
      <Grid container spacing={3}>
        {treatments.map((treatment) => (
          <Grid item xs={12} sm={6} md={4} key={treatment.id}>
            <Card>
              {treatment.image && (
                <CardMedia
                  component="img"
                  height="140"
                  image={treatment.image}
                  alt={treatment.name}
                />
              )}
              <CardContent>
                <Typography variant="h5" component="div">
                  {treatment.name}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {treatment.price}
                </Typography>
                <Typography variant="body2">
                  {treatment.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Treatments;
