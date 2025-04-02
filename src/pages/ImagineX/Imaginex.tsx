import { Card, CardContent,
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
  ListSubheader,
  Checkbox,
  Alert,
} from '@mui/material';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import '../../styles/imaginex.scss';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setHeaderTooltip, setPageTitle } from '@/redux/slices/appSlice';
import { FormData, States, Response, Diagram, DiagramParam, FormInput } from '../../types/types';
import { generateDiagrams, prepareFrameworkData } from '@/utility/imaginexUtil';
import { getPromptsResponses } from '@/services/imaginexService';
import DiagramsTable from './DiagramsTable';
import CustomizedSteppers from '@/components/Stepper';
import generateAccordian from './GenerateAccordian';
import Ailoader from '@/components/Ailoader';
import { useToast } from '@/components/ToastSnackBar';
import { logEvent } from '@/utility/logger';

const initialStates: States = {
  totalUsersCount: 0,
  uniqueUserCount: 0,
  totalDiagramsGenerated: 0,
  requestServed: 0,
};

const frameworks = [
  {
    id:"mermaid",
    title: "Mermaid.js",
    subs: [
      { id:"mermaid-Class", title: "Class" },
      { id:"mermaid-Sequence", title: "Sequence" },
      { id:"mermaid-State", title: "State" },
      { id:"mermaid-Gnat", title: "Gnat" },
      { id:"mermaid-XYChart", title: "XYChart" },
      { id:"mermaid-QuadrantChart", title: "QuadrantChart" },
      { id:"mermaid-Mindmap", title: "Mindmap" },
      { id:"mermaid-Pie", title: "Pie" },
      { id:"mermaid-Git", title: "Git" },
      { id:"mermaid-User_Journey", title: "User Journey" },
    ]
  },
  {
    id:"plantuml",
    title: "PlantUML",
    subs: [
      { id: "plantuml-wireframe", title: "Wireframe" },
      { id: "plantuml-C4 Context Diagram", title: "C4 Context Diagram" },
      { id: "plantuml-C4 Container diagram", title: "C4 Container diagram" },
      { id: "plantuml-C4 Component diagram", title: "C4 Component diagram" },
      { id: "plantuml-Flowchart", title: "Flowchart" },
      { id: "plantuml-Sequence", title: "Sequence" },
      { id: "plantuml-Usecase", title: "Usecase" },
      { id: "plantuml-Class", title: "Class" },
      { id: "plantuml-Object", title: "Object" },
      { id: "plantuml-Activity", title: "Activity" },
      { id: "plantuml-Component", title: "Component" },
      { id: "plantuml-Deployment", title: "Deployment" },
      { id: "plantuml-State", title: "State" },
      { id: "plantuml-Timing", title: "Timing" },
    ]
  }
];

const languages = [
  "English", "French", "Hindi", "Japanese", "Mandarin", 
  "Modern Standard Arabic", "Portuguese", "Spanish"
];

