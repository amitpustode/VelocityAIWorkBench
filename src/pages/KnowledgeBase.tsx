import React, { useState, useEffect, ChangeEvent, DragEvent } from 'react';
import { styled } from '@mui/material/styles';
import { Button, Box, TextField, Typography } from '@mui/material';
import { Dialog, DialogActions, DialogTitle, DialogContent } from "@mui/material";
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import '../styles/knowledgebase.scss';
import { setHeaderTooltip, setPageTitle } from '@/redux/slices/appSlice';
import TitleBar from '@/components/TitleBar';
import { useDispatch } from 'react-redux';
import Icon from '@/components/Icons';
import { logEvent } from '@/utility/logger';
import { useToast } from '@/components/ToastSnackBar';
import Ailoader from '@/components/Ailoader';

interface Source {
  title: string;
  files: { name: string; base64: string }[]; // Files structure changed to hold base64 data
  links: string;
  folders: string[];
}

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  defaultValue?: string;
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const AddSourceModal: React.FC<AddSourceModalProps> = ({ isOpen, onClose, onSave, defaultValue = "" }) => {
  const [sourceTitle, setSourceTitle] = useState<string>(defaultValue);

  useEffect(() => {
    setSourceTitle(defaultValue);
  }, [defaultValue]);

  const handleSave = () => {
    if (sourceTitle) {
      onSave(sourceTitle);
      setSourceTitle("");
    }
  };

  return (
    isOpen && (
      <div className="modal-overlay">
        <div className="modal">
          <h2>{defaultValue ? "Edit Source" : "Add New Source"}</h2>
          <TextField
            type="text"
            label="Source Title" 
            variant="outlined"
            value={sourceTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSourceTitle(e.target.value)}
          />
          <div className='buttoncontainer'>
          <Button className='primary-btn' onClick={handleSave}>Save</Button>
          <Button className='secondary-btn' onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    )
  );
};

