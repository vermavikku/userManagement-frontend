import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { ToastContainer, toast } from 'react-toastify';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import axios from 'axios';

// ----------------------------------------------------------------------

export type UserProps = {
  client_name: any;
  user_name: any;
  email: any;
  mobile_number: any;
  industry: any;
  creation_time: any;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
  onClick: () => void;
  submitForm: () => void;
};

export function UserTableRow({
  row,
  selected,
  submitForm,
  onSelectRow,
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

  const deleteClient = async (username: any) => {
    try {
      const resp = confirm(
        'if you delete client all customer associate to this client gets deleted too'
      );
      if (resp) {
        const response = await axios.delete(`${baseUrl}/clients/${username}`);
        if (response.status === 200) {
          submitForm();
          toast.success('client delete successfully');
        }
      }
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.Message || 'Failed to delete Customer'}`);
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell> */}

        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            {/* <Avatar alt={row.name} src={row.avatarUrl} /> */}
            {row.client_name}
          </Box>
        </TableCell>

        <TableCell>{row.user_name}</TableCell>

        <TableCell>{row.industry}</TableCell>

        <TableCell>{row.email}</TableCell>

        <TableCell>{row.mobile_number}</TableCell>

        <TableCell align="right">{row.creation_time}</TableCell>
        <TableCell align="right">
          <Box display="flex" gap={1}>
            {' '}
            {/* Add gap for spacing between buttons */}
            <Button
              variant="contained"
              color="error" // Red color for delete action
              startIcon={<Iconify icon="mingcute:delete-line" />} // Delete icon
              onClick={() => deleteClient(row.user_name)}
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
      </TableRow>
    </>
  );
}
