import React from 'react';
import { Box, Container, Typography, Link as MuiLink, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { YouTube, Facebook, Twitter, Instagram } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <YouTube sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                MediaStream
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Stream, share, and discover amazing videos from creators around the world.
            </Typography>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink component={Link} to="/about" color="text.secondary">
                About
              </MuiLink>
              <MuiLink component={Link} to="/contact" color="text.secondary">
                Contact
              </MuiLink>
              <MuiLink component={Link} to="/careers" color="text.secondary">
                Careers
              </MuiLink>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink component={Link} to="/help" color="text.secondary">
                Help Center
              </MuiLink>
              <MuiLink component={Link} to="/terms" color="text.secondary">
                Terms of Service
              </MuiLink>
              <MuiLink component={Link} to="/privacy" color="text.secondary">
                Privacy Policy
              </MuiLink>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <MuiLink href="#" color="text.secondary">
                <Facebook />
              </MuiLink>
              <MuiLink href="#" color="text.secondary">
                <Twitter />
              </MuiLink>
              <MuiLink href="#" color="text.secondary">
                <Instagram />
              </MuiLink>
              <MuiLink href="#" color="text.secondary">
                <YouTube />
              </MuiLink>
            </Box>
          </Grid>
        </Grid>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 4, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}
        >
          © {new Date().getFullYear()} MediaStream. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;