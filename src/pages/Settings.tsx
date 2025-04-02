import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar, Alert,
  Avatar,
  Paper
} from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useSelector, useDispatch } from "react-redux";
import { setDefaultAIProvider, setPageTitle, toggleMenu, setLogo, setProfilePhoto, setAppFont, setHeaderTooltip, setNickName } from "../redux/slices/appSlice";
import '../styles/settings.scss';
import { AccountCircle } from '@mui/icons-material';
import { logEvent } from '@/utility/logger';
import TitleBar from '@/components/TitleBar';
import FontSelect from '@/components/FontSelect';
import { useToast } from '@/components/ToastSnackBar';
import { encryptionUtil } from '@/utility/encryption';
import { useMediaQuery } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const providers = [
  {
    "provider": "azureOpenAI",
    "model": "",
    "endpoint": "",
    "apiKey": ""
  },
  {
    "provider": "OpenAI",
    "model": "",
    "endpoint": "",
    "apiKey": ""
  },
  {
    "provider": "Ollama",
    "model": "",
    "endpoint": "",
    "apiKey": ""
  }
]

const embedproviders = [
  {
    "embedprovider": "azureOpenAI",
    "model": "",
    "endpoint": "",
    "apiKey": ""
  },
  {
    "embedprovider": "openAI",
    "model": "",
    "endpoint": "",
    "apiKey": ""
  },
  {
    "embedprovider": "Ollama",
    "model": "",
    "endpoint": "",
    "apiKey": ""
  }
]

const trackingtools = [
  {
    "trackingtool": "jira",
    "email": "",
    "endpoint": "",
    "projectkey": "",
    "projecttoken":"",
  }
]

