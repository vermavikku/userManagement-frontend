import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import axios from 'axios';
import verifyToken from 'src/utils/verify-token';

export function SignInView() {
  const router = useRouter();

  // State for form inputs and alerts
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('root@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Check if token exists and redirect if authenticated
  useEffect(() => {
    const data = verifyToken();
    if (data) {
      router.push('/'); // Redirect if token is valid
    }
  }, [router]);

  // Handle form submission
  const handleSignIn = useCallback(
    async (e: any) => {
      e.preventDefault();

      setLoading(true);
      setError('');

      try {
        const response = await axios.post(`${baseUrl}/auth`, {
          username: username,
          password: password,
        });

        const { data } = response;

        if (response.status !== 200) {
          throw new Error(data.message || 'Login failed');
        }

        // Save token in local storage
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);

        // Navigate to dashboard
        router.push('/');
      } catch (err: any) {
        setError(err.response?.data?.message || 'invalid username or password'); // Set error message
      } finally {
        setLoading(false); // Reset loading state
      }
    },
    [username, password, router, baseUrl]
  );

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleSignIn}
      display="flex"
      flexDirection="column"
      alignItems="flex-end"
    >
      {error && (
        <Box sx={{ mb: 2, color: 'red' }}>
          {error} {/* Display error message */}
        </Box>
      )}
      <TextField
        fullWidth
        name="username"
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
        required
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputLabelProps={{ shrink: true }}
        type={showPassword ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
        required
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        loading={loading} // Show loading state
      >
        Sign in
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Sign in</Typography>
      </Box>

      {renderForm}

      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>

      <Box gap={1} display="flex" justifyContent="center">
        {/* Add social login buttons if needed */}
      </Box>
    </>
  );
}
