import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { Box, Checkbox, TextField } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const DiagramsTable = (props: any) => {
  const { diagrams, useCaseArray, setUseCaseArray } = props;
  const [selectAll, setSelectAll] = useState(false);

  console.log(diagrams);

  //const diagramsObj = JSON.parse(diagrams);
  const diagramList = diagrams.map((diagram: any, index: number) => {
    if (!diagram) return null; // Skip if diagram is undefined or null
  
    const diagramId = diagram.id || diagram.unique_id || `default_${index}`; 
    return {
      ...diagram,
      id: `${diagramId}_${index}`, // Append index to ensure uniqueness
    };
  }).filter(Boolean); // Remove any null entries from the list

  console.log(diagramList);

  const handleCheckboxChange = (diagram: any) => {
    setUseCaseArray((prevState: any): any => {
      let alreadySelected;
      if(diagram.id){
        alreadySelected = prevState.find((item: any) => item.id === diagram.id);
      }else{
        alreadySelected = prevState.find((item: any) => item.id === diagram.unique_id);
      }
      if (alreadySelected) {
        if(diagram.id){
          return prevState.filter((item: any) => item.id !== diagram.id);
        }else{
          return prevState.filter((item: any) => item.id !== diagram.unique_id);
        }
      } else {
        return [...prevState, diagram];
      }
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);

    if (isChecked) {
      setUseCaseArray(diagramList); // Select all diagrams
    } else {
      setUseCaseArray([]); // Deselect all diagrams
    }
  };

  return (
    <div>
      <Table style={{ border: "1px solid black", width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ border: "1px solid black", padding: "8px" }}>
              <Checkbox
                className="tableCheckbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell style={{ border: "1px solid black", padding: "8px", fontWeight:"bold" }}>Title</TableCell>
            <TableCell style={{ border: "1px solid black", padding: "8px", fontWeight:"bold" }}>Use Case Description</TableCell>
            <TableCell style={{ border: "1px solid black", padding: "8px", fontWeight:"bold" }}>Diagram Type</TableCell>
            <TableCell style={{ border: "1px solid black", padding: "8px", fontWeight:"bold" }}>Framework Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {diagramList &&
            diagramList.map((diagram: any) => (
              <TableRow key={diagram.id}>
                <TableCell style={{ border: "1px solid black", padding: "8px" }}>
                  <Checkbox
                    className="tableCheckbox"
                    checked={useCaseArray.some((item: any) => item.id === diagram.id)}
                    onChange={() => handleCheckboxChange(diagram)}
                  />
                </TableCell>
                <TableCell style={{ border: "1px solid black", padding: "8px" }}>{diagram.title}</TableCell>
                <TableCell style={{ border: "1px solid black", padding: "8px" }}>{diagram.use_case_desc}</TableCell>
                <TableCell style={{ border: "1px solid black", padding: "8px" }}>{diagram.diagram_type}</TableCell>
                <TableCell style={{ border: "1px solid black", padding: "8px" }}>{diagram.framework_name}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DiagramsTable;
