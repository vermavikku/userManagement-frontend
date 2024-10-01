import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { _users } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../customer-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { UserProps } from '../user-table-row';
import axios from 'axios';
import PaginationOutlined from '../../../layouts/components/pagination';
import BasicModalDialog from '../../../layouts/components/customer-modal';

// ----------------------------------------------------------------------

export function CustomerView() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const table = customerTable();
  const [client, setClient] = useState(true);
  const [headers, setHeaders] = useState([]);
  const [username, setUsername] = useState('');
  const [edStatus, setEdStatus] = useState(false);

  const [filterName, setFilterName] = useState('');
  const [customers, setCustomers] = useState<UserProps[]>([]);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [submitData, setSubmitData] = useState(false);

  const dataFiltered: UserProps[] = applyFilter({
    inputData: customers,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const getCustomersInfo = async (page: number) => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const response = await axios.get(`${baseUrl}/customers?page=${page}&limit=5`, {
        headers: {
          Authorization: token,
          Role: role,
        },
      });
      if (response.status === 200) {
        const { results, ...rest } = response.data;
        setCustomers(results);
        setPagination(rest);
      } else if (response.status === 401) {
        router.push('/');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCustomersInfo(currentPage);
  }, [baseUrl, currentPage, submitData]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCloseModal = (status: any) => {
    setModalOpen(status);
  };

  useEffect(() => {
    const role = localStorage.getItem('role');

    // Define headers based on the role
    const clientHeaders = [
      { id: 'customer_name', label: 'Customer Name' },
      { id: 'user_name', label: 'Username' },
      { id: 'client_username', label: 'Client Username' },
      { id: 'email', label: 'Email' },
      { id: 'mobile_number', label: 'Mobile Number' },
      { id: 'creation_time', label: 'Created At' },
    ];

    if (role === 'client') {
      setHeaders(clientHeaders);
      setClient(false);
    } else {
      setHeaders([...clientHeaders, { id: 'action', label: 'Action' }]);
    }
  }, []);

  const handleOpenModal = (username: any) => {
    setUsername(username);

    setEdStatus(true);
    setModalOpen(true);
  };
  const openModelAdd = () => {
    setEdStatus(false);
    setModalOpen(true);
  };

  const submitForm = () => {
    setSubmitData((prevsubmitData) => !prevsubmitData);
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Customer
        </Typography>
        {client && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => openModelAdd()}
          >
            New Customer
          </Button>
        )}
      </Box>

      {/* Modal */}
      {modalOpen && (
        <BasicModalDialog
          status={modalOpen}
          editStatus={edStatus}
          submitForm={submitForm}
          userName={username}
          onClose={handleCloseModal}
        />
      )}

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={customers.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    customers.map((user) => user.user_name)
                  )
                }
                headLabel={headers}
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <UserTableRow
                      key={row.user_name} // Assuming user_name is unique
                      row={row}
                      selected={table.selected.includes(row.user_name)}
                      onSelectRow={() => table.onSelectRow(row.user_name)}
                      onClose={handleCloseModal}
                      submitForm={submitForm}
                      buttonStatus={client}
                      onClick={handleOpenModal}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, customers.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <PaginationOutlined
          count={pagination.totalPages}
          page={currentPage} // Pass current page
          onPageChange={handlePageChange} // Handle page change
        />{' '}
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function customerTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
