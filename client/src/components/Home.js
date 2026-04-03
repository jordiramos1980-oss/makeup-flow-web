import React, { useState, useEffect } from 'react';
import { Typography, Box, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom'; // Import Link
import homeImage from '../assets/images/1000047104.jpg'; // Explicitly import the image
import imageTwo from '../assets/images/1000047107.jpg'; // New image for biography section
import logoImage from '../assets/images/logo.jpg'; // Import the logo
import SocialLinks from './SocialLinks'; // Import the new component

const promotionImages = [
  '/assets/images/promociones/promo1.png',
  '/assets/images/promociones/promo2.png',
  '/assets/images/promociones/promo3.png',
  '/assets/images/promociones/promo4.png',
  '/assets/images/promociones/promo5.png',
];

const Home = () => {
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAd((prevAd) => (prevAd + 1) % promotionImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh', // Ensure it covers the full viewport height
        flexGrow: 1, // Ensure it takes available space
        backgroundImage: 'linear-gradient(45deg, #FFC0CB 30%, #FF69B4 90%)', // Pink diagonal gradient
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white', // Ensure text is visible on the background
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        p: 3, // Padding
      }}
    >
      <Box
        component="img"
        src={logoImage}
        alt="Make Up Flow Logo"
        sx={{
          width: 'clamp(250px, 70%, 500px)', // Responsive width for the logo
          height: 'auto', // Maintain aspect ratio
          mb: 2, // Margin bottom for spacing
        }}
      />
                <Typography
                  variant="h4" // Suitable variant for subtitle
                  component="h2"
                  sx={{
                    fontWeight: 'normal',
                    mb: 2, // Margin bottom for spacing
                    fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' }, // Font size for subtitle
                    fontFamily: '"Dancing Script", cursive', // Apply Dancing Script font
                  }}
                >
                  Maria Muñoz Pujol
                </Typography>          <Typography
            variant="h5"
            component="p"
            sx={{
              fontStyle: 'italic',
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
              fontFamily: '"Dancing Script", cursive', // Apply Dancing Script font
            }}
          >
            Tu belleza, mi pasión
          </Typography>

      <Box
        sx={{
          mt: 4, // Margin top for spacing
          width: 'clamp(200px, 60%, 400px)', // Responsive width
          height: 'clamp(150px, 45vw, 300px)', // Responsive height
          borderRadius: '50%', // Make it round
          overflow: 'hidden', // Hide overflow for the round shape
          boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.5)', // Add some shadow
          backgroundImage: `url(${homeImage})`, // Use the imported image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '5px solid rgba(255, 255, 255, 0.8)', // White border
        }}
      />

      {/* Biography Section */}
      <Box
        sx={{
          mt: 4, // Margin top from the image
          mb: 4, // Margin bottom to the next image
          p: 3, // Padding inside the box
          backgroundColor: '#F8E0E6', // Light rose background color
          borderRadius: '12px', // Slightly rounded corners
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)', // Subtle shadow
          maxWidth: '800px', // Max width same as text
          textAlign: 'center', // Center text within the box
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
            lineHeight: 1.6,
            color: '#333333', // Dark text color for contrast on light background
          }}
        >
          ¡Hola! Soy María Muñoz Pujol, una maquilladora profesional de vocacion y con experiencia
          transformando la belleza de mis clientas. Mi pasión es realzar tu estilo único y hacerte
          sentir espectacular para cualquier ocasión, desde bodas y eventos especiales hasta
          sesiones de fotos. Cada rostro es un lienzo, y mi objetivo es crear un look que no solo
          te guste, sino que te enamore. ¡Espero verte pronto para crear magia juntas!
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 4, // Margin top for spacing below the first image
          width: 'clamp(200px, 60%, 400px)', // Responsive width, same as above
          height: 'clamp(150px, 45vw, 300px)', // Responsive height, same as above
          borderRadius: '50%', // Make it round
          overflow: 'hidden', // Hide overflow for the round shape
          boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.5)', // Add some shadow
          backgroundImage: `url(${imageTwo})`, // Use the newly imported image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '5px solid rgba(255, 255, 255, 0.8)', // White border
        }}
      />

      {/* Promotions Carousel Section (formerly Specialties) */}
      <Box sx={{ width: '100%', maxWidth: '900px', mt: 5, mb: 5 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 4, color: 'white', fontWeight: 'bold' }}>
          Promociones Destacadas
        </Typography>
        <Link to="/reserva" style={{ textDecoration: 'none', display: 'block' }}>
          <Box
            component="img"
            src={promotionImages[currentAd]}
            alt="Promoción"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: '16px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              transition: 'opacity 1s ease-in-out',
              cursor: 'pointer', // Indicate it's clickable
            }}
          />
        </Link>
      </Box>

      {/* Social Media Links */}
      <SocialLinks />
    </Box>
  );
};

export default Home;