const Settings = () => {
  const dispatch = useDispatch();
  const { ToastSnackbar, showToast } = useToast();
  const menu = useSelector((state: any) => state.app.menu);
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [subvalue, setSubValue] = React.useState("");
  const [embedTabValue, setembedTabValue] = React.useState("");
  const [ttValue, setttValue] = React.useState("");
  const [nickname, setNickname] = useState();
  const [toastOpen, setToastOpen] = useState(false);
  
  const [configJson, setConfigJson] = useState<any>(providers);
  const [embedconfigJson, setEmbedConfigJson] = useState<any>(embedproviders);
  const [ttconfigJson, setttConfigJson] = useState<any[]>(trackingtools);
  const [provider, setProvider] = useState('');
  const [embedprovider, setEmbedProvider] = useState('');
  const [ttool, setTool] = useState('');
  const [editdata, setEditData] = useState(true);

  const [selectedFont, setSelectedFont] = useState<string>("Arial");
  const [lookupChecked, setLookupChecked] = useState(false);
  
  useEffect(() => {
    dispatch(setPageTitle("Settings"));
    dispatch(setHeaderTooltip('Please ensure that you review the VAW and GenAI usage policies, terms, and conditions on the community; https://glo.globallogic.com/communities/843'));
    logEvent('info',`Settings screen loaded.`);
    


    const fetchData = async () => {
      try {
        
        const [storedProvider, storedEmbedProvider, storedTrackingTool, storedConfigJson, storedEmbedConfigJson, storedttconfigJson, storedLookupChecked] = await Promise.all([
          window.electronAPI.getConfig("provider"),
          window.electronAPI.getConfig("embedprovider"),
          window.electronAPI.getConfig("trackingtool"),
          window.electronAPI.getConfig("configJson"),
          window.electronAPI.getConfig("embedconfigJson"),
          window.electronAPI.getConfig("ttconfigJson"),
          window.electronAPI.getConfig("lookupChecked")

        ]);

        console.log(storedProvider);
        console.log(storedTrackingTool);
    
        if (storedProvider) {
          setProvider(storedProvider);
          setSubValue(storedProvider);
        } else{
          setProvider('azureOpenAI');
          setSubValue('azureOpenAI');
          const data = {
            provider: 'azureOpenAI'
          };
          await window.electronAPI.saveConfig(data);
        }

        if (storedTrackingTool) {
          setTool(storedTrackingTool);
          setttValue(storedTrackingTool);
        } else{
          setTool('jira');
          setttValue('jira');
        }
    
        if (storedConfigJson) {
          setConfigJson(storedConfigJson);
        } else {
          setConfigJson(providers);
        }

        if (storedttconfigJson) {
          setttConfigJson(storedttconfigJson);
        } else {
          setttConfigJson(trackingtools);
        }
    
        if (storedEmbedProvider) {
          setEmbedProvider(storedEmbedProvider);
          setembedTabValue(storedEmbedProvider);
        }else{
          setEmbedProvider('azureOpenAI');
          setembedTabValue('azureOpenAI');
        }
    
        if (storedEmbedConfigJson) {
          setEmbedConfigJson(storedEmbedConfigJson);
        }
        if(storedLookupChecked) {
          setLookupChecked(storedLookupChecked);
        }
      } catch (error) {
        logEvent('error', `Failed to fetch configuration: ${error}`);
        console.error("Failed to fetch configuration from electron-store:", error);
      }
    };
    
    fetchData();
  }, []);

  const handleFontChange = (font: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to change the font to "${font}"?`);
    if (!isConfirmed) return;
  
    setSelectedFont(font);
    dispatch(setAppFont(font));
  
    const cssRule = `*:not(.no-font-change) { font-family: ${font} !important; }`;
  
    // Check if the dynamic style element already exists
    let styleElement = document.getElementById('dynamic-font-style') as HTMLStyleElement;
  
    // Create a style element if not found
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-font-style';
      document.head.appendChild(styleElement);
    }
  
    // Update the content of the style element
    try {
      styleElement.textContent = cssRule;
    } catch (error) {
      console.error('Error applying font change:', error);
    }
  };
  
  const resetFont = () => {
    const isConfirmed = window.confirm('Are you sure you want to reset the font to the default?');
    if (!isConfirmed) return;
  
    setSelectedFont('Open Sans');
    dispatch(setAppFont('Open Sans'));
  
    const defaultCssRule = `*:not(.no-font-change) { font-family: 'Open Sans', 'Arial', 'Helvetica', sans-serif, system-ui !important; }`;
  
    // Locate the dynamic style element
    const styleElement = document.getElementById('dynamic-font-style') as HTMLStyleElement;
  
    // If the dynamic style element exists, reset its content
    try {
      if (styleElement) {
        styleElement.textContent = defaultCssRule;
      } else {
        // Create a new style element for resetting fonts
        const newStyleElement = document.createElement('style');
        newStyleElement.id = 'dynamic-font-style';
        newStyleElement.textContent = defaultCssRule;
        document.head.appendChild(newStyleElement);
      }
    } catch (error) {
      console.error('Error resetting font:', error);
    }
  };  

const handleSave = async () => {
    try {
        // Initialize encryption
        if (!encryptionUtil.isInitialized()) {
            await encryptionUtil.initialize();
        }

        // Use formatconfigData to format the settings data
        const settings_data = formatconfigData({
            provider,
            embedprovider,
            configJson,
            embedconfigJson,
            lookupChecked,
        }, provider, embedprovider);

        // Encrypt data
        const encryptedData = await encryptionUtil.encryptData(settings_data);
        const settingsResponse = await window.electronAPI.shareConfig(encryptedData);

        // Local store update (unencrypted)
        await window.electronAPI.saveConfig({
            provider,
            embedprovider,
            configJson,
            embedconfigJson,
            lookupChecked,
        });

        dispatch(setNickName(configJson.nickname));
        dispatch(setProfilePhoto(configJson.profilePhoto));
        setEditData(true);
        
        showToast(`Settings Saved`, 'success');
        logEvent(`info`,`Settings Saved`);
    } catch (error) {
        console.error("Error saving config:", error);
        showToast(`Error saving settings`, 'error');
        logEvent('error', 'Error saving settings');
    }
};

const formatconfigData = (data: any, aiProvider: string, embedingProvider: string): any => {
  const { 
    provider,
    embedprovider,
    configJson,
    embedconfigJson,
    providerName ,
    lookupChecked
  } = data;

  // Function to filter out non-default providers
  const filterProviders = (config: any, defaultProvider: string) => {
    return Object.keys(config).reduce((acc, key) => {
      if (key === defaultProvider) {
        console.log('Default provide matched', key);
        acc[key] = config[key];
      }
      return acc;
    }, {} as any);
  };

  // Filter configJson and embedconfigJson to keep only the default provider
  const filteredConfigJson = filterProviders(configJson,  aiProvider);
  const filteredEmbedconfigJson = filterProviders(embedconfigJson, embedingProvider);

  return {
    provider,
    embedprovider,
    configJson: filteredConfigJson,
    embedconfigJson: filteredEmbedconfigJson,
    lookupChecked : lookupChecked
  };
};  


  const handleProviderChange = async (providerName: string) => {
    try {
        // Initialize encryption if not already done
        if (!encryptionUtil.isInitialized()) {
            await encryptionUtil.initialize();
        }

        // Prepare settings data using formatconfigData
        const settings_data = formatconfigData({
          provider,
          embedprovider,
          configJson,
          embedconfigJson,
          lookupChecked,
      }, provider, embedprovider);

        console.log('Original data to encrypt:', settings_data);
        
        // Encrypt the settings data
        const encryptedData = await encryptionUtil.encryptData(settings_data);

        // Send encrypted data to backend via electron
        //const settingsResponse = await window.electronAPI.shareConfig(settings_data);
        
        // Save to local electron store (unencrypted for local use)
        const response = await window.electronAPI.saveConfig({
            provider: providerName
        });

        setProvider(providerName);
        setEditData(true);
        dispatch(setDefaultAIProvider(providerName));

        logEvent(`info`,`Switched AI Provider to ${providerName}`);
        showToast(`Switching AI Provider to ${providerName}`, 'success');
    } catch (error) {
        console.error("Error saving config:", error);
        showToast(`Error changing the AI Provider`, 'error');
        logEvent(`error`,`Error on changing AI Provider`);
    }
};

  const handleEmbedProviderChange = async (providerName: string) => {
    try {
        // Initialize encryption
        if (!encryptionUtil.isInitialized()) {
            await encryptionUtil.initialize();
        }

        const settings_data = formatconfigData({
          provider,
          embedprovider,
          configJson,
          embedconfigJson,
          lookupChecked,
      }, provider, embedprovider);

        // Encrypt data
        const encryptedData = await encryptionUtil.encryptData(settings_data);
       // const settingsResponse = await window.electronAPI.shareConfig(settings_data);

        // Local store update (unencrypted)
        await window.electronAPI.saveConfig({ embedprovider: providerName });
        
        setEmbedProvider(providerName);
        setEditData(true);
        
        logEvent(`info`,`Switching Embed AI Provider to ${providerName}`);
        showToast(`Switching Embed AI Provider to ${providerName}`, 'success');
    } catch (error) {
        console.error("Error saving config:", error);
        showToast(`Error changing the Embed AI Provider`, 'error');
        logEvent('error', 'Error changing the Embed AI Provider');
    }
};

  const handlettoolChange = async (toolName: string) => {
    try {
      const data = {
        trackingtool: toolName
      };

      console.log("saving handlettoolChange")

      const response = await window.electronAPI.saveConfig(data);
      console.log(response);
      setTool(toolName);
      setEditData(true);
      showToast(`Switching Tracking tool to ${toolName}`, 'success');
    } catch (error) {
      console.error("Error saving config:", error);
      showToast(`Error changing the Tracking tool`, 'error');
    }
  };

  const handleLookupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLookupChecked(event.target.checked);
    console.log('Checkbox checked:', event.target.checked);
  };

  const handleEdit = () => {
    setEditData(true);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(event);
    setValue(newValue);
  };

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    console.log(value);
    if (value.startsWith(' ')) return;
    setConfigJson({
      ...configJson,
      nickname: value,
    })
  }

  const handleSubTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSubValue(newValue);
  };

  const handleEmbedTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setembedTabValue(newValue);
  };

  const handleTrackingToolChange = (event: React.SyntheticEvent, newValue: string) => {
    setttValue(newValue);
  };

  const handleToggle = (path: any, enabled: any) => {
    dispatch(toggleMenu({ path, enabled }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          console.log(reader.result);
          dispatch(setProfilePhoto(reader.result));
          setConfigJson({
            ...configJson,
            profilePhoto: reader.result,
          })
        }
      };
      reader.readAsDataURL(file);
      logEvent(`info`,`Profile Photo Changed`);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          console.log(reader.result);
          dispatch(setLogo(reader.result));
          setConfigJson({
            ...configJson,
            logo: reader.result,
          })
        }
      };
      reader.readAsDataURL(file);
      logEvent(`info`,`Logo Changed`);
    }
  };

  const handleToastClose = () => {
    setToastOpen(false); // Close the toast
  };

  const [marginToptabcontainer, setCuststeppMarginTop] = useState("5px");
  const [paddingTopanelcontainer, setPaddingTopanelcontainer] =useState(3);
  const [marginTobottomcheck, setMarginTobottomcheck] =useState(3);
  const [marginBottomTestInput, setMarginBottomTestInput] =useState(3);
  const [logoWidth, setLogoWidth] = useState(130); 
  const [paddingToThemeSetting, setpaddingToThemeSetting] = useState(3)
  const [logoHeight, setLogoHeight] = useState(130);
  const [paddingTop, setPaddingTop] = useState(10);
  const [paddingLeftRight, setPaddingLeftRight] = useState(20);
  

// Media query for 150% screen resolution
const is150Percent = useMediaQuery('(max-width: 1281px)');

// Media query for 125% screen resolution
const is125Percent = useMediaQuery('(min-width: 1282px) and (max-width: 1920px)');

useEffect(() => {
  const marginTop = is150Percent ? "10px" : "20px";
  setCuststeppMarginTop(marginTop);

  const paddingTop = is150Percent ? 0 : is125Percent ? 3 : 2;
  setPaddingTopanelcontainer(paddingTop);

  const marginBottom = is150Percent ? 0 : is125Percent ? 3 : 2;
  setMarginTobottomcheck(marginBottom);

  const padding = is150Percent ? 0 : is125Percent ? 3 : 2;
  setpaddingToThemeSetting(padding);

  const marginBottomInput = is150Percent ? 1 : is125Percent ? 2 : 2;
  setMarginBottomTestInput(marginBottomInput);

  const calculatedLogoWidth = is150Percent ? 80 : is125Percent ? 120 : 130;
  setLogoWidth(calculatedLogoWidth);

  const calculatedLogoHeight = is150Percent ? 80 : is125Percent ? 120 : 130;
  setLogoHeight(calculatedLogoHeight);

  const calculatedPaddingTop = is150Percent ? 5 : is125Percent ? 15 : 10;
  setPaddingTop(calculatedPaddingTop);

  const calculatedPaddingLeftRight = is150Percent ? 15 : is125Percent ? 20 : 20;
  setPaddingLeftRight(calculatedPaddingLeftRight);
}, [is150Percent, is125Percent]);

  return (
    <Box
      className='pageWrapper'
      style={{ fontFamily: selectedFont }}
    >
      <Card
        className='pageCard'
      >
        <CardContent>
          <Box style={{ marginTop: marginToptabcontainer }}>
            <TitleBar />
          </Box>
          <Box sx={{ display: "flex" }}>
            <Box className='tabcontainer'>
              <Tabs
                orientation="vertical"
                value={value}
                onChange={handleChange}
                textColor="inherit"
                aria-label="full width tabs example"
              >
                <Tab className='tabbutton' label="Menu Settings" {...a11yProps(0)} />
                <Tab className='tabbutton' label="AI Provider Settings" {...a11yProps(1)} />
                <Tab className='tabbutton' label="Embedded Settings" {...a11yProps(2)} />
                <Tab className='tabbutton' label="Tracking tool Settings" {...a11yProps(3)} />
                <Tab className='tabbutton' label="Theme Settings" {...a11yProps(4)} />
                <Tab className='tabbutton' label="Profile Settings" {...a11yProps(5)} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0} dir={theme.direction}>
              <Box className="panel-container">
                <Typography className='tabheader' variant="h5" component="div" gutterBottom>
                    Customize Top Menu
                </Typography>
                <Card sx={{ width: 600, p: paddingTopanelcontainer, }}>
                  <CardContent>
                    <ul className='menutree'>
                      <p><i>Customize the Top Menu to Your Needs</i></p>
                      {menu.map((item: any) => (
                        <li key={item.name}>
                          <label>
                            <input
                              type="checkbox"
                              checked={item.enabled}
                              onChange={(e) => handleToggle([item.name], e.target.checked)}
                            />
                            {item.name}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1} dir={theme.direction}>
              <Box className="panel-container">
                <Typography className='tabheader' variant="h5" component="div" gutterBottom>
                    AI Provider Settings
                </Typography>
                <Box>
                  <Box sx={{ width: '40em', typography: 'body1' }}>
                    <TabContext value={subvalue}>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleSubTabChange} aria-label="lab API tabs example">
                          {providers.map((item: any) => (
                            <Tab key={item.provider} disabled={item.provider === 'Gemini'} className='subtabbtn' label={item.provider} value={item.provider} />
                          ))}
                        </TabList>
                      </Box>
                      {providers.map((item: any) => (
                        <Paper key={item.provider} elevation={2}>
                          <TabPanel value={item.provider}>
                             {/* Check if the provider is "gemini" */}
                             {item.provider.toLowerCase() === "gemini" && (
                              <Box sx={{ mb: 2, padding: 2, border: "1px solid #ddd", borderRadius: 1 }}>
                                <Typography sx={{ fontWeight: "bold", textDecoration: "underline", display: "inline", fontSize: '0.80rem', marginTop: 1}}>
                                  Note:
                                </Typography>
                                <Typography sx={{ fontStyle: "italic", display: "inline", fontSize: '0.80rem', marginTop: 1 }}>
                                   {' '}
                                   Gemini integration will be included in the upcoming releases.
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: "flex", flexDirection: "column", textTransform: "capitalize" }}>
                              <TextField
                                fullWidth
                                label="Model"
                                disabled={!editdata}
                                variant="outlined"
                                sx={{ mb: 2 }}
                                value={configJson[item.provider]?.model || ''}
                                onChange={(e) =>
                                  setConfigJson({
                                    ...configJson,
                                    [item.provider]: {
                                      ...configJson[item.provider],
                                      model: e.target.value,
                                    },
                                  })
                                }
                              />
                              <TextField
                                fullWidth
                                label="URL"
                                disabled={!editdata}
                                variant="outlined"
                                sx={{ mb: 2 }}
                                value={configJson[item.provider]?.endpoint || ''}
                                onChange={(e) =>
                                  setConfigJson({
                                    ...configJson,
                                    [item.provider]: {
                                      ...configJson[item.provider],
                                      endpoint: e.target.value,
                                    },
                                  })
                                }
                              />
                              <TextField
                                fullWidth
                                label="Api Key"
                                type="password"
                                disabled={!editdata}
                                variant="outlined"
                                sx={{ mb: 2 }}
                                value={configJson[item.provider]?.apiKey || ''}
                                onChange={(e) =>
                                  setConfigJson({
                                    ...configJson,
                                    [item.provider]: {
                                      ...configJson[item.provider],
                                      apiKey: e.target.value,
                                    },
                                  })
                                }
                              />
                            </Box>
                            <Box style={{ display: "flex", justifyContent: "flex-start" }}>
                              <Button
                                style={{ marginRight: "auto" }}
                                className="secondary-btn"
                                disabled={item.provider === provider}
                                onClick={() => handleProviderChange(item.provider)}
                              >
                                {item.provider === provider ? `Default Provider` : `Set as default`}
                              </Button>
                              {!editdata ?
                              <Button
                                className="primary-btn"
                                variant="contained"
                                onClick={handleEdit}
                                sx={{ mr: 1 }}
                              >
                                Edit Settings
                              </Button>
                              :
                              <Button
                                className="primary-btn"
                                variant="contained"
                                onClick={handleSave}
                              >
                                Save Settings
                              </Button>
                              }
                            </Box>

                          </TabPanel>
                        </Paper>
                      ))}
                    </TabContext>
                  </Box>
                </Box>
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2} dir={theme.direction}>
              <Box className="panel-container">
                <Typography className='tabheader' variant="h5" component="div" gutterBottom>
                  Embedded Settings
                </Typography>
                <Box>
                  
                  <Box sx={{ width: '40em', typography: 'body1' }}>
                    <TabContext value={embedTabValue}>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleEmbedTabChange} aria-label="lab API tabs example">
                          {embedproviders.map((item: any) => (
                            <Tab key={item.embedprovider} disabled={item.embedprovider === 'Gemini'} className='subtabbtn' label={item.embedprovider} value={item.embedprovider} />
                          ))}
                        </TabList>
                      </Box>
                      {embedproviders.map((item: any) => (
                        <Paper key={item.embedprovider} elevation={2}>
                          <TabPanel value={item.embedprovider}>
                            {item.embedprovider.toLowerCase() === "gemini" && (
                              <Box sx={{ mb: 2, padding: 2, border: "1px solid #ddd", borderRadius: 1 }}>
                                <Typography sx={{ fontWeight: "bold", textDecoration: "underline", display: "inline", fontSize: '0.80rem', marginTop: 1 }}>
                                  Note:
                                </Typography>
                                <Typography sx={{ fontStyle: "italic", display: "inline", fontSize: '0.80rem', marginTop: 1 }}>
                                  {' '}
                                  Gemini's integration for embedding will be included in the upcoming releases.
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: "flex", flexDirection: "column", textTransform: "capitalize" }}>
                              <TextField
                                fullWidth
                                label="Model"
                                disabled={!editdata}
                                variant="outlined"
                                sx={{ mb: 2 }}
                                value={embedconfigJson[item.embedprovider]?.model || ''}
                                onChange={(e) =>
                                  setEmbedConfigJson({
                                    ...embedconfigJson,
                                    [item.embedprovider]: {
                                      ...embedconfigJson[item.embedprovider],
                                      model: e.target.value,
                                    },
                                  })
                                }
                              />
                              <TextField
                                fullWidth
                                label="URL"
                                disabled={!editdata}
                                variant="outlined"
                                sx={{ mb: 2 }}
                                value={embedconfigJson[item.embedprovider]?.endpoint || ''}
                                onChange={(e) =>
                                  setEmbedConfigJson({
                                    ...embedconfigJson,
                                    [item.embedprovider]: {
                                      ...embedconfigJson[item.embedprovider],
                                      endpoint: e.target.value,
                                    },
                                  })
                                }
                              />
                              <TextField
                                fullWidth
                                label="Api Key"
                                type="password"
                                disabled={!editdata}
                                variant="outlined"
                                sx={{ mb: 2 }}
                                value={embedconfigJson[item.embedprovider]?.apiKey || ''}
                                onChange={(e) =>
                                  setEmbedConfigJson({
                                    ...embedconfigJson,
                                    [item.embedprovider]: {
                                      ...embedconfigJson[item.embedprovider],
                                      apiKey: e.target.value,
                                    },
                                  })
                                }
                              />
                            </Box>
                            <Box sx={{ mt: 1, ml: 0, marginBottom:marginTobottomcheck }}>
                              <label>
                              <input type="checkbox" checked={lookupChecked} onChange={handleLookupChange}/>
                              Consider the entire best matching document during search
                              </label>
                            </Box>
                            
                            <Box style={{ display: "flex", justifyContent: "flex-start" }}>
                              <Button
                                style={{ marginRight: "auto" }}
                                className="secondary-btn"
                                disabled={item.embedprovider === embedprovider}
                                onClick={() => handleEmbedProviderChange(item.embedprovider)}
                              >
                                {item.embedprovider === embedprovider ? `Default Provider` : `Set as default`}
                              </Button>
                              {!editdata ?
                              <Button
                                className="primary-btn"
                                variant="contained"
                                onClick={handleEdit}
                                sx={{ mr: 1 }}
                              >
                                Edit Settings
                              </Button>
                              :
                              <Button
                                className="primary-btn"
                                variant="contained"
                                onClick={handleSave}
                              >
                                Save Settings
                              </Button>
                              }
                            </Box>

                          </TabPanel>
                        </Paper>
                      ))}
                    </TabContext>
                  </Box>
                  
                </Box>
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3} dir={theme.direction}>
            <Box className="panel-container">
                <Typography className='tabheader' variant="h5" component="div" gutterBottom>
                  Tracking tool Settings
                </Typography>
                <Box>
                  <Box sx={{ width: '40em', typography: 'body1' }}>
                    <TabContext value={ttValue}>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleTrackingToolChange} aria-label="lab API tabs example">
                          {ttconfigJson.map((item: any) => (
                            item.trackingtool === 'jira' ?
                            <Tab key={item.trackingtool} className='subtabbtn' label={item.trackingtool} value={item.trackingtool} />
                            : ''
                          ))}
                        </TabList>
                      </Box>
                      {ttconfigJson.map((item: any, index: number) => (
                        <Paper elevation={2} key={index}>
                          <TabPanel value={item.trackingtool}>
                            {/* Conditional rendering of the note */}
                            {item.trackingtool.toLowerCase() === "azure" && (
                              <Box sx={{ mb: 2, padding: 2, border: "1px solid #ddd", borderRadius: 1 }}>
                                <Typography sx={{ fontWeight: "bold", textDecoration: "underline", display: "inline", fontSize: '0.80rem', marginTop: 1 }}>
                                  Note:
                                </Typography>
                                <Typography sx={{ fontStyle: "italic", display: "inline", fontSize: '0.80rem', marginTop: 1 }}>
                                 {' '}
                                  Azure DevOps integration will be included in the upcoming releases.
                                </Typography>
                              </Box>
                            )}

                            {item.trackingtool.toLowerCase() === "github" && (
                              <Box sx={{ mb: 2, padding: 2, border: "1px solid #ddd", borderRadius: 1 }}>
                                <Typography sx={{ fontWeight: "bold", textDecoration: "underline", display: "inline", fontSize: '0.80rem', marginTop: 1 }}>
                                  Note:
                                </Typography>
                                <Typography sx={{ fontStyle: "italic", display: "inline", fontSize: '0.80rem', marginTop: 1 }}>
                                  {' '}
                                  GitHub integration will be included in the upcoming releases.
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: "flex", flexDirection: "column", textTransform: "capitalize" }}>
                              <TextField
                                fullWidth
                                label="End Point"
                                disabled={!editdata}
                                variant="outlined"
                                sx={{ marginBottom: marginBottomTestInput }}
                                value={item.endpoint}
                                onChange={(e) => {
                                  const updatedConfig = [...ttconfigJson];
                                  updatedConfig[index] = {
                                    ...updatedConfig[index],
                                    endpoint: e.target.value,
                                  };
                                  setttConfigJson(updatedConfig);
                                }}
                              />
                              <TextField
                                fullWidth
                                label="Email"
                                disabled={!editdata}
                                variant="outlined"
                                sx={{ marginBottom: marginBottomTestInput }}
                                value={item.email}
                                onChange={(e) => {
                                  const updatedConfig = [...ttconfigJson];
                                  updatedConfig[index] = {
                                    ...updatedConfig[index],
                                    email: e.target.value,
                                  };
                                  setttConfigJson(updatedConfig);
                                }}
                              />
                              <TextField
                                fullWidth
                                label="Project Key"
                                disabled={!editdata}
                                variant="outlined"
                                sx={{ marginBottom: marginBottomTestInput }}
                                value={item.projectkey}
                                onChange={(e) => {
                                  const updatedConfig = [...ttconfigJson];
                                  updatedConfig[index] = {
                                    ...updatedConfig[index],
                                    projectkey: e.target.value,
                                  };
                                  setttConfigJson(updatedConfig);
                                }}
                              />
                              <TextField
                                fullWidth
                                label="Project Token"
                                type="password"
                                disabled={!editdata}
                                variant="outlined"
                                sx={{ marginBottom: marginBottomTestInput }}
                                value={item.projecttoken}
                                onChange={(e) => {
                                  const updatedConfig = [...ttconfigJson];
                                  updatedConfig[index] = {
                                    ...updatedConfig[index],
                                    projecttoken: e.target.value,
                                  };
                                  setttConfigJson(updatedConfig);
                                }}
                              />
                            </Box>
                            <Box style={{ display: "flex", justifyContent: "flex-start" }}>
                              <Button
                                style={{ marginRight: "auto" }}
                                className="secondary-btn"
                                disabled={item.trackingtool === ttool}
                                onClick={() => handlettoolChange(item.trackingtool)}
                              >
                                {item.trackingtool === ttool ? `Default Tool` : `Set as default`}
                              </Button>
                              {!editdata ? (
                                <Button
                                  className="primary-btn"
                                  variant="contained"
                                  onClick={handleEdit}
                                  sx={{ mr: 1 }}
                                >
                                  Edit Settings
                                </Button>
                              ) : (
                                <Button className="primary-btn" variant="contained" onClick={handleSave}>
                                  Save Settings
                                </Button>
                              )}
                            </Box>
                          </TabPanel>
                        </Paper>
                      ))}
                    </TabContext>
                  </Box>
                </Box>
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4} dir={theme.direction}>
            <Box className="panel-container">
                <Typography className='tabheader' variant="h5" component="div" gutterBottom>
                  Theme Settings
                </Typography>
                <Card sx={{ width: 600, padding:paddingToThemeSetting }}>
                  <CardContent>
                    <div style={{ padding: `${paddingTop}px ${paddingLeftRight}px`, backgroundColor: 'white', margin: '0 auto', maxWidth: '400px' }}>
                      <Box style={{ display: 'flex', flexDirection: "column" }}>
                        <h4>App Logo</h4>
                        {configJson.logo ? (
                          <>
                            <Avatar style={{width: `${logoWidth}px`, height: `${logoHeight}px` }} src={configJson.logo} />
                          </>
                        ) : (
                          <>
                            <AccountCircle style={{ width: `${logoWidth}px`, height: `${logoHeight}px` }} />
                          </>
                        )}
                        <Button className='primary-btn uploadphoto' disabled={!editdata} variant="contained" component="label">
                          Upload logo
                          <input type="file" hidden onChange={handleLogoChange} />
                        </Button>
                        <h4>App Font Family</h4>
                        <FontSelect selectedFont={selectedFont} onFontChange={handleFontChange} />
                      </Box>
                      <div className='savebtn-container'>
                        <Button className="primary-btn" style={{marginRight:"10px"}} variant="contained" onClick={resetFont}>
                          Reset theme
                        </Button>
                        <Button className="primary-btn" variant="contained" onClick={handleSave}>
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={5} dir={theme.direction}>
              <Box className="panel-container">
                <Typography className='tabheader' variant="h5" component="div" gutterBottom>
                  Profile Settings
                </Typography>
                <Card className='profile-settings' sx={{ width: 600, p: 3 }}>
                  <CardContent>
                    <div style={{ padding: '10px 20px', backgroundColor: 'white', margin: '0 auto', maxWidth: '400px' }}>
                      <Box style={{ display: 'flex', flexDirection: "column" }}>
                        <h4 style={{marginBottom:"0px"}}>Profile Photo</h4>
                        {configJson.profilePhoto ? (
                          <>
                            <Avatar style={{ width: "130px", height: "130px" }} src={configJson.profilePhoto} />
                          </>
                        ) : (
                          <>
                            <AccountCircle style={{ width: "130px", height: "130px" }} />
                          </>
                        )}
                      </Box>
                      <Button className='primary-btn uploadphoto' fullWidth disabled={!editdata} variant="contained" component="label">
                        Upload Photo
                        <input type="file" hidden onChange={handlePhotoChange} />
                      </Button>
                      <h4 style={{marginBottom:"0px"}}>Nick Name</h4>
                      <TextField
                        fullWidth
                        margin="normal"
                        label=""
                        placeholder='Guest'
                        disabled={!editdata}
                        value={configJson.nickname}
                        onChange={handleInputChange}
                      />
                      <div className='savebtn-container'>
                        <Button className="primary-btn" variant="contained" onClick={handleSave}>
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Box>
              
            </CustomTabPanel>
          </Box>
          
          <ToastSnackbar />
        </CardContent>
      </Card>
    </Box>
  );
}

export default Settings;