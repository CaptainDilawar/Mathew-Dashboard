import { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, Container } from '@mui/material';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // API base: use VITE_API_URL when set; in production default to relative paths so `/api/*` routes to Vercel functions
        const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');

        try {
            const response = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                onLogin();
            } else {
                const data = await response.json();
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', height: '100vh' }}>
            <Card sx={{ p: 4, width: '100%', borderRadius: 4, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(30, 41, 59, 0.7)' }}>
                <CardContent>
                    <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
                        Admin Login
                    </Typography>
                    <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && (
                            <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, p: 1.5 }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default LoginPage;
