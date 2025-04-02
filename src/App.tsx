import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';
import "./index.css";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Home from './pages/Home';
import RequirementPage from './pages/Requirement';
import ImagineXPage from './pages/ImagineX/Imaginex';
import ChatPage from './pages/Chat';
import LogsPage from './pages/Logs';
import SettingsPage from './pages/Settings';
import CodeBuddy from './pages/CodeBuddy';
import AppBarComponent from './components/AppBarComponent';
import PromptLibrary from './pages/PromptLibrary';
import UnderConstruction from './pages/UnderConstruction';
import WorkspacePage from './pages/WorkSpace';
import KnowledgeBasePage from './pages/KnowledgeBase';
import ExternalPage from './pages/External';
import FloatingIcons from './components/FloatingIcons';
import HelpPage from './pages/Help';
import NewsPage from './pages/News';
import SearchBar from './components/SearchBar';
import AddWorkspacePage from './pages/AddWorkspace';
import TitleBar from './components/TitleBar';
import { useDispatch, useSelector } from 'react-redux';
import BravoPage from './pages/Bravo/Bravo';
import Ailoader from './components/Ailoader';
import {  setDefaultAIProvider, setNickName } from './redux/slices/appSlice';
import CaseStudy from './pages/CaseStudy';
import ErrorBoundary from './components/ErrorBoundary';
import ScaleQA from './pages/ScaleQA';
import QaCompanion from './pages/QaCompanion';
import BugHunter from './pages/BugHunter/bugHunter';



const AppContent = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [infoText, setInfoText] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [appConfig, setAppConfig] = useState();
  const selectedFont = useSelector((state: any) => state.app.font);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const showAppBar = useSelector((state:any) => state.app.showAppBar);
  const currentAIProvider = useSelector((state:any) => state.app.defaultAIProvider);

  const header = params.get('header');

  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [location]);

  React.useEffect(() => {
    const activateInfoBar = () => setIsActive(true);
    const deactivateInfoBar = () => setIsActive(false);

    const fetchData = async () => {
      try {
        const [storedProvider, storedConfigJson] = await Promise.all([
          window.electronAPI.getConfig("provider"),
          window.electronAPI.getConfig("configJson")
        ]);
  
        if(storedProvider){
          console.log(storedProvider);
          dispatch(setDefaultAIProvider(storedProvider));
        }

        if(storedConfigJson){
          console.log(storedConfigJson.nickname);
          setAppConfig(storedConfigJson);
          dispatch(setNickName(storedConfigJson.nickname));
        }

      } catch (error) {
        console.error("Failed to fetch configuration from electron-store:", error);
      }
    }

    fetchData();

    const interval = setInterval(() => {
      deactivateInfoBar();
      setTimeout(activateInfoBar, 40000); // Wait 20 seconds to reactivate
    }, 50000); // Total of 27 seconds: 7s + 20s 

    return () => clearInterval(interval); // Cleanup on component unmount
  },[]);

  const infoclick = () => {
    setInfoText(true);
  }

  const closeinfo = () => {
    setInfoText(false);
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event);    
  };

  const infoobj = {
    "header":"VelocityAI Workbench",
    "text1":"Welcome Guest",
    "text":`AI Provider is set to '${currentAIProvider}'. You can change the AI Provider anytime in settings`
  }

  return (
    <Box sx={{ width: "100vw", display: "flex", flexDirection: "column" }}>
      
      {/* AppBar Component */}
      <AppBarComponent /> 

      {/* Main Content Box */}
      <Box sx={{ display: "flex", flexGrow: 1, minHeight: "100vh" }}>
        {/* Sidebar Box */}
        <Box sx={{  backgroundColor: "#f4f4f4" }}>
          <Sidebar />
        </Box>

        {/* Routes Box */}
        <Box sx={{ flexGrow: 1, height: "100vh" }}>
          {loading && <Loader />}
          <FloatingIcons />
          {!showAppBar ?
          <SearchBar 
          status="inactive"
          placeholder="Search here..."
          value=""
          onChange={handleSearchChange} />
          : "" 
          }
          {header !== null ? (
          <TitleBar />
          ): ''}
          {/* Routing content */}
          {(infoText && !loading) &&
          <Box style={{width:"100vw",height:"100vh",position:"absolute",top:"0px",left:"0px",display:"flex",justifyContent:"center", alignItems:"center",background:"rgba(0,0,0,0.3)",zIndex:"999"}}>
            <Box style={{position:"relative",background:"rgba(255,255,255,1)", boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.3)', padding:"2em 6em 4em 2em", justifyContent:"center"}}>
              <Ailoader text={infoobj} width="200px" height="130px" />
              <Button className='secondary-btn' style={{position:"absolute",bottom:"15px",left:"11em"}} size='small' onClick={closeinfo}>Okay</Button>
            </Box>
          </Box>
          }
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/addworkspace" element={<AddWorkspacePage />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/requirementai" element={<RequirementPage />} />
            <Route path="/external" element={<ExternalPage />} />
            <Route path="/scaleqa" element={<ScaleQA />} />
            <Route path="/qacompanion" element={<QaCompanion />} />
            <Route path="/codebuddy" element={<CodeBuddy />} />
            <Route path="/bravo" element={<BravoPage />} />
            <Route path="/imaginex" element={<ImagineXPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/knowledgebase" element={<KnowledgeBasePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/promptlibrary" element={<PromptLibrary />} />
            <Route path="/underconstruction" element={<UnderConstruction />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/casestudy" element={<CaseStudy />} />
            <Route path="/bugHunter" element={<BugHunter />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

const App = () => {
  const selectedFont = useSelector((state: any) => state.app.font);

  const theme = createTheme({
    typography: { fontFamily: selectedFont },
  });

  return (
    
      <ThemeProvider theme={theme}>
        <Router basename="/">
          <AppContent />
        </Router>
      </ThemeProvider>
    
  )
};

export default App;
