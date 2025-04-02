import React from 'react';
import { Tooltip, IconButton, Typography, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useSelector } from "react-redux";
import '../styles/common.scss';

const TitleBar = () => {
  const title = useSelector((state: any) => state.app.pageTitle);
  const headertooltip = useSelector((state: any) => state.app.pageHeaderTooltip);
  return (
    <Box className='titlebar'>
      {title && <Typography variant="h6">{title}</Typography>}  
      {headertooltip && (
      <Tooltip title={headertooltip} placement="right" arrow>
        <IconButton aria-label="info" size="small" style={{ marginLeft: 8 }}>
          <InfoOutlinedIcon />
        </IconButton>
      </Tooltip>
      )}
    </Box>
  );
};

export default TitleBar;
