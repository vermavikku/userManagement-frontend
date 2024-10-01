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
  submitForm,
  onClose,
}: {
  status: boolean;
  editStatus: boolean;
  userName: string;
  onClose: () => void;
  submitForm: () => void;
}) {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [open, setOpen] = React.useState(false);
  const [clientData, setClientData] = React.useState({
    client_name: '',
    user_name: '',
    password: '',
    industry: '',
    email: '',
    mobile_number: '',
  });
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    setOpen(status);
  }, [status]);

  const handleClose = () => {
    setOpen(false);
    onClose(); // Call the onClose prop to manage the modal state in UserView
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setClientData({ ...clientData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error when user types
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const regex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    return regex.test(phone);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const newErrors: { [key: string]: string } = {};

      // Validate fields
      if (!clientData.client_name) newErrors.client_name = 'Client name is required';
      if (!clientData.user_name) newErrors.user_name = 'User name is required';
      if (!clientData.industry) newErrors.industry = 'Industry is required';
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
        // Submit form if no errors
        let response;
        let message;
        if (editStatus) {
          response = await axios.put(`${baseUrl}/clients`, clientData);
          message = 'client updated successfully';
        } else {
          response = await axios.post(`${baseUrl}/clients`, clientData);
          message = 'Client added successfully';
        }
        if (response.status === 201 || response.status === 200) {
          toast.success(message);

          submitForm();
          setOpen(false); // Close modal on successful submission

          // Reset form after successful submission
          setClientData({
            client_name: '',
            user_name: '',
            password: '',
            industry: '',
            email: '',
            mobile_number: '',
          });
        }
      } else {
        setErrors(newErrors);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.response?.data?.Message || 'Failed to add client'}`);
    }
  };

  const getClientInfo = async () => {
    try {
      const response = await axios.get(`${baseUrl}/clients/edit/${userName}`);
      if (response.status === 200) {
        const data = response.data;
        setClientData({
          client_name: data.client_name,
          user_name: data.user_name,
          password: data.password,
          industry: data.industry,
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
      getClientInfo();
    }
  }, []);

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style, width: 400 }}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <h2 id="parent-modal-title">{editStatus ? 'Edit' : 'Add New'} Client</h2>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Client Name"
                name="client_name"
                value={clientData.client_name}
                onChange={handleChange}
                required
                error={!!errors.client_name}
                helperText={errors.client_name}
              />
              <TextField
                label="User Name"
                name="user_name"
                value={clientData.user_name}
                onChange={handleChange}
                required
                error={!!errors.user_name}
                helperText={errors.user_name}
              />
              <TextField
                label="Password"
                name="password"
                value={clientData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
              <TextField
                label="Industry"
                name="industry"
                value={clientData.industry}
                onChange={handleChange}
                required
                error={!!errors.industry}
                helperText={errors.industry}
              />
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
