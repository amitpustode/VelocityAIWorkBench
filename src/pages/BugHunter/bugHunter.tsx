import {
  Box,
  Button,
  Table,
  TableBody,
  Typography,
  TextField,
  Grid,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Icon from "@/components/Icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { setHeaderTooltip, setPageTitle } from "@/redux/slices/appSlice";
import CircularProgress from "@mui/material/CircularProgress";
import HelpIcon from '@mui/icons-material/Help';
import HelpContent from "./HelpContent";
import FileUpload from "./FileUpload";

interface Item {
  page_content: any;
  SCORE_ID: number;
  content: string;
}

interface FormattedItem {
  SCORE_ID: number;
  [key: string]: string | number; // Allow dynamic string keys with string or number values
}

const formatData = (data: Item[]): FormattedItem[] => {
  const formattedData = data.map((item) => {
    const contentLines = item.page_content.split("\n");
    const contentObj: { [key: string]: string } = {};

    contentLines.forEach((line: { split: (arg0: string) => [any, any] }) => {
      const [key, value] = line.split(": ");
      if (key && value) {
        contentObj[key.trim()] = value.trim();
      }
    });
    return {
      ...contentObj,
      SCORE_ID: item.SCORE_ID,
    };
  });
  return formattedData;
};

const BeaconPage = () => {
  const [searchQuery, setSearchQuery] = useState<String>("");
  const [tableData, setTableData] = useState<any>([]);
  const dispatch = useDispatch();
  const applogo = useSelector((state: any) => state.app.logo);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const header = params.get("header") || "Default Name";
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [fileUploading, setfileUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [backendError, setBackendError] = useState<any>('');

  const handleDataLoaded = (isLoaded:any) => {
    setfileUploading(isLoaded);
  };


  const handleHelpOpen = () => {
    setHelpOpen(true);
  };

  const handleHelpClose = () => {
    setHelpOpen(false);
  };

  useEffect(() => {
    dispatch(setPageTitle(header));
    dispatch(setHeaderTooltip("Please ensure that you review the VAW and GenAI usage policies, terms, and conditions on the community; https://glo.globallogic.com/communities/843"));
  }, [header]);

  const handleSearch = async (e: any) => {
 
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      try {
        setError(false);
        setDataLoaded(true);
        const response: any = await window.electronAPI.getSearchTicketResponses(
          searchQuery
        );
        if(response.status){
          setTableData([]);
          setStatus(response.status);
          setDataLoaded(false);
        }
        else{
        setStatus("");
        const extractedObjects: any = response.map((item: any[]) => item[0]);
        const extractedScore: any = response.map((item: any[]) => item[1]);
        const result = extractedObjects.map(
          (obj: any, index: string | number) => {
            return {
              ...obj,
              SCORE_ID: extractedScore[index].toFixed(3), // Add 'num' with the corresponding number
            };
          }
        );
        const sortedResult = result.sort(
          (
            a: {
              SCORE_ID: any;
              age: number;
            },
            b: {
              SCORE_ID: any;
              age: number;
            }
          ) => a.SCORE_ID - b.SCORE_ID
        );

        const formattedResult = formatData(sortedResult);
        setTableData(formattedResult.length >=4 ? formattedResult.slice(0, 5) : formattedResult);
        setDataLoaded(false);
      }
    }
      
      catch (error) {
        setBackendError(error);
        console.error("Error generating results:", error);
      }
    } else {
      setError(true);
      setTableData([]);
    }
  
  };

  const handleKeyDown=(e: any)=>{
    if(e.key === "Enter"){
     handleSearch(e);
    }
   }
 

  return (
    <div style ={{
      overflow:"scroll",
      width:"100%",
      height:"100vh",
    }}>

    <Box
      sx={{
      opacity: fileUploading ? 0.5 : 1, 
      pointerEvents: fileUploading ? 'none' : 'auto',
      }}
    >
      <Grid container flexDirection="column" marginLeft="40px">
        <Box sx={{display:"flex", direction:"column"}}>
        <Typography
          variant="h5"
          align="left"
          style={{ marginTop: "10px", marginLeft: "30px" }}
        >
          Search
        </Typography>
        <IconButton style={{alignItems:"center", marginLeft:"10px", marginTop:"5px"}} onClick={handleHelpOpen} aria-label="help">
          <HelpIcon />
        </IconButton>
        <div style={{marginTop:"10px", marginLeft:"50px"}}><FileUpload onDataLoaded={handleDataLoaded}/></div>
        </Box>
       
        <Dialog  maxWidth="md" fullWidth={true} open={helpOpen} onClose={handleHelpClose} aria-labelledby="help-dialog-title">
        {/* <DialogTitle id="help-dialog-title">Help</DialogTitle> */}
        <DialogContent>
         <HelpContent/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHelpClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
   
        <form onSubmit={handleSearch}>
        <Grid container style={{ flexDirection: "column"}}>
          <Grid>
            <TextField
              label="Enter Your Query"
              name="userInput"
              multiline
              rows={2}
              fullWidth
              sx={{ width: "100%" }}
              style={{ marginTop: "10px" }}
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              required
              error={error}
              helperText={error && `Enter Your Query`}
              onKeyDown={handleKeyDown}
              InputProps={{
                style: { width: "1100px" },
              }}
            />
            <span>{status}</span>
          </Grid>
          <Grid style={{ marginTop: "30px"}}>
            <Button
              type="submit"
              className="primary-btn"
              variant="outlined"
            >
              Search
            </Button>
          </Grid>
          <Grid />
        </Grid>
        </form>
      </Grid>
      { backendError ? <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px" 
        >
      <Typography 
       variant="h6"
       color="textSecondary">
        {backendError.message}
      </Typography>
      </Box>:
        <TableContainer
          style={{ maxHeight: 500, overflow: "auto", width: "1100px", marginTop:"30px", marginLeft:"40px", marginBottom:"150px"}}
          component={Paper}
        >

          <Table
            style={{ overflowX: "scroll" }}
            stickyHeader
            aria-label="simple table"
            sx={{ minWidth: 650 }}
          >
            <TableHead>
              <TableRow>
                <TableCell>SCORE</TableCell>
                <TableCell>CSR_REQUEST_ID</TableCell>
                <TableCell>DF_REQUEST_ID</TableCell>
                <TableCell>CSR_TITLE</TableCell>
                <TableCell>CSR_DESCRIPTION</TableCell>
                <TableCell>CSR_RESOLUTION_CODE</TableCell>
                <TableCell>CSR_RESOLUTION_DESC</TableCell>
                <TableCell>DF_DEFECT_ANALYSIS</TableCell>
                <TableCell>DF_AREA_OF_RESOLUTION</TableCell>
                <TableCell>DF_ESCAPE_ANALYSIS</TableCell>
                <TableCell>DF_ESCAPE_PREV_REC</TableCell>
                <TableCell>DF_ESCAPE_KEYWORDS</TableCell>
                <TableCell>DF_PREV_REC</TableCell>
                <TableCell>DF_PARENT_REQ_NO</TableCell>
                <TableCell>DF_STATUS_NAME</TableCell>
                <TableCell>DF_CREATION_DATE</TableCell>
                <TableCell>DF_INJECTED_BY_CSR_NO</TableCell>
                <TableCell>DF_DEFECT_ASSESSED_BY</TableCell>
                <TableCell>DF_ESCAPE_ASSESSED_BY</TableCell>
                <TableCell>DF_DEFECT_TYPE</TableCell>
                <TableCell>DF_ESCAPE_TYPE</TableCell>
                <TableCell>DF_INJECTED_BY_PHASE</TableCell>
                <TableCell>CSR_CLIENT_NAME</TableCell>
                <TableCell>CSR_IMPACTED_ENV</TableCell>
                <TableCell>CSR_STATES</TableCell>
                <TableCell>CSR_LOBS</TableCell>
                <TableCell>CSR_CREATION_DATE</TableCell>
                <TableCell>CSR_RESOLUTION_DATE</TableCell>
                <TableCell>CSR_RESOLUTION_DATE</TableCell>
              </TableRow>
            </TableHead>
            {dataLoaded ? (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "40%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <CircularProgress />
              </div>
            ) : (
              <TableBody>
                {tableData?.map((row: any) => (
                  <TableRow
                    key={row.SCORE_ID}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.SCORE_ID}
                    </TableCell>
                    <TableCell align="right">{row.CSR_REQUEST_ID}</TableCell>
                    <TableCell align="right">{row.DF_REQUEST_ID}</TableCell>
                    <TableCell align="right">{row.CSR_TITLE}</TableCell>
                    <TableCell align="right">{row.CSR_DESCRIPTION}</TableCell>
                    <TableCell align="right">
                      {row.CSR_RESOLUTION_CODE}
                    </TableCell>
                    <TableCell>{row.CSR_RESOLUTION_DESC}</TableCell>
                    <TableCell>{row.DF_DEFECT_ANALYSIS}</TableCell>
                    <TableCell>{row.DF_AREA_OF_RESOLUTION}</TableCell>
                    <TableCell>{row.DF_ESCAPE_ANALYSIS}</TableCell>
                    <TableCell>{row.DF_ESCAPE_PREV_REC}</TableCell>
                    <TableCell>{row.DF_ESCAPE_KEYWORDS}</TableCell>
                    <TableCell>{row.DF_PREV_REC}</TableCell>
                    <TableCell>{row.DF_PARENT_REQ_NO}</TableCell>
                    <TableCell>{row.DF_STATUS_NAME}</TableCell>
                    <TableCell>{row.DF_CREATION_DATE}</TableCell>
                    <TableCell>{row.DF_INJECTED_BY_CSR_NO}</TableCell>
                    <TableCell>{row.DF_DEFECT_ASSESSED_BY}</TableCell>
                    <TableCell>{row.DF_ESCAPE_ASSESSED_BY}</TableCell>
                    <TableCell>{row.DF_DEFECT_TYPE}</TableCell>
                    <TableCell>{row.DF_ESCAPE_TYPE}</TableCell>
                    <TableCell>{row.DF_INJECTED_BY_PHASE}</TableCell>
                    <TableCell>{row.CSR_CLIENT_NAME}</TableCell>
                    <TableCell>{row.CSR_IMPACTED_ENV}</TableCell>
                    <TableCell>{row.CSR_STATES}</TableCell>
                    <TableCell>{row.CSR_LOBS}</TableCell>
                    <TableCell>{row.CSR_CREATION_DATE}</TableCell>
                    <TableCell>{row.CSR_RESOLUTION_DATE}</TableCell>
                    <TableCell>{row.CSR_RESOLUTION_DATE}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>}
     
    </Box>
    </div>
  );
};

export default BeaconPage;
