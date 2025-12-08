import React from 'react';
import { Container, Typography, Paper, TextField, Button } from '@mui/material';

const SettingsPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <TextField fullWidth label="Username" margin="normal" />
        <TextField fullWidth label="Email" margin="normal" />
        <TextField fullWidth label="Bio" margin="normal" multiline rows={3} />
        <Button variant="contained" sx={{ mt: 2 }}>
          Save Changes
        </Button>
      </Paper>
    </Container>
  );
};

export default SettingsPage;