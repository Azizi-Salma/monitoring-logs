import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e91e63 0%, #f8bbd9 100%)',
        color: 'white',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CircularProgress
          size={60}
          sx={{
            color: 'white',
            mb: 3,
          }}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Log Monitor
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Chargement en cours...
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;