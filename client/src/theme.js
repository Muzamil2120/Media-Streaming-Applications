import { createTheme } from '@mui/material/styles';

const createAppTheme = (mode = 'light') => createTheme({
  palette: {
    mode,
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: {
      default: mode === 'light' ? '#f7f7f7' : '#0f172a',
      paper: mode === 'light' ? '#fff' : '#111827'
    },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { variant: 'contained' },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
    MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

export default createAppTheme;
