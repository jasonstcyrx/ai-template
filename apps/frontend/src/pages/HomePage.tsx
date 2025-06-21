import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAppStore } from '../stores/useAppStore';

export const HomePage: React.FC = () => {
  const { user, setLoading, isLoading } = useAppStore();

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const features = [
    {
      title: 'React Router',
      description: 'Navigation between different pages',
      icon: <DashboardIcon color="primary" />,
      status: 'Active',
    },
    {
      title: 'MUI Components',
      description: 'Beautiful Material-UI components',
      icon: <PeopleIcon color="primary" />,
      status: 'Active',
    },
    {
      title: 'Zustand Store',
      description: 'Global state management with Zustand',
      icon: <SettingsIcon color="primary" />,
      status: 'Active',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Frontend Template
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          A modern React application with Vite, TypeScript, MUI, Zustand, SWR, and React Router
        </Typography>
      </Box>

      {/* Status Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Application Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label="Vite" color="success" />
            <Chip label="React 19" color="success" />
            <Chip label="TypeScript" color="success" />
            <Chip label="MUI" color="success" />
            <Chip label="Zustand" color="success" />
            <Chip label="SWR" color="success" />
            <Chip label="React Router v6" color="success" />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current user: {user ? user.name : 'Not logged in'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Loading state: {isLoading ? 'Loading...' : 'Ready'}
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            onClick={handleLoadingTest}
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            Test Loading State
          </Button>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Features
      </Typography>
      
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>
                <Chip 
                  label={feature.status} 
                  color="success" 
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage; 