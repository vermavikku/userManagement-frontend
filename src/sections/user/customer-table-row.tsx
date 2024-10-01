import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { ToastContainer, toast } from 'react-toastify';

import { Iconify } from 'src/components/iconify';
import axios from 'axios';

// ----------------------------------------------------------------------

export type UserProps = {
  client_name: any;
  client_username: any;
  customer_name: any;
  user_name: any;
  email: any;
  mobile_number: any;
  creation_time: any;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  buttonStatus: boolean;
  onSelectRow: () => void;
  onClick: any;
  submitForm: () => void;
};

export function UserTableRow({
  row,
  selected,
  buttonStatus,
  onSelectRow,
  submitForm,
  onClick,
}: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const deleteCustomer = async (username: any) => {
    try {
      const resp = confirm('Are you sure you want to delete this customer?');
      if (resp) {
        const response = await axios.delete(`${baseUrl}/customers/${username}`);
        if (response.status == 200) {
          toast.success('Customer deleted successfully');
          submitForm();
        }
      }
    } catch (error) {
      console.error('Error:', error); // Debugging log
      toast.error(`Error: ${error.response?.data?.Message || 'Failed to delete Customer'}`);
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            {row.customer_name}
          </Box>
        </TableCell>
        <TableCell>{row.user_name}</TableCell>
        <TableCell>{row.client_username}</TableCell>
        <TableCell>{row.email}</TableCell>
        <TableCell>{row.mobile_number}</TableCell>
        <TableCell align="right">{row.creation_time}</TableCell>
        {buttonStatus && ( // Check if buttonStatus is truthy
          <TableCell align="right">
            <Box display="flex" gap={1}>
              {' '}
              {/* Add gap for spacing between buttons */}
              <Button
                variant="contained"
                color="error" // Red color for delete action
                startIcon={<Iconify icon="mingcute:delete-line" />} // Delete icon
                onClick={() => deleteCustomer(row.user_name)} // Add your delete function
                sx={{ '&:hover': { bgcolor: 'red.600' } }} // Optional: Darker on hover
              >
                Delete
              </Button>
              <Button
                variant="outlined" // Use outlined variant for the edit action
                color="primary" // Primary color for edit action
                startIcon={<Iconify icon="mingcute:edit-line" />} // Edit icon
                onClick={() => onClick(row.user_name)} // Replace with your edit function
                sx={{ '&:hover': { bgcolor: 'primary.light' } }} // Optional: Lighten background on hover
              >
                Edit
              </Button>
            </Box>
          </TableCell>
        )}
      </TableRow>
    </>
  );
}
