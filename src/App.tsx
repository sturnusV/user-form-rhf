import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { UserForm } from './components/UserForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserForm />
    </ThemeProvider>
  );
};

export default App;