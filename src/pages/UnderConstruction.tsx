import { Box, Card, CardContent, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setHeaderTooltip, setPageTitle } from '@/redux/slices/appSlice';
import '../styles/underconstruction.scss';
import velocity from '../assets/images/Velocity.AIWorkBench.png';

const UnderConstruction = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const params = new URLSearchParams(location.search);

  // Retrieve query parameters
  const header = params.get('header') || "Default Name";
  const link = params.get('link') || "https://default.url.com";

  useEffect(() => {
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
        <CardContent>
        <Box>
            <Box className='contentWrapper'>
              <Typography style={{fontWeight: '700'}}>VelocityAI Workbench: Work In Progress</Typography>
              <Typography style={{fontWeight: '700'}}>VelocityAI Workbench: 作業中</Typography>
              <Typography style={{fontWeight: '700'}}>VelocityAI Workbench: कार्य प्रगति पर</Typography>
            </Box>
            <img 
                  className='velocityImg'
                  src={velocity} 
                  alt="VelocityAI Workbench Logo" 
              />
        </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UnderConstruction;
