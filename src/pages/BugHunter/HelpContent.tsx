import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const StaticHelpContent = () => {
  return (
    <Box sx={{ marginLeft: "15px", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
          paddingTop: "20px",
        }}
      >
        <Typography>
        The uploaded CSV file should have the following column names and maintain the specified order. All column values should be string format.
        </Typography>
        <Typography
          sx={{
            marginTop: "10px",
          }}
        >
       ["CSR_REQUEST_ID","DF_REQUEST_ID","CSR_TITLE","CSR_DESCRIPTION","CSR_RESOLUTION_CODE","CSR_RESOLUTION_DESC","DF_DEFECT_ANALYSIS","DF_AREA_OF_RESOLUTION","DF_ESCAPE_ANALYSIS","DF_ESCAPE_PREV_REC","DF_ESCAPE_KEYWORDS","DF_PREV_REC","DF_PARENT_REQ_NO","DF_STATUS_NAME","DF_CREATION_DATE","DF_INJECTED_BY_CSR_NO","DF_DEFECT_ASSESSED_BY","DF_ESCAPE_ASSESSED_BY","DF_DEFECT_TYPE","DF_ESCAPE_TYPE","DF_INJECTED_BY_PHASE","CSR_CLIENT_NAME","CSR_IMPACTED_ENV","CSR_STATES","CSR_LOBS","CSR_CREATION_DATE","CSR_RESOLUTION_DATE","CSR_STATUS_NAME"]
        </Typography>
       </Box>
    </Box>
  );
};
export default StaticHelpContent;
