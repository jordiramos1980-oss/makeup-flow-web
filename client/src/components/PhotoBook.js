import React from 'react';
import { ImageList, ImageListItem, ImageListItemBar, Box, Typography } from '@mui/material';
import { photos } from '../data/photos';

const PhotoBook = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Book de Fotos
      </Typography>
      <ImageList variant="woven" cols={3} gap={8}>
        {photos.map((item) => (
          <ImageListItem key={item.id}>
            <img
              src={`${item.url}?w=161&fit=crop&auto=format`}
              srcSet={`${item.url}?w=161&fit=crop&auto=format&dpr=2 2x`}
              alt={item.title}
              loading="lazy"
            />
            <ImageListItemBar title={item.title} />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};

export default PhotoBook;
