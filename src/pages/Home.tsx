import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import '../styles/home.scss';
import Icon from '@/components/Icons';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLogo } from '@/redux/slices/appSlice';
import { useMediaQuery } from '@mui/material';
import {logEvent} from "../utility/logger"


const HomePage = () => {
  const dispatch = useDispatch();
  const applogo = useSelector((state:any) => state.app.logo);
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
    const fetchData = async () => {
      try {
        const [storedLogo] = await Promise.all([
          window.electronAPI.getConfig("configJson.logo")
        ]);
  
        console.log(storedLogo);

        if(storedLogo){
          logEvent("debug", `Logo fetched successfully: ${storedLogo}`);
          console.log(storedLogo);
          dispatch(setLogo(storedLogo));
        }
      } catch (error) {
        console.error("Failed to fetch configuration from electron-store:", error);
      }
    }

    fetchData();
  },[])

  

  // Media query for 150% screen resolution
  const is150Percent = useMediaQuery('(max-width: 1281px)');
  // Media query for 125% screen resolution
  const is125Percent = useMediaQuery('(min-width: 1282px) and (max-width: 1920px)');
  // Set icon size based on media query
  const iconSize = is150Percent ? 45 : is125Percent ? 50 : 50;

  return (
    <>
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
            <Box className="main-wrap">
              <Box className="home-wrap">
                <Box className="home-box">
                  <Icon size={iconSize} name="server" />
                  <Typography variant='body1' className='home-content'>
                    Provide AI assisted expert advisory services
                    that help organizations define and achieve
                    their Digital Transformation goals
                  </Typography>
                </Box>
                <Box className="home-box">
                  <Icon size={iconSize} name="checklist" />
                  <Typography variant='body1' className='home-content'>
                    Accelerate legacy technology modernization
                    through the use of GenAI, enabling 
                    businesses to transition to modern tech
                    stacks with minimal friction
                  </Typography>
                </Box>
                <Box className="home-box">
                  <Icon size={iconSize} name="terminal" />
                  <Typography variant='body1' className='home-content'>
                    Use AI-assisted tools to optimize the 
                    entire software development lifecycle
                    (SDLC) from design and coding to deployment
                  </Typography>
                </Box>
                <Box className="home-box">
                  <Icon size={iconSize} name="toggle_switch" />
                  <Typography variant='body1' className='home-content'>
                    Leverage Generative AI to enable automated,
                    efficient and comprehensive testing throughout
                    the software testing life cycle (STLC)
                  </Typography>
                </Box>
              </Box>
              <Box className="box-wrap">
                {applogo && 
                <img style={{width:"80px", marginTop:"-20px"}} src={applogo} />
                }
                <Typography variant='h3'>GlobalLogic's VelocityAI Workbench 2.0.0(MVP Release)</Typography>
                <Typography variant='h4'>Unlock the power of technology at your fingertips!</Typography>
                <Typography variant='h6'>Navigate the left menu or the top hamburger menu to begin exploring!</Typography>
              </Box>  
            </Box>  
          </Box>
      </CardContent>
    </Card>
  </Box>
    </>
    
  );
};

export default HomePage;