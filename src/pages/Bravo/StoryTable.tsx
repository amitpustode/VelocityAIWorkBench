import React, { forwardRef, useImperativeHandle } from 'react';
import { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import { Box, TextField } from '@mui/material';
import ExcelJS from 'exceljs';
import "../../styles/storyTable.scss";

const StoryTable = forwardRef((props: any, ref) => {
  const [rows, setRows] = useState<any>(props.tableData.flat());
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  console.log('first',props.tableData.flat());

  useEffect(() => {
    if (props.onSelectionChange) {
      props.onSelectionChange(selectedRows);
    }
  }, [selectedRows]);

  useEffect(() => {
    setRows(props.tableData.flat());
    console.log('table data 1',props.tableData.flat());
  },[props]);

  useImperativeHandle(ref, () => ({
    reportDownload() {
      console.log('Child function has been called!');
      downloadxl();
    },
  }));

  const downloadxl = () => {
    console.log('download_rows',rows);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stories');

    worksheet.columns = [
      { header: "Epic ID", key: "epic_id", width: 15 },
      { header: "Epic Title", key: "epic_title", width: 30 },
      { header: "Story ID", key: "story_id", width: 15 },
      { header: "Story Title", key: "story_title", width: 40 },
      { header: "Story Description", key: "story_desc", width: 60 },
      { header: "Primary Persona", key: "primary_persona", width: 20 },
      { header: "Acceptance Criteria", key: "acceptance_crit", width: 50 },
      { header: "Business Domain", key: "business_domain", width: 20 },
      { header: "Task Size", key: "t_size", width: 10 },
      { header: "Complexity", key: "complexity", width:10 }
    ];
  
    worksheet.addRows(rows);
  
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, "").split(".")[0];
  
    const fileName = `story_table_${timestamp}.xlsx`;
  
    workbook.xlsx.writeBuffer()
      .then((buffer) => {
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error writing Excel file:", error);
      });
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    if (newSelectAll) {
      setSelectedRows(rows);
    } else {
      setSelectedRows([]);
    }
  };

  const toggleRowSelection = (row: any) => {
    const isSelected = selectedRows.some((selected) => selected.story_id === row.story_id);

    const updatedSelectedRows = isSelected
      ? selectedRows.filter((selected) => selected.story_id !== row.story_id)
      : [...selectedRows, row];

    setSelectedRows(updatedSelectedRows);
    setSelectAll(updatedSelectedRows.length === rows.length);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, storyId: string, field: string) => {
    const updatedRows = rows.map((row: any) => {
      if (row.story_id === storyId) {
        return {
          ...row,
          [field]: e.target.value,
        };
      }
      return row;
    });
    setRows(updatedRows);
  };

  const handleEditClick = (epicId: string, storyId: string, field: string) => {
    setEditingId({ epicId, storyId, field });
  };

  const [editingId, setEditingId] = useState<{ epicId: string | null; storyId: string | null; field: string | null }>({
    epicId: null,
    storyId: null,
    field: null,
  });

  const handleBlur = () => {
    setEditingId({ epicId: null, storyId: null, field: null });
  };

  return (
    <TableContainer component={Paper} elevation={2}>
      <Box style={{ padding: "0px 20px" }}>
        <h3>Possible Stories</h3>
      </Box>
      <Table sx={{ minWidth: 650 }} aria-label="story table">
        <TableHead>
          <TableRow>
            {/* <TableCell>
              <Checkbox
                checked={selectAll}
                onChange={toggleSelectAll}
                className="tableCheckbox"
              />
            </TableCell> */}
            <TableCell sx={{fontWeight:"bold"}}>Epic ID</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Epic Title</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Epic JiraID</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Story JiraID</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Story ID</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Story Title</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Story Description</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Acceptance Criteria</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Task Size</TableCell>
            <TableCell sx={{fontWeight:"bold"}}>Complexity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row: any, index: any) => (
            <TableRow key={row.story_id+`_${index}`}>
              {/* <TableCell>
                <Checkbox
                  checked={selectedRows.some((selected) => selected.story_id === row.story_id)}
                  onChange={() => toggleRowSelection(row)}
                  className="tableCheckbox"
                />
              </TableCell> */}
              <TableCell>{row.epic_id}</TableCell>
              <TableCell>{row.epic_title}</TableCell>
              <TableCell>{row.jira_issue_id ? (<a target="_blank" href={row.jira_issue_link}>{row.jira_issue_id}</a>) : "-"}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>{row.story_id}</TableCell>
              <TableCell onClick={() => handleEditClick(row.epic_id, row.story_id, 'story_title')}>
                {editingId.epicId === row.epic_id && editingId.storyId === row.story_id && editingId.field === 'story_title' ? (
                  <TextField
                    value={row.story_title}
                    onChange={(e: any) => handleFieldChange(e, row.story_id, 'story_title')}
                    onBlur={handleBlur}
                    variant="outlined"
                    size="small"
                    multiline
                    autoFocus
                  />
                ) : (
                  row.story_title
                )}
              </TableCell>
              <TableCell onClick={() => handleEditClick(row.epic_id, row.story_id, 'story_desc')}>
                {editingId.epicId === row.epic_id && editingId.storyId === row.story_id && editingId.field === 'story_desc' ? (
                  <TextField
                    value={row.story_desc}
                    onChange={(e: any) => handleFieldChange(e, row.story_id, 'story_desc')}
                    onBlur={handleBlur}
                    variant="outlined"
                    size="small"
                    multiline
                    autoFocus
                  />
                ) : (
                  row.story_desc
                )}
              </TableCell>
              <TableCell onClick={() => handleEditClick(row.epic_id, row.story_id, 'acceptance_crit')}>
                {editingId.epicId === row.epic_id && editingId.storyId === row.story_id && editingId.field === 'acceptance_crit' ? (
                  <TextField
                    value={row.acceptance_crit}
                    onChange={(e: any) => handleFieldChange(e, row.story_id, 'acceptance_crit')}
                    onBlur={handleBlur}
                    variant="outlined"
                    size="small"
                    multiline
                    autoFocus
                  />
                ) : (
                  row.acceptance_crit
                )}
              </TableCell>
              <TableCell>{row.t_size}</TableCell>
              <TableCell>{row.complexity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default StoryTable;