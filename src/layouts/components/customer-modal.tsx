import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

export default function BasicModalDialog({
  status,
  editStatus,
  userName,
  onClose,
  submitForm,
}: {
  status: boolean;
  editStatus: boolean;
  userName: string;
  onClose: () => void;
  submitForm: () => void;
}) {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [open, setOpen] = React.useState(false);
  const [client, setClient] = React.useState(false); // Set client flag
  const [clientData, setClientData] = React.useState({
    customer_name: '',
    user_name: '',
    password: '',
    client_username: '',
    email: '',
    mobile_number: '',
  });
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [dropdown, setDropdown] = React.useState<{ client_name: string; user_name: string }[]>([]); // Array for dropdown

  // Fetch dropdown values
  const dropDownValue = async () => {
    try {
      const response = await axios.get(`${baseUrl}/clients/dropdown`);
      if (response.status === 200) {
        setDropdown(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to load dropdown data');
    }
  };

  React.useEffect(() => {
    setOpen(status);
    dropDownValue();
    const role = localStorage.getItem('role');
    if (role === 'client') {
      const username = localStorage.getItem('username');
      setClientData((prevData) => ({
        ...prevData,
        client_username: username || '',
      }));
      setClient(true);
    }
  }, [status]);

  const handleClose = () => {
    setOpen(false);
    onClose(); // Call onClose to manage modal state
    setClientData({
      customer_name: '',
      user_name: '',
      password: '',
      client_username: '',
      email: '',
      mobile_number: '',
    });
    setErrors({});
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setClientData({ ...clientData, [name!]: value });
    setErrors({ ...errors, [name!]: '' }); // Clear error on change
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhoneNumber = (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone); // E.164 format

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Validate fields
    if (!clientData.customer_name) newErrors.customer_name = 'Customer name is required';
    if (!clientData.user_name) newErrors.user_name = 'User name is required';
    if (!clientData.client_username) newErrors.client_username = 'Client username is required';
    if (!editStatus) {
      if (!clientData.password) newErrors.password = 'Password is required';
    }
    if (!clientData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(clientData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!clientData.mobile_number) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!validatePhoneNumber(clientData.mobile_number)) {
      newErrors.mobile_number = 'Invalid phone number format';
    }

    if (Object.keys(newErrors).length === 0) {
      try {
        let response;
        let message;
        if (editStatus) {
          response = await axios.put(`${baseUrl}/customers`, clientData);
          message = 'customer updated successfully';
        } else {
          response = await axios.post(`${baseUrl}/customers`, clientData);
          message = 'customer added successfully';
        }

        if (response.status === 201 || response.status === 200) {
          toast.success(message);
          submitForm();
          setTimeout(handleClose, 1000); // Close after showing toast
        }
      } catch (error: any) {
        toast.error(`Error: ${error.response?.data?.Message || 'Failed to add customer'}`);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const getCustomerInfo = async () => {
    try {
      const response = await axios.get(`${baseUrl}/customers/edit/${userName}`);
      if (response.status === 200) {
        const data = response.data;
        setClientData({
          customer_name: data.customer_name,
          user_name: data.user_name,
          password: '',
          client_username: data.client_username,
          email: data.email,
          mobile_number: data.mobile_number,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    if (editStatus) {
      getCustomerInfo();
    }
  }, []);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{ ...style, width: 400 }}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <h2 id="parent-modal-title">{editStatus ? 'Edit' : 'Add New'} Customer</h2>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Customer Name"
                name="customer_name"
                value={clientData.customer_name}
                onChange={handleChange}
                required
                error={!!errors.customer_name}
                helperText={errors.customer_name}
              />
              <TextField
                label="User Name"
                name="user_name"
                value={clientData.user_name}
                onChange={handleChange}
                required
                error={!!errors.user_name}
                helperText={errors.user_name}
                disabled={editStatus}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={clientData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
              {!client && (
                <FormControl fullWidth>
                  <InputLabel id="client-username-label">Client</InputLabel>
                  <Select
                    labelId="client-username-label"
                    id="client-username-select"
                    name="client_username"
                    value={clientData.client_username}
                    label="Client Username"
                    onChange={handleChange}
                    required
                    error={!!errors.client_username}
                  >
                    {dropdown.map((client, index) => (
                      <MenuItem key={index} value={client.user_name}>
                        {client.client_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.client_username && (
                    <p style={{ color: 'red' }}>{errors.client_username}</p>
                  )}
                </FormControl>
              )}
              <TextField
                label="Email"
                name="email"
                type="email"
                value={clientData.email}
                onChange={handleChange}
                required
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                label="Mobile Number"
                name="mobile_number"
                value={clientData.mobile_number}
                onChange={handleChange}
                required
                error={!!errors.mobile_number}
                helperText={errors.mobile_number}
              />
              <Button type="submit" variant="contained">
                Submit
              </Button>
            </Stack>
          </form>
        </Box>
      </Modal>
    </div>
  );
}
