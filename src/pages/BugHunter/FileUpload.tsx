import React, { useRef, useState } from "react";
import { Button, Box, Typography, CircularProgress } from "@mui/material";


function FileUpload( { onDataLoaded } : any) {
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [status, setStatus] = useState<string>("")
  const fileInputRef = useRef<any>(null);

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
 
    if (file) {
      setFileName(file.name);
      setLoading(true);
      setUploadSuccess(false);
      setUploadError("");
      onDataLoaded(true);
  
      try {
        const fileBuffer = await file.arrayBuffer();
        const fileBlob = new Blob([fileBuffer], { type: file.type });
        
        // Convert file to Base64 for serialization
        const reader = new FileReader();
        reader.onload = async () => {
  
          const fileData = {
            name: file.name,
            type: file.type,
            data: fileBuffer, // Base64 representation
          };
  
          const response: any = await window.electronAPI.uploadBugHunterCSV(fileData);
 
          if(response?.status || response?.uploaded_files.length >= 1){
            setStatus(response.status);
            setUploadSuccess(true);
            onDataLoaded(false);
           }else{
            setUploadSuccess(false);
            setLoading(false);
            setUploadError("Upload Failed");
            onDataLoaded(false);
           }
        };
        reader.readAsDataURL(fileBlob);
     
      } catch (error) {
        setUploadError("Upload Failed");
        setLoading(false);
        onDataLoaded(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; 
        }
        console.error("Upload error:", error);
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", ml: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Button
          className="primary-btn"
          variant="contained"
          component="label"
          sx={{ ml: 2, width: "200px" }}
          disabled={loading}
        >
          Upload CSV
          <input
            type="file"
            accept=".csv"
            hidden
            name="codeFile"
            onChange={(event) => handleFileChange(event)}
            ref={fileInputRef}
          />
        </Button>

        {loading && <CircularProgress/>}
        <span style={{ marginTop: "2px", marginLeft: "10px" }}>
          {uploadSuccess  && (
            <Typography>
              <b>Uploaded Success:</b> File name is : {fileName}
            </Typography>
          )}
        </span>
        <span style={{ marginTop: "2px", marginLeft: "10px" }}>
          {uploadError && (
            <Typography>
              <b>{uploadError}</b>
            </Typography>
          )}

          
        </span>

        <span style={{ marginTop: "2px", marginLeft: "10px" }}>
          {status && (
            <Typography>
              <b>{status}</b>
            </Typography>
          )}

          
        </span>
      </Box>
    </Box>
  );
}



export default FileUpload;
