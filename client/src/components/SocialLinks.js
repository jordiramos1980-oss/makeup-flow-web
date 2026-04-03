import React from 'react';
import { Typography, Box, Link as MuiLink } from '@mui/material';

const SocialLinks = ({ variant = 'default' }) => {
  const isSidebar = variant === 'sidebar';

  const containerSx = isSidebar 
    ? { // Styles for sidebar
        width: '100%',
        p: 2,
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      }
    : { // Default styles for homepage
        width: '100%',
        maxWidth: '800px',
        mt: 4,
        mb: 4,
        p: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      };

  const iconSize = isSidebar ? 60 : 80;

  return (
    <Box sx={containerSx}>
      {!isSidebar && (
        <Typography variant="h5" component="h3" sx={{ mb: 3, fontWeight: 'bold', color: 'white' }}>
          Síguenos en Redes
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: isSidebar ? 2 : 4, justifyContent: 'center' }}>
        <MuiLink href="https://www.instagram.com/makeupflow25" target="_blank" rel="noopener noreferrer">
          <Box
            component="img"
            src="/assets/images/social/instagram.png"
            alt="Instagram"
            sx={{ 
              width: iconSize, 
              height: iconSize,
              transition: 'transform 0.2s',
              '&:hover': {
                animation: 'pulse 1.5s infinite',
              }
            }}
          />
        </MuiLink>
        <MuiLink href="https://www.tiktok.com/@make_up_flow" target="_blank" rel="noopener noreferrer">
          <Box
            component="img"
            src="/assets/images/social/tiktok.png"
            alt="TikTok"
            sx={{ 
              width: iconSize, 
              height: iconSize,
              transition: 'transform 0.2s',
              '&:hover': {
                animation: 'pulse 1.5s infinite',
              }
            }}
          />
        </MuiLink>
      </Box>
    </Box>
  );
};

export default SocialLinks;