const KnowledgeBase: React.FC = () => {
  const dispatch = useDispatch();
  const { ToastSnackbar, showToast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<"add" | "edit">("add");
  const [editSourceIndex, setEditSourceIndex] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; base64: string }[]>([]);
  const [sidebarstate, Setsidebarstate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);
  const [fileuploadstatus, setFileuploadstatus] = useState<any>({});

  const infoobj = {
    "header":"Embedding Doc(s)",
    "text1":"",
    "text":""
  }

  useEffect(() => {
    logEvent(`info`,`Knowledge Base screen loaded.`);
    const storedSources = JSON.parse(localStorage.getItem("knowledgeSources") || "[]") as Source[];
    logEvent("debug", `Loaded sources from localStorage with ${storedSources.length} items.`);
    console.log(storedSources.length);
    if(storedSources.length === 0){
      const newSource: Source = { title:'source_1', files: [], links: "", folders: [] };
      setSources([...sources, newSource]);
      setSelectedSource(newSource);
    }
    const storedUploadResponse = JSON.parse(localStorage.getItem("uploadStatus") || "{}") as any;
    if(storedUploadResponse !== null){
      console.log(storedUploadResponse);
      setFileuploadstatus(storedUploadResponse);
    }
    setSources(storedSources);
    if(storedSources && storedSources.length > 0) {
      setSelectedSource(storedSources[0]);
      setSelectedFiles(storedSources[0]?.files || []);  // Load stored files if any
    }else{
      const newSource: Source = { title:'source_1', files: [], links: "", folders: [] };
      setSources([...sources, newSource]);
    }
    dispatch(setHeaderTooltip('Please ensure that you review the VAW and GenAI usage policies, terms, and conditions on the community; https://glo.globallogic.com/communities/843'));
  }, []);

  useEffect(() => {
    if (selectedSource) {
      dispatch(setPageTitle(`Knowledge Hub Stacks`));
      setSelectedFiles(selectedSource.files || []);
    }
  }, [selectedSource]);

  useEffect(() => {
    if (sources.length > 0) {
      localStorage.setItem("knowledgeSources", JSON.stringify(sources));
    }
  }, [sources]);

  const handleAddSource = (title: string) => {
    const newSource: Source = { title, files: [], links: "", folders: [] };
    setSources([...sources, newSource]);
    setIsModalOpen(false);
  };

  const handleEditSource = (title: string) => {
    if (editSourceIndex !== null) {
      const updatedSources = [...sources];
      updatedSources[editSourceIndex].title = title;
      setSources(updatedSources);
      setEditSourceIndex(null);
      setIsModalOpen(false);
    }
  };

  const handleDeleteSource = (id: any) => {
    setSourceToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDeleteSource = () => {
    // Ensure sourceToDelete is not null or undefined
    if (sourceToDelete !== null && sourceToDelete !== undefined) {
      // Check if sourceToDelete is a number or can be converted to a valid number
      const indexToDelete = Number(sourceToDelete);
  
      // Validate the index: it should be a valid number and within array bounds
      if (Number.isInteger(indexToDelete) && indexToDelete >= 0 && indexToDelete < sources.length) {
        // Create a shallow copy of the sources array
        const updatedSources = [...sources];
  
        // Remove the item at the specified index
        updatedSources.splice(indexToDelete, 1);
        setSources(updatedSources);
        if(updatedSources.length > 0) {
          setSelectedSource(updatedSources[0]);
        }else if(updatedSources.length === 0){
          setSelectedSource(null);
        }

        // Update the sources or log updated array
        console.log("Updated Sources:", updatedSources);
        logEvent(`info`,`Source Deleted successfully`)
      } else {
        console.error("Invalid sourceToDelete value or index out of range:", sourceToDelete);
        logEvent(`error`,`Delete failed`)
      }
    } else {
      console.error("sourceToDelete is null or undefined");
      logEvent(`error`,`Delete source is null`)
    }
  
    setShowConfirmation(false);
  };  

  const handleDropdownClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setEditSourceIndex(index);
    setSelectedSource(sources[index]);
    setSelectedFiles(sources[index].files);
  };

  const handleDropdownClose = () => {
    setEditSourceIndex(null);
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const allowedFileTypes = ['application/pdf', 'docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const files = Array.from(event.target.files || []);
    const invalidFiles = files.filter((file) => !allowedFileTypes.includes(file.type));

    

    if (invalidFiles.length > 0) {
      showToast('Only .pdf, .docx  files are allowed.', 'error');
      logEvent("warn", "Invalid file type selected.");
      return;
    }
    setIsLoading(true);

    setIsLoading(true);
    const fileDetails = await Promise.all(files.map(file => {
      return new Promise<{ name: string, data: ArrayBuffer }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ name: file.name, data: reader.result as ArrayBuffer });
        };
        //reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }));

    try {

      const response = await window.electronAPI.submitFiles(fileDetails)
      console.log("settingsResponse", response);

      setIsLoading(false);

      if(response){
        if (response?.uploaded_files?.length > 0) {
          let uploadStatus = JSON.parse(localStorage.getItem('uploadStatus') || "{}") as any;

          uploadStatus.uploaded_files = Array.isArray(uploadStatus.uploaded_files) 
          ? uploadStatus.uploaded_files 
          : [];
      
          // Append new files to the existing array
          uploadStatus.uploaded_files = [...uploadStatus.uploaded_files, ...response.uploaded_files];
      
          // Save updated status back to localStorage
          localStorage.setItem('uploadStatus', JSON.stringify(uploadStatus));

          setFileuploadstatus(uploadStatus);
        }
      }
      
      const messages = [];

      if (response?.uploaded_files?.length) {
        const files = response.uploaded_files.join(', ');
        messages.push(`✅ File(s) uploaded successfully - ${files}`);
        logEvent("info", `Files uploaded successfully: ${response.uploaded_files.join(", ")}`);
      }

      if (response?.failed_files?.length) {
        const files = response.failed_files.join(', ');
        messages.push(`❌ File(s) upload failed - ${files}`);
        logEvent("warn", `Some files failed to upload: ${response.failed_files.join(", ")}`);
      }

      if (response?.duplicate_files?.length) {
        const files = response.duplicate_files.join(', ');
        messages.push(`⚠️ Duplicate File(s) - ${files}`);
        logEvent('duplicate_files_detected', files);
      }

      // Show all messages in a single toast if any exist
      if (messages.length) {
        const finalMessage = messages.join('\n');
        showToast(finalMessage, 'info'); // Use 'info' for mixed messages
        logEvent(`info`,finalMessage);
      }


    } catch (error) {
      setIsLoading(false);
      logEvent(`error`,`Error uploading files`)
      console.error("Error uploading files:", error);
    }
  };

  
  
  const handleFileDrop = async(e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    logEvent("info", "File(s) dropped for upload.");
    const allowedFileTypes = ['application/pdf', 'docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const files = Array.from(e.dataTransfer.files || []);
    const invalidFiles = files.filter((file) => !allowedFileTypes.includes(file.type));

   

    if (invalidFiles.length > 0) {
      showToast('Only .pfd, .docx  files are allowed.', 'error');
      return;
    }
    setIsLoading(true);

    setIsLoading(true);

    const fileDetails = await Promise.all(files.map(file => {
      return new Promise<{ name: string, data: ArrayBuffer }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ name: file.name, data: reader.result as ArrayBuffer });
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }));

    try {
      const response = await window.electronAPI.submitFiles(fileDetails)
      logEvent("info", `Dropped files processed successfully.`);
      console.log("settingsResponse", response);
      
      setIsLoading(false);

      if(response){
        setFileuploadstatus(response);
        if (response?.uploaded_files?.length) {
          let uploadStatus = JSON.parse(localStorage.getItem('uploadStatus') || "{}") as any;
      
          // Append new files to the existing array
          uploadStatus.uploaded_files = [...uploadStatus.uploaded_files, ...response.uploaded_files];
      
          // Save updated status back to localStorage
          localStorage.setItem('uploadStatus', JSON.stringify(uploadStatus));
          setFileuploadstatus(uploadStatus);
        }
      }
      
      const messages = [];

      if (response?.uploaded_files?.length) {
        const files = response.uploaded_files.join(', ');
        messages.push(`✅ File(s) uploaded successfully - ${files}`);
        logEvent("info", `Files uploaded successfully: ${response.uploaded_files.join(", ")}`);
      }

      if (response?.failed_files?.length) {
        const files = response.failed_files.join(', ');
        messages.push(`❌ File(s) upload failed - ${files}`);
      }

      if (response?.duplicate_files?.length) {
        const files = response.duplicate_files.join(', ');
        messages.push(`⚠️ Duplicate File(s) - ${files}`);
        logEvent('duplicate_files_detected', files);
      }

      // Show all messages in a single toast if any exist
      if (messages.length) {
        const finalMessage = messages.join('\n');
        showToast(finalMessage, 'info'); // Use 'info' for mixed messages
        logEvent(`info`,finalMessage);
      }

    } catch (error) {
      setIsLoading(false);
      console.error("Error uploading files:", error);
      logEvent(`error`,`Error uploading files`)
    }
    


    

    /*
    const fileDetails = files.map(file => {
      const filePath = (file as any).path;
      if (!filePath) {
        console.error("File path is undefined for file:", file);
        return null;
      }
      return {
        name: file.name,
        path: filePath,
      };
    }).filter(file => file !== null); // Filter out any null values

    if (fileDetails.length === 0) {
      console.error("No valid files to upload.");
      return;
    }

    try {
      const response = await window.electronAPI.submitFiles(files)
      console.log("settingsResponse", response);
    } catch (error) {
      console.error("Error uploading files:", error);
    }*/

    
    
  };

  const handleFileDelete = (fileName: string) => {
    const updatedFiles = selectedFiles.filter((file) => file.name !== fileName);
    if (selectedSource) {
      const updatedSource = { ...selectedSource, files: updatedFiles };
      const updatedSources = sources.map((source, index) =>
        index === sources.indexOf(selectedSource) ? updatedSource : source
      );
      setSources(updatedSources);
      setSelectedFiles(updatedFiles); // Update the selectedFiles after delete
    }
  };

  const handlesidepane = () => {
    Setsidebarstate(!sidebarstate);
  };

  const handleFolderAction = (action: "linkFolder" | "trainLLM") => {
    if (action === "linkFolder" && selectedSource) {
      setIsLoading(true);
      const updatedSource = { ...selectedSource, links: selectedSource.links.trim() };
      const updatedSources = sources.map((source) =>
        source.title === selectedSource.title ? updatedSource : source
      );
      setSources(updatedSources);
      setSelectedSource(updatedSource);
      localStorage.setItem("knowledgeSources", JSON.stringify(updatedSources));
      setTimeout(() => {
        setIsLoading(false);
      },2000);
    } else {
      showToast(`${action}`, 'success');
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false); // Close the confirmation modal without deleting
  };

  return (
    <div className="knowledge-base">
      {/* <div className={`sidebar ${sidebarstate === true ? 'show' : 'hide'}`}>
        <h3>Knowledge Hub Stacks</h3>
        <ul>
          {sources.map((source, index) => (
            <li key={index}
                className={`${selectedSource?.title === source.title ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedSource(source);
                  setSelectedFiles(source.files); // Make sure files are updated on selection
                }}
            >
              <div className='threedotcontainer'>
                <span
                  style={{ justifyContent: "flex-start" }}
                >
                  {source.title}
                </span>
                <Box className="action-btns">
                  <p onClick={() => {
                    setModalAction("edit");
                    setEditSourceIndex(index);
                    setIsModalOpen(true);
                  }}><Icon name="edit_2" size={16} /></p>
                  <p onClick={() => handleDeleteSource(index)}><Icon name="bin" size={16} /></p>
                </Box>
              </div>
            </li>
          ))}
        </ul>
        <Box sx={{ height: "40px", marginTop: "auto", borderTop: "2px solid #fcd7c7" }}>
          <Button className="primary-btn add-source-button" onClick={() => {
            setModalAction("add");
            setIsModalOpen(true);
          }}>
            <Icon name="add_thin" size={25} />
            Add New Source
          </Button>
        </Box>
      </div> */}

      <div className="content">
        <div className='header-container'>
          {/* <div onClick={handlesidepane}>
            {sidebarstate ? 
              <Icon name="arrow-left" size={40} />
              :
              <Icon name="arrow-right" size={40} />
            }
          </div>  */} 
          <TitleBar />
        </div>  
        <Box sx={{ marginLeft: "20px" }}>
          {selectedSource ? (
            <>
              <h3>Files</h3>
              <p>A file represents a document or data uploaded by users. It serves as a foundational element in the knowledge stack, enabling easy access to key information</p>
              <p style={{ marginTop: "0px", padding: "0px", color: "rgba(0,0,0,0.5)" }}>Only .pdf and .docx files are allowed. Once uploaded, context is generated from the text content of these files, enabling advanced search capabilities within the AI-powered chat feature.</p>
              {fileuploadstatus.uploaded_files !== undefined? (
                <>
                  <p style={{ marginBottom: "0px", padding: "0px" }}>Uploaded Files:</p>
                  <ul className='selectedFiles'>
                    {fileuploadstatus.uploaded_files.map((item:any, index:any) => (
                      <li key={index}>
                        <span style={{ marginLeft: '5px'}}>{item}</span>
                        {/* <a onClick={() => handleFileDelete(item)} style={{ marginLeft: '5px', cursor: 'pointer', color: 'red' }}>X</a> */}
                      </li>
                    ))}
                  </ul>
                </>
              ) : "" }
              <div
                className="file-dropzone"
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{ justifyItems: "center", marginTop: "0px" }}
              >
                <p>Drag and drop files here</p>
              </div>
              <Button
                className='primary-btn browsebtn'
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
              >
                Upload & Summarize files
                <VisuallyHiddenInput
                  type="file"
                  accept=".pdf,.docx, .doc, .txt,.csv"
                  onChange={handleFileSelect}
                  multiple
                />
              </Button>

              <Typography sx={{ fontStyle: 'italic', fontSize: '0.80rem', marginTop: 1 }}>
                The files uploaded here can be discussed in chat.
              </Typography>
              {/* <h3>Links</h3>
              <textarea
                className='linkbox'
                value={selectedSource.links || ""}
                onChange={(e) => {
                  const updatedLinks = e.target.value;
                  setSelectedSource({ ...selectedSource, links: updatedLinks });
                }}
                placeholder="Enter links"
              />
              <div className="folders">
                <Button className={`${isLoading && 'textbtndisabled'}`} variant='text' disabled={isLoading} onClick={() => handleFolderAction("linkFolder")}><CreateNewFolderOutlinedIcon /> Embed</Button>
              </div> */}
            </>
          ) : (
            <h4>Select Source in Left Panel, to View Details.</h4>
          )}
        </Box>
        <ToastSnackbar />
      </div>

      {showConfirmation && (
        <Dialog open={showConfirmation} onClose={cancelDelete}>
          <DialogTitle>Delete Source</DialogTitle>
          <DialogContent>
            <p>Are you sure you want to delete this source?</p>
          </DialogContent>
          <DialogActions>
            <Button className="secondary-btn" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button className="primary-btn" onClick={confirmDeleteSource}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <AddSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={modalAction === "add" ? handleAddSource : handleEditSource}
        defaultValue={modalAction === "edit" && editSourceIndex !== null ? sources[editSourceIndex].title : ""}
      />
      <Box style={{position: 'absolute',
                    bottom: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    left: '50%',
                    background:'#ddd',
                    border: '1px solid rgb(204, 204, 204)',
                    width: "120px",
                    padding: '20px 20px',
                    fontSize: '0.9em',
                    opacity: isLoading ? 1 : 0, 
                    transform: isLoading ? 'translateY(0)' : 'translateY(20px)', 
                    transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out', 
                    boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000}}>
          <Ailoader text={infoobj} />            
        </Box>
    </div>
  );
};

export default KnowledgeBase;