const ImagineXPage = () => {
  const dispatch = useDispatch();
  const { ToastSnackbar, showToast } = useToast();
  const [response, setResponse] = useState<Response | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [step, setStep] = useState<any>(1);
  const [useCaseArray, setUseCaseArray] = useState<any>([]);
  const [diagramData, setDiagramData] = useState<any>([]);
  const [isLoading, setisLoading] = useState(false);
  const [newgeneration, setNewGeneration] = useState(true);
  const [aisettings, setAiSettings] = useState(false);
  const [previousFormData, setPreviousFormData] = useState<any>(null);
  const [prevUseCase, setPrevUseCase] = useState<any>(null);
  const [appConfig, setAppConfig] = useState({
    'apiKey':'',
    'endpoint':'',
    'model':''
  });
  const currentAIProvider = useSelector((state:any) => state.app.defaultAIProvider);

  const [formData, setFormData] = useState<FormData>({
    radioOption: 'option1',
    userInput: '',
    selectedIds: [],
    language: 'English',
    codeFile: "",
    reqFile: "",
  });

  const infoobj = {
    "header":"VelocityAIWorkbench Generating",
    "text1":"",
    "text":""
  }

  useEffect(() => {
    logEvent(`info`,`Generate diagrams screen loaded.`);
    dispatch(
      setPageTitle(`Visualize Your Architecture in Style`)
    );
    dispatch(setHeaderTooltip('Please ensure that you review the VAW and GenAI usage policies, terms, and conditions on the community; https://glo.globallogic.com/communities/843'));

    const fetchData = async () => {
      try {
        const [ storedProvider, storedConfigJson ] = await Promise.all([
          window.electronAPI.getConfig("provider"),
          window.electronAPI.getConfig("configJson")
        ]);

        if(storedConfigJson){
          setAppConfig(storedConfigJson[storedProvider]);
          logEvent("info", "Fetched config successfully.");
        }

      } catch (error) {
        logEvent("error", "Failed to fetch configuration from electron-store.");
        console.error("Failed to fetch configuration from electron-store:", error);
      }
    }

    fetchData();

  },[]);

  const checkAISettings = () => {
    if (!appConfig) {
      logEvent("error", "appConfig is undefined.");
        console.error('appConfig is undefined.');
        return false;
    }
    
    if (appConfig.apiKey === '') {
      logEvent("warn", "API key is missing in appConfig.");
        return currentAIProvider?.toLowerCase() !== 'ollama';
    } else if (appConfig.endpoint === '') {
      logEvent("warn", "Endpoint is missing in appConfig.");
        return true;
    } else if (appConfig.model === '') {
      logEvent("warn", "Model is missing in appConfig.");
        return true;
    } else {
        return false;
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if(name === 'userInput'){
      if (value.startsWith(' ')) return;
    }
    console.log(name);
    console.log(value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Validate only the field being updated
    setErrors((prevErrors:any) => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));

    console.log(formData);
    console.log(previousFormData);
    logEvent("debug", `Input change detected. Field: ${name}`);
    setNewGeneration(false);
  };

  const validateField = (name: string, value: any) => {
    switch (name) {
        case "radioOption":
            return value ? "" : "Please select a radio option.";
        case "userInput":
            return formData.radioOption === "option1" && !value ? "Input text is required." : "";
        case "codeFile":
            return formData.radioOption === "option2" && !value ? "Code file is required." : "";
        case "reqFile":
            return formData.radioOption === "option3" && !value ? "Requirements file is required." : "";
        case "selectedIds":
            return value.length ? "" : "Please select at least one framework.";
        case "language":
            return value ? "" : "Please select a language.";
        default:
            return "";
    }
  };
  
  const handleFileChange = async (e: any) => {
    const { name, files } = e.target;
    if (files[0] && !['application/pdf', 'text/plain'].includes(files[0].type)) {
      showToast(`Only PDF and TXT files are allowed!`, 'error');
      logEvent("warn", "Invalid file type uploaded.");
      e.target.value = '';
    }
      const file = files?.[0];

      if(name === 'codeFile'){
        formData.reqFile = '';
      }

      if(name === 'reqFile'){
        formData.codeFile = '';
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
              reader.onload = async () => {
                try {
                  // Use pdfjs-dist to extract PDF text
                  const pdfText = await window.electronAPI.pdftotext(reader.result as ArrayBuffer);
                  if(pdfText){
                    setisLoading(false);
                    showToast('File uploaded successfully', 'success');
                  }
                  console.log(pdfText);
                  logEvent('info', 'File uploaded successfully');
                  resolve(pdfText);
                } catch (error) {
                  setisLoading(false);
                  logEvent('error', `File uploaded failed-${error}`);
                  reject(error);
                }
              };
              reader.onerror = () => reject(new Error('Failed to read file'));
              reader.readAsArrayBuffer(file);
            });
          }
    
          setFormData((prev) => ({
            ...prev,
            userInput: fileContent,  // Assign content to userInput
            [name]: file,             // Assign the file to the respective field
          }));

        } catch (error: any) {
          logEvent("error", "Error reading file.");
          console.error('Error reading file:', error.message);
        }
      }
  };
  
  const validate = () => {
    const tempErrors: any = {};

    tempErrors.radioOption = validateField("radioOption", formData.radioOption);
    tempErrors.userInput = validateField("userInput", formData.userInput);
    tempErrors.codeFile = validateField("codeFile", formData.codeFile);
    tempErrors.reqFile = validateField("reqFile", formData.reqFile);
    tempErrors.selectedIds = validateField("selectedIds", formData.selectedIds);
    tempErrors.language = validateField("language", formData.language);

    // Remove empty errors
    Object.keys(tempErrors).forEach((key) => {
        if (!tempErrors[key]) delete tempErrors[key];
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handlePrevious = () => {
    if(step !== 1){
      setStep(step-1);
    }
  }

  const toggleVisibility = () => {
    setisLoading((prev) => !prev);
  };
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!response || (previousFormData && JSON.stringify(previousFormData) !== JSON.stringify(formData))) {
        console.log(response);
        if (validate()) {
            toggleVisibility();
            const { userInput, selectedIds } = formData;
            console.log(formData);

            try {
                let frameworkData = prepareFrameworkData(selectedIds);
                let responseArry: any[] = [];

                for (let [key, values] of Object.entries(frameworkData)) {
                  let tempresponse:any;
                  console.log('currentAIProvider',currentAIProvider);
                  if(currentAIProvider.toLowerCase() === 'ollama'){
                    tempresponse = await Promise.race([
                      getPromptsResponses(formData, key, values),
                          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 60000))
                      ]);
                  }else{
                    tempresponse = await getPromptsResponses(formData, key, values);
                  }
                  
                    if (tempresponse) {
                        responseArry.push(tempresponse);
                        console.log("responseArry", responseArry);

                        const mergedDiagrams = responseArry
                            .map(str => JSON.parse(str)) // Parse each string into an object
                            .flatMap(obj => obj.diagrams); // Extract and flatten the `diagrams` arrays

                        setResponse({
                            userInput,
                            diagrams: mergedDiagrams,
                        });
                        setUseCaseArray([]);
                        setPreviousFormData(formData);
                    }
                }

              if (responseArry.length === 1 && currentAIProvider.toLowerCase() === "ollama"){
                setResponse(null);
                setDiagramData([]);
                setUseCaseArray([]);
                toggleVisibility();
                showToast(`No response from Ollama!`, "error");
                logEvent("warn", "No response from Ollama.");
              } else if (responseArry.length > 0 && currentAIProvider.toLowerCase() !== "ollama") {
                logEvent("info", "Diagrams generated successfully.");
                    toggleVisibility();
                    setStep(2);
                }

            } catch (error: any) {
                console.error("Error generating diagrams:", error.message || error);
                if(currentAIProvider.toLowerCase() === 'ollama'){
                    setTimeout(() => {
                      toggleVisibility();
                      showToast('Ollama TimedOut!','error');
                  }, 100);  
                }else{
                  setTimeout(() => {
                    toggleVisibility();
                    showToast('Error generating diagrams! Check the AI Provider Settings','error');
                }, 100);
                }
            }
        }
    } else {
        setStep(2);
    }
  };
  
  const handleReset = () => {
    setFormData({
      radioOption: "option1",
      userInput: "",
      codeFile: "",
      reqFile: "",
      selectedIds: [],
      language: "",
    });
    setResponse(null);
    setDiagramData([]);
    setUseCaseArray([]);
    setStep(1);
    setErrors({});
    setisLoading(false);
    setNewGeneration(false);
  };

  const handleUpdateUseCaseArray = (updatedArray: any[]) => {
    setUseCaseArray(updatedArray);
  };

  const G_formInput: FormInput = {
    userInputRadio: "on",
    userInput: formData.userInput
  }

  const imagegeneration = async () => {
    const param: DiagramParam[] = useCaseArray;
    logEvent("info", "Image generation initiated.");
    console.log('image generation');
    if(diagramData.length === 0 || JSON.stringify(prevUseCase) !== JSON.stringify(useCaseArray)){
      if(param && param.length > 0){
        toggleVisibility();
        try {
          let response:any;
          if(currentAIProvider === 'ollama'){
            response = await Promise.race([
              generateDiagrams(param, G_formInput),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 60000))
              ]);
          }else{
            response = await generateDiagrams(param, G_formInput);
          }
          

          if (response) {
            logEvent("info", "Diagrams generated successfully.");
            console.log(response);  
            setDiagramData(response); 
            setStep(3);
            toggleVisibility();
            setPrevUseCase(useCaseArray);
          }

        } catch (error) {
          console.error("Error generating diagrams:", error);
          if(currentAIProvider.toLowerCase() === 'ollama'){
              setTimeout(() => {
                toggleVisibility();
                showToast('Ollama TimedOut!','error');
            }, 100);  
          }else{
            console.error("Error generating diagrams:", error);
          }
        }
      }else{
        logEvent("warn", "No use case selected for diagram generation.");
        alert('Please Select the use case for Generation');
      }
    }else{
      setStep(3);
    }
  }

  return (
    <Box
      className='pageWrapper'
    >
      <Card
        className='pageCard'
      >
        <CardContent style={{padding:"0px"}}>
          <Box className="imaginex box-wrapper">
            <Box className="right-section">
            <Box
              component="form"
              sx={{display:"flex", flexDirection:"column", gap:2 }}
            >
              <CustomizedSteppers currentStep={step} steps={['Provide Input', 'Possible Diagrams', 'Diagrams Generated']} />
              
              <Alert style={{position:"relative", width:"75vw", display:`${checkAISettings() === true ? 'flex':'none'}`, alignSelf:"center", justifySelf:"center"}} severity="error">
                To start generating diagrams, please set up your AI provider settings in the Settings page
              </Alert>
              
              {step === 1 && 
              <>
              <Box className="scroll-wrapper" style={{paddingTop:"25px"}}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width:"90%" }}>
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
                      label="Provide your inputs what you want in diagram"
                      name="userInput"
                      multiline
                      rows={2}
                      fullWidth
                      value={formData.userInput}
                      onChange={handleInputChange}
                      error={!!errors.userInput}
                      helperText={errors.userInput}
                      disabled={formData.radioOption !== 'option1'}
                    />
                  </Box>

                  {/* 2nd Row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                    <Box sx={{display:"flex", flexDirection:"column"}}>
                    <label>Upload your code to identify the possible diagrams (only .txt, .pdf are allowed)</label>
                    <Box sx={{display:"flex", flexDirection:"row"}}>
                      <Button
                        className='primary-btn'
                        variant="contained"
                        component="label"
                        sx={{ ml: 2, width:"200px" }}
                        disabled={formData.radioOption !== 'option2'}
                      >
                        Choose File
                        <input
                          type="file"
                          accept=".txt, .pdf"
                          hidden
                          name="codeFile"
                          onChange={handleFileChange}
                        />
                      </Button>
                      <span style={{marginTop:"2px", marginLeft:"10px"}}>
                      {formData.codeFile.name && <Typography><b>Uploaded File:</b> {formData.codeFile.name}</Typography>}
                      </span>
                    </Box>
                    {errors.codeFile && <Typography color="error" sx={{ ml: 2 }}>{errors.codeFile}</Typography>}
                    </Box>
                  </Box>

                  {/* 3rd Row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                    <Box sx={{display:"flex", flexDirection:"column"}}>
                    <label>Upload your requirements documents to identify the possible diagrams (only .txt, .pdf are allowed)</label>
                    <Box sx={{display:"flex", flexDirection:"row"}}>
                      <Button
                        className='primary-btn'
                        variant="contained"
                        component="label"
                        sx={{ ml: 2 , width:"200px"}}
                        disabled={formData.radioOption !== 'option3'}
                      >
                        Choose File
                        <input
                          type="file"
                          accept=".txt, .pdf"
                          hidden
                          name="reqFile"
                          onChange={handleFileChange}
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
                  <Box sx={{ display: 'flex', mb: 2 }}>
                  <FormControl variant="outlined" sx={{ mr: 1, width: 550, ml: 8 }}>
                      <InputLabel id="framework-label">Select Framework</InputLabel>
                      <Select
                        labelId="framework-label"
                        name="selectedIds" // Matches `formData` key
                        multiple
                        value={formData.selectedIds} // Ensures current state is shown
                        onChange={handleInputChange} // Uses corrected function
                        error={!!errors.selectedIds}
                        renderValue={(selected) => selected.join(", ")}
                      >
                        {frameworks.map((group) => [
                          <ListSubheader key={group.id}>{group.title}</ListSubheader>,
                          group.subs.map((sub) => (
                            <MenuItem key={sub.id} value={sub.id}>
                              <Checkbox checked={formData.selectedIds.includes(sub.id)} />
                              {sub.title}
                            </MenuItem>
                          )),
                        ])}
                      </Select>
                      {errors.selectedIds && <Typography color="error" sx={{ ml: 2 }}>{errors.selectedIds}</Typography>}
                    </FormControl>
                    <FormControl variant='outlined' fullWidth sx={{ ml: 0, width:"42%" }}>
                      <InputLabel id="language-label">Select Language</InputLabel>
                      <Select
                        labelId="language-label"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        error={!!errors.language}
                      >
                        {languages.map((lang) => (
                          <MenuItem value={lang} key={lang}>
                            {lang}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.language && <Typography color="error" sx={{ ml: 2 }}>{errors.language}</Typography>}
                    </FormControl>
                  </Box>
                </Box>
              </>
              }

              {step === 2 &&
              
              <Box className="scrolltable">  
                <Box>
                  <DiagramsTable diagrams={response?.diagrams}
                    useCaseArray={useCaseArray}
                    setUseCaseArray={handleUpdateUseCaseArray} />
                </Box>
              </Box>
              
              }
  
              {step === 3 &&
                <Box className="scrollacordings">  
                  <Box>
                    {generateAccordian(diagramData, formData.language)}
                  </Box>
                </Box>
              }
                <Box className="right-footer">
                  <Box style={{position: 'absolute',
                              top: '-80px',
                              display: 'flex',
                              alignItems: 'center',
                              left: '45%',
                              background:'#ddd',
                              border: '1px solid rgb(204, 204, 204)',
                              width: "190px",
                              padding: '25px 20px',
                              fontSize: '0.9em',
                              opacity: isLoading ? 1 : 0, 
                              transform: isLoading ? 'translateY(0)' : 'translateY(20px)', 
                              transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out', 
                              boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.1)',
                              zIndex: 1000}}>
                    <Ailoader text={infoobj} />            
                  </Box>
                  <Box className="buttonbox" sx={{ display: 'flex', mt: 3 }}>
                    <Button className='secondary-btn' disabled={newgeneration || isLoading || response === null} variant="outlined" onClick={handleReset}>
                      <RefreshOutlinedIcon style={{marginRight:"5px"}} />
                      Reset
                    </Button>
                    <Box sx={{flex: 1, justifyContent: "flex-end", display: "flex"}}>
                      <Button 
                        className='primary-btn' 
                        onClick={handlePrevious} 
                        variant="contained" 
                        disabled={step === 1 || isLoading}
                        type="button" 
                        sx={{ mr: 2 }}>
                        <ChevronLeftOutlinedIcon style={{marginLeft:"5px"}} />
                        Previous
                      </Button>
                      
                      {step === 1 &&
                      <Button className='primary-btn' disabled={isLoading || checkAISettings()} onClick={handleSubmit} variant="contained" type="submit" sx={{ mr: 2 }}>
                        Next
                        <ChevronRightOutlinedIcon style={{marginLeft:"5px"}} />
                      </Button>
                      }
                      
                      {(step === 2) &&
                      <Button 
                        className='primary-btn' 
                        onClick={imagegeneration} 
                        variant="contained" 
                        disabled={step === 3 || isLoading}
                        type="button" 
                        sx={{ mr: 2 }}>
                        {(diagramData.length === 0 || JSON.stringify(prevUseCase) !== JSON.stringify(useCaseArray)) ? (
                        <>
                          <AutoAwesomeOutlinedIcon style={{marginRight:"5px"}} />
                          Generate Diagrams
                        </>
                        ) :
                        (
                          <>
                          Next
                          <ChevronRightOutlinedIcon style={{marginLeft:"5px"}} />
                          </>
                        )}
                      </Button>
                      }

                      {(step === 3) &&
                        <Button className='primary-btn' disabled={true} 
                          variant="contained" type="button" sx={{ mr: 2 }}>
                          Diagrams Generated
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

export default ImagineXPage;
