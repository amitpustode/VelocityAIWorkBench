import React from 'react';
import "../styles/loader.scss";
import { Box } from '@mui/material';

const Loader: React.FC = () => {

  return (
    <Box sx={{width:"100vw", 
              height:"100vh", 
              position: "absolute", 
              zIndex: 1001,
              top: "50%", 
              left: "50%", 
              transform: "translate(-50%, -50%)", 
              textAlign: "center", 
              background:"rgba(0,0,0,0.9)"}}>
      <div className="loader" ></div>
    </Box>
  )
};

export default Loader;
