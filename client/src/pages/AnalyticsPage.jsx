import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const AnalyticsPage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Analytics charts will go here</Typography>
      </Paper>
    </Container>
  );
};

export default AnalyticsPage;