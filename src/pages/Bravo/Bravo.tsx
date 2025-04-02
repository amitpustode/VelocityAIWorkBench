import {
  Card, CardContent,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  OutlinedInput,
  Checkbox,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import DataSaverOnOutlinedIcon from '@mui/icons-material/DataSaverOnOutlined';
import '../../styles/bravo.scss';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setHeaderTooltip, setPageTitle } from '@/redux/slices/appSlice';
import CustomizedSteppers from '@/components/Stepper';
import Ailoader from '@/components/Ailoader';
import EpicsTable from './EpicsTable';
import StoryTable from './StoryTable';
import { getPromptsResponses, getStoryPrompts, jiraCreationPost, pushStorytojira, getSrories } from '@/services/bravoService';
import { useToast } from '@/components/ToastSnackBar';
import { logEvent } from '@/utility/logger';
import { useMediaQuery } from '@mui/material';

const stypes = [
  'User Stories',
  'Technical Stories',
  'Spike Stories',
  'Enabler Stories',
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const BravoPage = () => {
  const dispatch = useDispatch();
  const { ToastSnackbar, showToast } = useToast();
  const [step, setStep] = useState<any>(1);
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setisLoading] = useState(false);
  const [epics, setEpics] = useState<any>(['Functional Epic', 'Technical Epic']);
  const [languages, setLanguages] = useState<any>([
    "English", "French", "Hindi", "Japanese", "Mandarin",
    "Modern Standard Arabic", "Portuguese", "Spanish"
  ]);
  const [LLMModels, setLLMModels] = useState<any>(['Open Ai', 'Local LLM']);
  const [newgeneration, setNewGeneration] = useState(true);
  const [response, setResponse] = useState<any>(null);
  const [storyType, setStoryType] = useState<string[]>([]);
  const [storyResponse, setStoryResponse] = useState<any>(null);
  const [appConfig, setAppConfig] = useState({
    'apiKey':'',
    'endpoint':'',
    'model':''
  });
  const currentAIProvider = useSelector((state:any) => state.app.defaultAIProvider);

  const childRef:any = useRef();

  const [formData, setFormData] = useState<any>({
    radioOption: 'option1',
    userInput: '',
    codeFile: null,
    reqFile: null,
    llmmodel: '',
    epic_type: '',
    language: 'English',
    considerEmbedding: false,
  });

  const [selectedEpics, setSelectedEpics] = useState<any[]>([]);
  const [selectedStories, setSelectedStories] = useState<any[]>([]);
  const [defaulttrackingtool, setDefaultTrackingTool] = useState('');
  const [isLoopLoading, setIsLoopLoading] = useState(false);
  const [storyGeneration, setStoryGeneration] = useState(true);
  const [usertypechange, setusertypechange] = useState(true);
  const [considerEmbedding, setConsiderEmbedding] = useState(false);

  const handleSelectionChange = (selectedRows: any[]) => {
    console.log("Selected Rows:", selectedRows);

    const storedRows = localStorage.getItem("selectedRows");
    const parsedStoredRows: any[] = storedRows ? JSON.parse(storedRows) : [];

    const arraysAreEqual = (arr1: any[], arr2: any[]) => {
        if (arr1.length !== arr2.length) return false;
        return arr1.every(item1 => arr2.some(item2 => JSON.stringify(item1) === JSON.stringify(item2)));
    };

    const hasChanged = !arraysAreEqual(parsedStoredRows, selectedRows);

    console.log("Has selection changed?", hasChanged);
    logEvent('info', `Epics selection changed: ${hasChanged}`);

    // Use functional update to ensure correct state update sequence
    setSelectedEpics(() => {
        console.log("Updated Selected Epics:", selectedRows);
        return selectedRows;
    });

    setStoryGeneration(() => {
        const shouldEnable = hasChanged || storyType.length > 0 ;
        console.log("Updated Story Generation Status:", shouldEnable);
        return shouldEnable;
    });

    if(storedRows && storedRows?.length <= 0){
      localStorage.setItem("selectedRows", JSON.stringify(selectedRows));
    } 
  };

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
    let storedSelectedRows = localStorage.getItem('selectedRows');
    let storedStoryType = localStorage.getItem('storyType');

    if(JSON.stringify(selectedEpics) === JSON.stringify(storedSelectedRows)){
      setStoryGeneration(false);
    }else{
      setStoryGeneration(true);
    }

    if(JSON.stringify(storyType) === JSON.stringify(storedStoryType)){
      setStoryGeneration(false);
    }else{
      setStoryGeneration(true);
    }
  },[selectedEpics, storyType]);

  const handleStorySelectionChange = (selectedRows: any[]) => {
    console.log("Selected Rows:", selectedRows);
    setSelectedStories(selectedRows);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    formData.considerEmbedding = checked;
    setConsiderEmbedding(checked);
    setFormData((prev:any) => {
      const updatedFormData = { ...prev, [name]: checked };
      localStorage.setItem('considerEmbedding', JSON.stringify(checked)); // Save to localStorage
      return updatedFormData;
    });
  };

  const infoobj = {
    "header": "VelocityAI Workbench Generating",
    "text1": "",
    "text": ""
  }

  useEffect(() => {
    logEvent(`info`,`Generate Requirement screen loaded.`);
    dispatch(setPageTitle('GenAI Assistance in Generating Business Requirements'));
    dispatch(setHeaderTooltip('Please ensure that you review the VAW and GenAI usage policies, terms, and conditions on the community; https://glo.globallogic.com/communities/843'));
    
    const fetchData = async () => {
      try {
        const [ storedProvider, storedtrackingtool, storedConfigJson ] = await Promise.all([
          window.electronAPI.getConfig("provider"),
          window.electronAPI.getConfig("trackingtool"),
          window.electronAPI.getConfig("configJson")
        ]);
  
        if(storedtrackingtool){
          logEvent('info', 'Tracking tool loaded: JIRA');
          console.log(storedtrackingtool);
          setDefaultTrackingTool('jira');
        }

        if(storedConfigJson){
          setAppConfig(storedConfigJson[storedProvider]);
          console.log(storedConfigJson[storedProvider]);
        }

      } catch (error) {
        logEvent('error', 'Failed to fetch configuration from electron-store: Unknown error occurred');
        console.error("Failed to fetch configuration from electron-store:", error);
      }
    }

    fetchData();

    const savedConsiderEmbedding = localStorage.getItem('considerEmbedding');
  if (savedConsiderEmbedding !== null) {
    setConsiderEmbedding(JSON.parse(savedConsiderEmbedding));
    setFormData((prev:any) => ({
      ...prev,
      considerEmbedding: JSON.parse(savedConsiderEmbedding),
    }));
  }

  }, []);

  const checkAISettings = () => {
    if (!appConfig) {
        console.error('appConfig is undefined.');
        return false;
    }
    
    if (appConfig.apiKey === '') {
        return currentAIProvider?.toLowerCase() !== 'ollama';
    } else if (appConfig.endpoint === '') {
        return true;
    } else if (appConfig.model === '') {
        return true;
    } else {
        return false;
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    if (value.startsWith(' ')) return;

    setFormData((prev:any) => {
      const updatedFormData = { ...prev, [name]: value };

      // Validate only the field that is being changed
      validate(updatedFormData, name);

      if (name === 'radioOption') {
        delete errors.inputText;
        delete errors.reqFile;
        delete errors.codeFile;
      }

      return updatedFormData;
    });

    setNewGeneration(false);
};  

  const handleFileChange = (e: any) => {
    const { files } = e.target;
    if (files && files[0]) {
      setFormData((prev:any) => ({
        ...prev,
        codeFile: files[0], // Assign the uploaded file to formData.codeFile
      }));
    }
  };

  const validate = (formData: any, fieldName?: string) => {
    let tempErrors: any = { ...errors };

    const validateField = (field: string) => {
      switch (field) {
        case 'radioOption':
          if (!formData.radioOption) tempErrors.radioOption = 'Please select a radio option.';
          else delete tempErrors.radioOption;
          break;

        case 'userInput':
          if (formData.radioOption === 'option1' && !formData.userInput) {
            tempErrors.inputText = 'Input text is required.';
          } else {
            delete tempErrors.inputText;
          }
          break;

        case 'codeFile':
          if (formData.radioOption === 'option2' && !formData.codeFile) {
            tempErrors.codeFile = 'Design image is required.';
          } else {
            delete tempErrors.codeFile;
          }
          break;

        case 'reqFile':
          if (formData.radioOption === 'option3' && !formData.reqFile) {
            tempErrors.reqFile = 'Requirement document is required.';
          } else {
            delete tempErrors.reqFile;
          }
          break;

        case 'epic_type':
          if (!formData.epic_type) tempErrors.epic_type = 'Please select an epic.';
          else delete tempErrors.epic_type;
          break;

        case 'language':
          if (!formData.language) tempErrors.language = 'Please select a language.';
          else delete tempErrors.language;
          break;
      }
    };

    if (fieldName) {
      validateField(fieldName);
    } else {
      Object.keys(formData).forEach((key) => validateField(key));
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };  

  const hasFormDataChanged = (prevData: any, newData: any) => {
    if (!prevData) return true; // If there's no previous data, consider it changed

    return Object.keys(newData).some((key) => newData[key] !== prevData[key]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (validate(formData)) {
        if (response === null || hasFormDataChanged(response, formData)) {
            localStorage.removeItem('selectedRows');
            setisLoading(true);
            try {
                const result: any = await getPromptsResponses(formData, false, "");
                if (result) {
                    setisLoading(false);
                    setResponse({
                        ...formData, // Store updated formData
                        airesponse: result,
                    });
                    setStep(2);
                    setSelectedEpics([]);
                }
            } catch (error) {
                console.error("Error generating diagrams:", error);
                logEvent(`error`, `Error generating diagrams`);
                setTimeout(() => {
                    setisLoading(false);
                    setStep(1);
                    showToast(`Error generating epics! Check the AI Provider Settings`, 'error');
                }, 100);
            }
        } else {
            setStep(2);
        }
    } 
  };


  const generateStories = async () => {
    let processedEpics = 0;
    let responseData = [];
    setStoryResponse([]);
    if (selectedEpics.length !== 0) {

      if(storyType.length !== 0){
      
      setisLoading(true);
      console.log('Form Data:', selectedEpics, storyType);
      
          try {
            for (let i = 0; i < selectedEpics.length; i++) {
              for (let j = 0; j < storyType.length; j++) {
                
                setIsLoopLoading(true);
                // let story_response: any = await getStoryPrompts(
                //   selectedEpics[i],
                //   storyType[j],
                //   formData.language,
                //   false
                // );
                
                 let story_response = await getSrories(
                  selectedEpics[i],
                  storyType[j],
                  formData.language,
                  considerEmbedding
                );
                
                if (story_response) {
                  setisLoading(false);
                  setStep(3);
                }
            
                console.log('story_response:', story_response);

                if (response) {
                  const parsedResponse = JSON.parse(response?.airesponse);
                  console.log(parsedResponse);
                  if (parsedResponse.EPIC && story_response) {
              
                    parsedResponse.EPIC.forEach((epic: any) => {
                      story_response.forEach((story: any) => {
                        // Check for a matching epic_id
                        console.log(epic);
                        console.log(story);
                        if (story.epic_id === epic.epic_id) {
                          story.jira_issue_id = epic.jira_issue_id;
                          story.jira_issue_link = epic.jira_issue_link;
                          story.jira_status = epic.jira_status;
                          story.epic_title = epic.epic_title;
                          story.epic_desc = epic.epic_desc;
                          console.log(story);
                          // Update the state with the modified storyResponse
                          setStoryResponse((prevResponses: any[]) => 
                            [...(prevResponses || []), story]
                          );
                        }
                      });
                    });

                    localStorage.setItem("selectedRows", JSON.stringify(selectedEpics));
                    localStorage.setItem('storyType', JSON.stringify(storyType));

                  }
                  //setStoryResponse(story_response);
                  console.log('Response:', storyResponse);
                  logEvent(`info`,`Stories generated`)
                }
            
              }

              processedEpics += 1;
              if (processedEpics === selectedEpics.length) {
                console.log('condition satisfies');
                setIsLoopLoading(false); // Hide loader when all epics are processed
                console.log(isLoopLoading);
              }

            }            

          } catch (error) {
            logEvent(`error`,`Error generating stories`);
            console.error("Error generating stories:", error);
            setisLoading(false); // Ensure loading state is stopped
          }

      }else{
        alert( "Select Story type to generate stories"); 
        logEvent('warn', 'Attempt to generate stories without selecting story type.'); 
      }

    } else {
      alert( "Select Epics to generate stories");
      logEvent('warn', 'Attempt to generate stories without selecting epics type.');
    }
  };

  const addtojira = async () => {
    if (selectedEpics.length !== 0) {
      setisLoading(true);
      console.log('selected epics', selectedEpics);
      const result:any = await jiraCreationPost(selectedEpics);
      console.log(result);
      if(result){
        if(result[0].status === 'error'){
          setisLoading(false);
          showToast(result[0].error, 'error');  
        }else{
          console.log(response);
          const parsedResponse = JSON.parse(response.airesponse);
          console.log(parsedResponse);
          const mergedArray = [...parsedResponse.EPIC, ...result];
          const uniqueObjects = Object.values(
            mergedArray.reduce((acc, obj) => {
              acc[obj.epic_title] = obj; // Use `epic_title` as a key to ensure uniqueness
              return acc;
            }, {})
          );
          console.log(uniqueObjects);
          const updatedAIResponse = {
            EPIC: uniqueObjects,
          };
      
          setResponse((prevResponse:any) => ({
            ...prevResponse,
            airesponse: JSON.stringify(updatedAIResponse, null, 2),
          }));
          setisLoading(false);
          showToast(`Epic's added to jira`, 'success');
        }
      }
    }else{
      alert(`Please select EPIC'S to add to`);
    }
  }

  /* const addStorytojira = async () => {
    if (selectedStories.length !== 0) {
      setisLoading(true);
      console.log('selected stories', selectedStories);
      const result:any = await pushStorytojira(selectedStories);
      console.log(result);
      if(result && result.length >= 0){
        setisLoading(false);
        if(result[0].status === "error"){
          showToast(`You are not authorized to add issues`, 'error');  
        }else{
          showToast(`Story added to jira`, 'success');
        }  
      }
    }else{
      alert(`Please select Stories to add to`);
    }
  } */

  const downloadToExcel = () => {
    if (childRef.current) {
      childRef.current.reportDownload(); // Call the child function
    }
  };  

  const handleReset = () => {
    setFormData({
      radioOption: 'option1',
      userInput: '',
      codeFile: null,
      reqFile: null,
      llmmodel: '',
      epic_type: '',
      language: '',
      considerEmbedding: false,
    });
    setStep(1);
    setResponse(null);
    setStoryResponse(null);
    setErrors({});
  };

  const handlePrevious = () => {
    if (step !== 1) {
      setStep(step - 1);
    }
  }

  const handleNext = () => {
    if (step !== 3) {
      setStep(step + 1);
    }
  }

  const handleChange = (event: any) => {
    const {
      target: { value },
    } = event;
  
    const newValue = typeof value === 'string' ? value.split(',') : value;
  
    console.log("New Story Type:", newValue);
  
    setStoryType(() => {
        console.log("Updated Story Type:", newValue);
        return newValue;
    });

    setStoryGeneration(() => {
        const shouldEnable = newValue.length > 0 && selectedEpics.length > 0;
        console.log("Updated Story Generation Status:", shouldEnable);
        return shouldEnable;
    });
  };  

  
const handleDocChange = async (e: any) => {
  const { name, value, files } = e.target;
  if (files[0] && !['application/pdf', 'text/plain'].includes(files[0].type)) {
    showToast(`Only PDF and TXT files are allowed!`, 'error');
    e.target.value = '';
  }
  const file = files?.[0];

  console.log(value);
  console.log(name);

  if(name === 'reqFile'){
    delete errors.reqFile;
    formData.codeFile = '';
  }

  if(name === 'codeFile'){
    delete errors.codeFile;
    formData.reqFile = '';
  }

  if (file) {
    try {
      let fileContent = '';

      if (file.type === 'text/plain') {
        // Read text file as string
        fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });
      } else if (file.type === 'application/pdf') {
        // Handle PDF file
        setisLoading(true);
        fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          console.log(reader);
          reader.onload = async () => {
            try {
              // Use pdfjs-dist to extract PDF text
              const pdfText = await window.electronAPI.pdftotext(reader.result as ArrayBuffer);
              if(pdfText){
                setisLoading(false);
                showToast('File uploaded successfully', 'success');
              }
              console.log(pdfText);
              logEvent(`info`,`File uploaded successfully`)
              resolve(pdfText);
            } catch (error) {
              setisLoading(false);
              logEvent(`error`,`File uploaded failed`)
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsArrayBuffer(file);
        });
      }

      setFormData((prev:any) => ({
        ...prev,
        userInput: fileContent,  // Assign content to userInput
        [name]: file,             // Assign the file to the respective field
      }));

    } catch (error: any) {
      console.error('Error reading file:', error.message);
      logEvent(`error`,`Error reading file`);
    }
  }
};
// Media query for 150% screen resolution
const is150Percent = useMediaQuery('(max-width: 1281px)');

// Media query for 125% screen resolution
const is125Percent = useMediaQuery('(min-width: 1282px) and (max-width: 1920px)');
  

  return (
    <Box
      className='pageWrapper'
    >
      <Card
        className='pageCard'
      >
        <CardContent style={{ padding: "0px" }}>
          <Box className="box-wrapper">
            <Box className="right-section">
              <CustomizedSteppers currentStep={step} steps={['Provide Input', 'Possible Epics', 'Possible Stories']} />
              <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                
                <Alert style={{position:"relative", width:"75vw", display:`${checkAISettings() === true ? 'flex':'none'}`, alignSelf:"center", justifySelf:"center"}} severity="error">
                  To start generating business requirement, please set up your AI provider settings in the Settings page
                </Alert>
                
                <Box>
                {step === 1 &&
                  <>
                  <Box className="scroll-wrapper scrollbravo" style={{paddingBottom:"0px", paddingTop:"0px"}}>
                    <Box className="inputbox" sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 0, }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.considerEmbedding}
                            onChange={handleCheckboxChange}
                            name="considerEmbedding"
                            color="primary"
                          />
                        }
                        label="Consider the context uploaded from the Knowledge Hub"
                      />
                    </Box>
                      {/* 1st Row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width:"92%", ml: 0 }}>
                        <RadioGroup
                          row
                          name="radioOption"
                          value={formData.radioOption}
                          onChange={handleInputChange}
                        >
                          <FormControlLabel
                            value="option1"
                            control={<Radio />}
                            label=""
                          />
                        </RadioGroup>
                        <TextField
                          label="Enter Your Requirements Here..."
                          name="userInput"
                          multiline
                          rows={2}
                          fullWidth
                          value={formData.userInput}
                          onChange={handleInputChange}
                          error={!!errors.inputText}
                          helperText={errors.inputText}
                          disabled={formData.radioOption !== 'option1'}
                          sx={{ ml: 2, width:"100%" }}
                          style={{marginTop:"10px"}}
                        />
                      </Box>

                      {/* 2nd Row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml:0 }}>
                        <RadioGroup
                          row
                          name="radioOption"
                          value={formData.radioOption}
                          onChange={handleInputChange}
                        >
                          <FormControlLabel
                            value="option2"
                            control={<Radio />}
                            label=""
                          />
                        </RadioGroup>
                        <Box sx={{ display: "flex", flexDirection: "column", ml:1 }}>
                          <label>Upload wireframe or design (only .txt, .pdf are allowed)</label>
                          <Box sx={{display:"flex", flexDirection:"row"}}>
                          <Button
                            className='primary-btn'
                            variant="contained"
                            component="label"
                            sx={{ ml: 2, width: "200px" }}
                            disabled={formData.radioOption !== 'option2'}
                          >
                            Choose File
                            <input
                              type="file"
                              accept=".txt, .pdf"
                              hidden
                              name="codeFile"
                              onChange={handleDocChange}
                            />
                          </Button>
                          <span style={{marginTop:"2px", marginLeft:"10px"}}>
                          {formData.codeFile?.name && <Typography><b>Uploaded File:</b> {formData.codeFile?.name}</Typography>}
                          </span>
                          </Box>
                          {errors.codeFile && <Typography color="error" sx={{ ml: 2 }}>{errors.codeFile}</Typography>}
                        </Box>
                        
                      </Box>

                      {/* 3rd Row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 0 }}>
                          <RadioGroup
                              row
                              name="radioOption"
                              value={formData.radioOption}
                              onChange={handleInputChange}
                            >
                              <FormControlLabel
                                value="option3"
                                control={<Radio />}
                                label=""
                              />
                          </RadioGroup>
                          <Box sx={{ display: "flex", flexDirection: "column" , ml: 1}}>
                            <label>Upload your requirements documents to identify the possible Epics (only .txt, .pdf are allowed)</label>
                            <Box sx={{display:"flex", flexDirection:"row"}}>
                            <Button
                              className='primary-btn'
                              variant="contained"
                              component="label"
                              sx={{ ml: 2, width: "200px" }}
                              disabled={formData.radioOption !== 'option3'}
                            >
                              Choose File
                              <input
                                type="file"
                                accept=".txt, .pdf"
                                hidden
                                name="reqFile"
                                onChange={handleDocChange}
                              />
                            </Button>
                            <span style={{marginTop:"2px", marginLeft:"10px"}}>
                            {formData?.reqFile?.name && <Typography><b>Uploaded File:</b> {formData.reqFile.name}</Typography>}
                            </span>
                            </Box>
                            {errors.reqFile && <Typography color="error" sx={{ ml: 2 }}>{errors.reqFile}</Typography>}
                          </Box>
                        </Box>


                      {/* 4th Row */}
                      <Box sx={{ display: 'flex', gap: '5px', mb: 2, ml: 2 }}>
                        <FormControl fullWidth sx={{ width: "34em", ml: 8 }}>
                          <InputLabel id="epic-label">Select Epic Type</InputLabel>
                          <Select
                            labelId="epic-label"
                            name="epic_type"
                            value={formData.epic_type}
                            onChange={handleInputChange}
                            error={!!errors.epic_type}
                          >
                            {epics.map((fw: any) => (
                              <MenuItem value={fw} key={fw}>
                                {fw}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.epic_type && <Typography color="error" sx={{ ml: 2 }}>{errors.epic_type}</Typography>}
                        </FormControl>
                        <FormControl fullWidth sx={{ ml: 1, width: "34em" }}>
                          <InputLabel id="language-label">Select Language</InputLabel>
                          <Select
                            labelId="language-label"
                            name="language"
                            onChange={handleInputChange}
                            value={formData.language}
                            error={!!errors.language}
                          >
                            {languages.map((lang: any) => (
                              <MenuItem value={lang} key={lang}>
                                {lang}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.language && <Typography color="error" sx={{ ml: 2 }}>{errors.language}</Typography>}
                        </FormControl>
                        {/* <FormControl fullWidth sx={{ ml: 1, width: "20em" }}>
                          <InputLabel id="llm-label">Select LLM Model</InputLabel>
                          <Select
                            labelId="llm-label"
                            name="llmmodel"
                            value={formData.llmmodel}
                            onChange={handleInputChange}
                            error={!!errors.llmmodel}
                          >
                            {LLMModels.map((model: any) => (
                              <MenuItem value={model} key={model}>
                                {model}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl> */}
                      </Box>
                    </Box>
                  </>
                }
                {step === 2 &&
                  <Box className="scrollepics" style={{display:"flex", alignSelf:"center", width:"100%"}}>
                    <EpicsTable tableData={response}  onSelectionChange={handleSelectionChange} />
                  </Box>
                }
                {step === 3 &&
                  <Box className="scrollstory" style={{display:"flex", flexDirection:"column", alignSelf:"center", width:"100%"}}>
                    <StoryTable tableData={storyResponse} ref={childRef} onSelectionChange={handleStorySelectionChange} />
                    {isLoopLoading ?
                     <Box sx={{display:"flex", marginTop:"10px", justifyContent:"center", alignContent:"center"}}> 
                     <CircularProgress />
                     <span style={{marginLeft:"10px", marginTop:"5px"}}>Loading More Stories</span>
                     </Box>
                     :
                     ""
                    }
                  </Box>
                }
                </Box>
                <Box className="right-footer">
                  <Box style={{
                    position: 'absolute',
                    top: '-80px',
                    display: 'flex',
                    alignItems: 'center',
                    left: '45%',
                    background: '#ddd',
                    border: '1px solid rgb(204, 204, 204)',
                    width: "195px",
                    padding: '25px 20px',
                    fontSize: '0.9em',
                    opacity: isLoading || isLoopLoading ? 1 : 0,
                    transform: isLoading || isLoopLoading ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
                    boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000
                  }}>
                    <Ailoader text={{"header":"VelocityAIWorkbench Generating", "text1": "", "text": ""}} />
                  </Box>
                  <Box className="resetbutton" sx={{ display: 'flex', mt: 3 }}>
                    <Button className='secondary-btn' disabled={newgeneration || isLoading || response === null || isLoopLoading} variant="outlined" onClick={handleReset}>
                      <RefreshOutlinedIcon style={{marginRight:"5px"}} />
                      Reset
                    </Button>
                    <Box sx={{ flex: 1, justifyContent: "flex-end", display: "flex" }}>
                      {step === 2 &&  
                        <>
                        <Button
                          className='secondary-btn'
                          disabled={isLoading}
                          onClick={addtojira}
                          type="button"
                          sx={{ mr: 2 }}>
                          <DataSaverOnOutlinedIcon style={{marginRight:"5px"}} />  
                          Add Epic to Jira
                        </Button>
                        <FormControl className='multiselect' sx={{ width: 300 }}>
                          <InputLabel id="multiple-checkbox-label">Story Type</InputLabel>
                          <Select
                            labelId="multiple-checkbox-label"
                            id="multiple-checkbox"
                            multiple
                            value={storyType}
                            disabled={isLoading}
                            onChange={handleChange}
                            input={<OutlinedInput label="Story Type" />}
                            renderValue={(selected) => selected.join(', ')}
                          >
                            {stypes.map((stype) => (
                              <MenuItem key={stype} value={stype}>
                                <Checkbox checked={storyType.includes(stype)} />
                                <ListItemText primary={stype} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        </>
                      }
                      {step === 3 && isLoopLoading &&
                      <Box sx={{ marginRight:"2em", display: 'flex', alignItems:"center" }}>
                        <CircularProgress sx={{marginRight:"1em"}} />
                        <span>Loading Stories for Multiple Epics</span>
                      </Box>
                      }
                      <Button
                        className='primary-btn'
                        onClick={handlePrevious}
                        variant="contained"
                        disabled={step === 1 || isLoading || isLoopLoading}
                        type="button"
                        sx={{ mr: 2 }}>
                        <ChevronLeftOutlinedIcon style={{marginRight:"5px"}} />
                        Previous
                      </Button>
                      {step === 1 &&
                        <Button className='primary-btn' 
                        disabled={isLoading || checkAISettings()} 
                        onClick={handleSubmit} 
                        variant="contained" type="submit" sx={{ mr: 2 }}>
                        Next
                          <ChevronRightOutlinedIcon style={{marginLeft:"5px"}} />
                        </Button>
                      }
                      {step === 2 && 
                        <>
                        {storyResponse === null || (JSON.stringify(selectedEpics) !== localStorage.getItem('selectedRows'))
                                          || (JSON.stringify(storyType) !== localStorage.getItem("storyType")) ?
                        <Button
                          className='primary-btn'
                          variant="contained"
                          disabled={isLoading || storyType.length === 0 || selectedEpics.length === 0} 
                          onClick={generateStories}
                          type="button"
                          sx={{ mr: 2 }}>
                          <AutoAwesomeOutlinedIcon style={{marginRight:"5px"}} />  
                          Generate Stories
                        </Button>
                        :
                        <Button className='primary-btn' 
                          onClick={handleNext} 
                          variant="contained" type="submit" sx={{ mr: 2 }}>
                            Next
                            <ChevronRightOutlinedIcon style={{marginLeft:"5px"}} />
                          </Button>
                        }
                        </>
                      }
                      {step === 3 &&
                        <Button
                          className='secondary-btn'
                          disabled={isLoading || isLoopLoading}
                          onClick={downloadToExcel}
                          type="button"
                          sx={{ mr: 2 }}>
                          <FileDownloadOutlinedIcon style={{marginRight:"5px"}} />
                          Download
                        </Button>
                      }
                    </Box>
                  </Box>
                </Box>
    
              </Box>
            </Box>
          </Box>
          <ToastSnackbar />
        </CardContent>
      </Card>
    </Box>
  );
};

export default BravoPage;