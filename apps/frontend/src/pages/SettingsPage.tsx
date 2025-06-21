import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAppStore } from '../stores/useAppStore';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, user, setUser } = useAppStore();
  const [showAlert, setShowAlert] = React.useState(false);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.checked ? 'dark' : 'light';
    setTheme(newTheme);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleMockLogin = () => {
    setUser({
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
    });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleLogout = () => {
    setUser(null);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your application preferences and account settings
        </Typography>
      </Box>

      {showAlert && (
        <Alert severity="success" sx={{ mb: 4 }}>
          Settings updated successfully!
        </Alert>
      )}

      {/* Theme Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DarkModeIcon sx={{ mr: 1 }} />
            <Typography variant="h5">
              Appearance
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Customize how the application looks and feels
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={theme === 'dark'}
                onChange={handleThemeChange}
                name="darkMode"
              />
            }
            label="Dark Mode"
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Note: Dark mode styling would need to be implemented in the theme configuration
          </Typography>
        </CardContent>
      </Card>

      {/* User Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SettingsIcon sx={{ mr: 1 }} />
            <Typography variant="h5">
              Account
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage your account settings and preferences
          </Typography>

          {user ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Name:</strong> {user.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Button variant="outlined" color="error" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No user is currently logged in. Click below to simulate a login.
              </Typography>
              <Button variant="contained" onClick={handleMockLogin}>
                Mock Login
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotificationsIcon sx={{ mr: 1 }} />
            <Typography variant="h5">
              Notifications
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Control how and when you receive notifications
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Email notifications"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Push notifications"
            />
            <FormControlLabel
              control={<Switch />}
              label="Marketing emails"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Button variant="contained" size="small">
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SettingsPage; 