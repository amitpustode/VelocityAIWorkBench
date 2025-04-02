import { Box, Card, CardContent, Divider } from '@mui/material';
import '../styles/codebuddy.scss';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setHeaderTooltip, setPageTitle } from '@/redux/slices/appSlice';
import { logEvent } from '@/utility/logger';

const CodeBuddy = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const params = new URLSearchParams(location.search);
  const [isCalled, setIsCalled] = useState(false);

  // Retrieve query parameters
  const header = params.get('header') || "Default Name";
  const link = params.get('link') || "https://default.url.com";

  useEffect(() => {
    dispatch(setPageTitle(header));
    dispatch(setHeaderTooltip('Please ensure that you review the VAW and GenAI usage policies, terms, and conditions on the community; https://glo.globallogic.com/communities/843'));
  },[header]);

  useEffect(() => {
    logEvent(`info`,`Codebuddy screen loaded.`);
    if (!isCalled) {
      window.electronAPI.openVSCode();
      setIsCalled(true);
    }
  }, []);

  return (
    <Box
      className='pageWrapper'
    >
      <Card
        className='pageCard'
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '70vh'
            }}
          >
            <Box>
            <p style={{marginTop:'0px', fontSize: '16px', textAlign:'center', color: 'black'}}>Enjoy GenAI Enabled SDLC Journey, With</p>
            <h3 style={{marginTop:'0px', fontSize: '24px', textAlign:'center', color: 'black'}}>CodeBuddy!</h3>
              <Divider style={{borderBottom: "5px solid #f37137"}} />
            </Box>
            <Box
                sx={{
                  textAlign: 'center',
                }}
              >
              <p style={{fontSize: '18px', color: '#666'}}>We attempted to open the Code IDE (VisualStudioCode or IntelliJ) on your machine.</p>
              <p style={{fontSize: '18px', color: '#666'}}>
                For the latest updates and releases of CodeBuddy, be sure to follow the VelocityAI Workbench community at:
              </p>
              <a href="https://glo.globallogic.com/communities/843" 
                  target="_blank" 
                  style={{color: '#1abc9c', textDecoration: 'none'}}>
                      https://glo.globallogic.com/communities/843
                  </a>
            </Box>
          </Box>
      </CardContent>
    </Card>
  </Box>
  );
};

export default CodeBuddy;
