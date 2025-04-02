import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import '../styles/help.scss';
import { logEvent } from '@/utility/logger';

const NewsPage = () => {

  useEffect(() => {
    logEvent(`info`,`News screen loaded.`);
  },[])
  
  return (
    <Box className="pageWrapper">
      <Card className="pageCard">
        <CardContent>
          <Box style={{width:'90vh', display:"flex", flexDirection:"column", justifySelf: "center"}}>
            <Typography style={{marginTop:"70px", color:"#f37137", marginBottom:"50px"}} className="formheader" variant="h5" align="center">
              Latest News!
            </Typography>
            <Box>
            <h3 style={{marginTop:'0px', fontSize: '24px', textAlign:'center', color: 'black'}}>
            VelocityAI Workbench
            </h3>
            <Divider style={{borderBottom: "5px solid #f37137"}} />
            <br></br>
            <br></br>
            <p style={{marginTop:'0px', fontSize: '16px', textAlign:'center', color: 'black'}}>
              We are excited to announce the release of VelocityAI Workbench Version 2.0.0 (MVP Release)! VAW introduces seamless connected workflow designed to generate code, requirements, diagrams, and QA artifacts, and many more usecases, efficiently.
            </p>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NewsPage;