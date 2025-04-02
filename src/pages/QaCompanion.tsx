import { Box, Card, CardContent, Divider } from '@mui/material';
import '../styles/qacompanion.scss';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setHeaderTooltip, setPageTitle } from '@/redux/slices/appSlice';
import { logEvent } from '@/utility/logger';

const QaCompanion = () => {
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

  // useEffect(() => {
  //   logEvent(`info`,`QaCompanion screen loaded.`);
  //   if (!isCalled) {
  //     window.electronAPI.openVSCode();
  //     setIsCalled(true);
  //   }
  // }, []);

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
              height: '90vh',
              overflow: 'scroll',
              padding: '5px'
            }}
          >
            <Box>
              <div style={{textAlign:'center'}}>
            <img src='.\assets\images\qaCompanionLogoSmall.png' style={{height:'100px'}}/>
            </div>
              <Divider style={{borderBottom: "5px solid #f37137"}} />
            </Box>
            <Box>
              <p style={{fontSize: '17px', color: '#666', paddingBottom:'5px',margin:'5px'}}><b>Most Advanced Release 2.0.1 with Automation Script Generation for Mobile, Web & API, and Functional Test Case Generation Using PRD</b><br /> <br />We're excited to announce the release of the advanced and rebranded QACompanion version 2.0.1, now available for macOS and Windows! <br /> <br />
<b>What’s New in QACompanion 2.0.1?</b></p><ul style={{margin:'2px'}}><li>AI-powered automation script generation for Mobile, Web, and API testing</li>
<li>Functional test case generation using PRD/backlog inputs</li>
<li>Seamless integration with STLC tools Enhanced support for various automation frameworks</li>
<li>Enhanced support for various automation frameworks</li>
</ul>
 For more details, check the attached document, which includes: <ul style={{margin:'2px'}}>
<li><a href="https://drive.google.com/file/d/1lsCfmOajHgWN6rLjw6wt5sDTm1ejjPmw/view?usp=drive_link" target="_blank">Installation Link </a></li>
<li><a href="https://drive.google.com/drive/folders/1_iZu-Dm1tyRdupGDbsGkQ-eW2K_JIHHI?usp=drive_link" target="_blank">How to Use QACompanion</a></li>
</ul>
              <p style={{fontSize: '14px', color: '#666',margin:'5px'}}>
                For the latest updates and releases of QaCompanion, be sure to follow the VelocityAI Workbench community at:
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

export default QaCompanion;
