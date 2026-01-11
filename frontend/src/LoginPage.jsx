import { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, Container, Alert } from '@mui/material';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('mathew_admin');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

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
            console.error('Login error:', err);
            setError('Backend not responding. Check if server is running on port 3001.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
            <Card sx={{ 
                p: 4, 
                width: '100%', 
                borderRadius: 4, 
                backdropFilter: 'blur(10px)', 
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography component="h1" variant="h5" align="center" sx={{ mb: 2, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #ec4899)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ color: '#94a3b8', mb: 2 }}>
                        Sign in to your account
                    </Typography>
                    
                    <Box component="form" onSubmit={handleLogin} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(99, 102, 241, 0.5)'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#6366f1'
                                    }
                                },
                                '& .MuiOutlinedInput-input::placeholder': {
                                    color: '#64748b',
                                    opacity: 1
                                }
                            }}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(99, 102, 241, 0.5)'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#6366f1'
                                    }
                                },
                                '& .MuiOutlinedInput-input::placeholder': {
                                    color: '#64748b',
                                    opacity: 1
                                }
                            }}
                        />
                        
                        {error && (
                            <Alert severity="error" sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
                                {error}
                            </Alert>
                        )}
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ 
                                mt: 2, 
                                p: 1.5,
                                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                                fontWeight: 600,
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 24px rgba(99, 102, 241, 0.3)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                            Demo Credentials:
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Username: <span style={{ color: '#6366f1', fontWeight: 600 }}>mathew_admin</span>
                        </Typography><br/>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Password: <span style={{ color: '#6366f1', fontWeight: 600 }}>Mrecai@dashboard!$</span>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default LoginPage;
