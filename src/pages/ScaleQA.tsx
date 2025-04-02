import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import '../styles/scaleqa.scss';
import Icon from '@/components/Icons';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setHeaderTooltip, setPageTitle } from '@/redux/slices/appSlice';
import { logEvent } from '@/utility/logger';

const ScaleQA = () => {
  const dispatch = useDispatch();
  const applogo = useSelector((state:any) => state.app.logo);
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const header = params.get('header') || "Default Name";

   useEffect(() => {
      logEvent('info', `ScaleQA screen loaded`);
      dispatch(setPageTitle(header));
      dispatch(setHeaderTooltip('Please ensure that you review the VAW and GenAI usage policies, terms, and conditions on the community; https://glo.globallogic.com/communities/843'));
    },[header]);

  return (
    <Box
      className='pageWrapper'
    >
      <Card
        className='pageCard'
      >
        <CardContent sx={{padding:'0px', margin:'0px', height:'100vh'}}>
          <Box
            sx={{
              textAlign: 'left',
              position: 'relative',
              height:'100vh'
            }}
          >
              <Box className="home-wrap">
                <Box className="home-box">
                <Icon size={50} name="scaleqajenkins" />
                  <Typography variant='body1'>
                  <a 
          href="http://172.30.111.57:30000/" 
          target="_blank" 
          rel="noopener noreferrer" 
        >
          ScaleQA Jenkins - Comprehensive test dashboard with predefined widgets, trends, test history, failure classification, live automation health, and bug tracker integration.
        </a>
                  </Typography>
                </Box>
                <Box className="home-box">
                  <Icon size={50} name="scaleqareport" />
                  <Typography variant='body1'>
                  <a 
          href="http://172.30.111.57:30004/" 
          target="_blank" 
          rel="noopener noreferrer" 
        >
        Scalable Test Reports - Comprehensive test dashboard with predefined widgets, trends, test history, failure classification, live automation health, and bug tracker integration.
        </a>
                  </Typography>
                </Box>
                <Box className="home-box">
                  <Icon size={50} name="scaleqaperformance" />
                  <Typography variant='body1'>
                  <a 
          href="http://172.30.111.51:32666/" 
          target="_blank" 
          rel="noopener noreferrer" 
        >
        Scalable Test Monitoring - A ready-to-use platform to run your JMeter performance tests in a cloud native and scalable way & monitoring it, on the go.
        </a>
                  </Typography>
                </Box>
                <Box className="home-box">
                  <Icon size={50} name="scaleqaselonoid" />
                  <Typography variant='body1'>
                  <a 
          href="http://172.30.111.51:30594/ui" 
          target="_blank" 
          rel="noopener noreferrer" 
        >
        Running Tests In Containers - Isolated, lightweight, fast test automation environment with browser isolation, live video, multi-browser support, and efficient resource management.
        </a>
                  </Typography>
                </Box>
              </Box>
              <Box className="box-wrap">
                <Typography variant='h3'>ScaleQA</Typography>
                <Typography variant='h5'>Scalable Test Infrastructure for Quality Engineering (Bring your own Testsuite)
                </Typography>
            </Box>  
          </Box>
      </CardContent>
    </Card>
  </Box>
  );
};

export default ScaleQA;
