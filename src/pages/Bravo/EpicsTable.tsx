import * as React from "react";
import { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Checkbox, TextField } from "@mui/material";
import "../../styles/epicsTable.scss";

const EpicsTable = (props: any) => {
  const [rows, setRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState<{ [key: string]: boolean }>({});
  const [editingCell, setEditingCell] = useState<{
    rowId: string | null;
    field: string | null;
  }>({ rowId: null, field: null });

  useEffect(() => {
    const aiResponse = JSON.parse(props.tableData?.airesponse);
    const updatedRows = aiResponse.EPIC;
    setRows([...updatedRows]);

    console.log(updatedRows);
  
    const updatedCheckedRows = updatedRows.reduce(
      (acc: any, row: any) => ({ ...acc, [row.epic_id]: checkedRows[row.epic_id] || false }),
      {}
    );
    setCheckedRows(updatedCheckedRows);
  
    if (selectedRows.length === 0) {
      setSelectedRows(updatedRows.filter((row: any) => checkedRows[row.epic_id]));
    }
  
    setSelectAll(Object.values(updatedCheckedRows).every(Boolean));
    
  }, [props.tableData]);
  
  useEffect(() => {
    if (props.onSelectionChange) {
      props.onSelectionChange(selectedRows);
    }
  }, [selectedRows, props]);

  useEffect(() => {
    const storedSelectedRows = localStorage.getItem("selectedRows");
    if (storedSelectedRows) {
        const parsedRows = JSON.parse(storedSelectedRows);
        setSelectedRows(parsedRows);

        // Sync checkedRows state
        const newCheckedRows = parsedRows.reduce((acc: any, row: any) => {
            acc[row.epic_id] = true;
            return acc;
        }, {});
        setCheckedRows(newCheckedRows);
    }
  }, []);

  const handleHeaderCheckboxClick = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const updatedCheckedRows = rows.reduce((acc, row) => {
      acc[row.epic_id] = newSelectAll;
      return acc;
    }, {} as { [key: string]: boolean });

    setCheckedRows({ ...updatedCheckedRows });
    setSelectedRows(newSelectAll ? [...rows] : []);
  };

  const handleRowCheckboxClick = (row: any) => {
    const isChecked = !checkedRows[row.epic_id];
    const updatedCheckedRows = {
        ...checkedRows,
        [row.epic_id]: isChecked,
    };
    setCheckedRows(updatedCheckedRows);

    const updatedSelectedRows = isChecked
        ? [...selectedRows, row]
        : selectedRows.filter((selectedRow) => selectedRow.epic_id !== row.epic_id);

    setSelectedRows(updatedSelectedRows);

  };

  const handleCellClick = (rowId: string, field: string) => {
    setEditingCell({ rowId, field });
  };

  const handleInputChange = (rowId: string, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.epic_id === rowId ? { ...row, epic_description: value } : row
      )
    );
  };

  const handleBlur = () => {
    setEditingCell({ rowId: null, field: null });
  };

  return (
    <TableContainer component={Paper} elevation={2}>
      <Box style={{ padding: "0px 20px" }}>
        <h3>Epics Table</h3>
      </Box>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={{fontWeight:"bold"}}>
              <Checkbox
                className="tableCheckbox"
                checked={selectAll}
                onChange={handleHeaderCheckboxClick}
              />
            </TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Epic ID</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Epic JiraID</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Title</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Description</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.epic_id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell>
                <Checkbox
                    className="tableCheckbox"
                    checked={selectedRows.some((selectedRow) => selectedRow.epic_id === row.epic_id)}
                    onChange={() => handleRowCheckboxClick(row)}
                />
              </TableCell>
              <TableCell component="th" scope="row">
                {row.epic_id || "N/A"}
              </TableCell>
              <TableCell>{row.jira_issue_id ? (<a target="_blank" href={row.jira_issue_link}>{row.jira_issue_id}</a>) : "-"}</TableCell>
              <TableCell
                onClick={() => handleCellClick(row.epic_id, "epic_title")}
              >
                {editingCell.rowId === row.epic_id &&
                editingCell.field === "epic_title" ? (
                  <TextField
                    value={row.epic_title || ""}
                    onChange={(e) =>
                      handleInputChange(row.epic_id, e.target.value)
                    }
                    onBlur={handleBlur}
                    autoFocus
                    multiline
                    size="small"
                    sx={{width:"400px"}}
                  />
                ) : (
                  row.epic_title || "N/A"
                )}
              </TableCell>
              <TableCell
                onClick={() => handleCellClick(row.epic_id, "epic_description")}
              >
                {editingCell.rowId === row.epic_id &&
                editingCell.field === "epic_description" ? (
                  <TextField
                    value={row.epic_description || ""}
                    onChange={(e) =>
                      handleInputChange(row.epic_id, e.target.value)
                    }
                    onBlur={handleBlur}
                    autoFocus
                    multiline
                    size="small"
                    sx={{width:"532px"}}
                  />
                ) : (
                  row.epic_description || "N/A"
                )}
              </TableCell>
              <TableCell>{row.epic_type || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EpicsTable;
