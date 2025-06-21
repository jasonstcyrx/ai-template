import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useUsers } from '../services/api';

export const UsersPage: React.FC = () => {
  const { users, isLoading, isError, mutate } = useUsers();

  const handleRefresh = () => {
    mutate(); // This will trigger a revalidation
  };

  // Mock users for demonstration when no API is available
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isActive: true,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user' as const,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      isActive: true,
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'moderator' as const,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      isActive: false,
    },
  ];

  // Use mock data if no users from API (for demonstration)
  const displayUsers = users || mockUsers;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'moderator':
        return 'warning';
      case 'user':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <div>
          <Typography variant="h3" component="h1" gutterBottom>
            Users
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage application users and their roles
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Alert severity="error" sx={{ mb: 4 }}>
          Failed to load users. This is expected since no API is configured. 
          Showing mock data for demonstration.
        </Alert>
      )}

      {/* Users Grid */}
      {!isLoading && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isError ? 'Showing mock data (API not available)' : `Found ${displayUsers.length} users`}
          </Typography>
          
          <Grid container spacing={3}>
            {displayUsers.map((user) => (
              <Grid item xs={12} md={6} lg={4} key={user.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {user.name ? getInitials(user.name) : <PersonIcon />}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3">
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip
                        label={user.role || 'user'}
                        color={getRoleColor(user.role || 'user')}
                        size="small"
                      />
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !isError && displayUsers.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No users found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No users are currently registered in the system.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default UsersPage; 