import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SWRConfig } from 'swr';
import { theme } from './lib/theme';
import { swrConfig } from './lib/swr';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SWRConfig value={swrConfig}>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Add more routes as needed */}
            </Routes>
          </AppLayout>
        </Router>
      </SWRConfig>
    </ThemeProvider>
  );
}

export default App;
