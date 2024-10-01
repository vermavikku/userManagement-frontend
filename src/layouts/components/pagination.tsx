import React from 'react';
import Pagination from '@mui/material/Pagination';

const PaginationOutlined = ({ count, page, onPageChange }:any) => {    
  return (
    <Pagination
      count={count}
      page={page}
      onChange={(event, value) => onPageChange(value)}
      variant="outlined"
      shape="rounded"
      style ={{margin : "20px"}}
    />
  );
};

export default PaginationOutlined;
