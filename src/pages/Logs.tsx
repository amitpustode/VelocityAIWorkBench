import { Box, Card, CardContent, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import '../styles/logs.scss';
import { useEffect, useState } from 'react';
import { logEvent } from '@/utility/logger';

const LogsPage = () => {
  const [logs, setLogs] = useState<string>(''); // Unfiltered logs
  const [errors, setError] = useState(null);
  const [filteredLogs, setFilteredLogs] = useState<string>(''); 
  const [selectedLogLevel, setLogLevel] = useState('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); 

  useEffect(() => {
    logEvent('info', `Logs page loaded. Fetching logs for date: ${selectedDate}`);
    fetchLogsForDate(selectedDate); 
  }, [selectedDate]);

  useEffect(() => {
    filterLogs();
  }, [selectedLogLevel, logs]);

  const fetchLogsForDate = async (date: any) => {
    console.log(date);
    try {
      const response: any = await window.electronAPI.fetchLogs(date);

      if (response.error) {
        logEvent('error', `Error fetching logs: ${response.error}`);
        console.error(response.error);
        setError(response.error);
        setLogs('');
        setFilteredLogs('');
        return;
      } else {
        logEvent('info', `Logs successfully fetched for date: ${date}`);
        setError(null);
      }

      const formattedLogs = formatLogs(response.data || '');
      setLogs(formattedLogs);
      setFilteredLogs(formattedLogs);
    } catch (error) {
      logEvent('error', `Failed to fetch logs: ${error}`);
      console.error("Error fetching logs:", error);
    }
  };

  function formatLogs(logData: string): string {
    logEvent('debug', 'Formatting logs data');
    return logData
      .split('\n')
      .filter(entry => entry.trim()) 
      .map(entry => {
        const [timestamp, level, ...messageParts] = entry.split(' '); 
        const time = new Date(timestamp).toLocaleTimeString(); 
        const message = messageParts.join(' '); 
        return `${time} ${level.replace(':', '')} ${message}`; 
      })
      .reverse()
      .join('\n');
  }

  const filterLogs = () => {
    console.log("Filtering for level:", selectedLogLevel);
    
    if (selectedLogLevel === 'all') {
      setFilteredLogs(logs);
      return;
    }
  
    const filtered = logs
      .split('\n')
      .filter(log => {
        const logParts = log.match(/\[(.*?)\]/) || '';
        if (logParts.length > 1) {
          const logLevel = logParts[1].trim();
          console.log(logParts);
          console.log("Log Entry:", log, " | Extracted Level:", logLevel); // Debugging
          return logLevel.toUpperCase() === selectedLogLevel.toUpperCase();
        }
        return false;
      })
      .join('\n');
  
    setFilteredLogs(filtered || 'No logs found for the selected log level.');
  };  

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    logEvent('info', `Date changed to: ${event.target.value}`);
    setSelectedDate(event.target.value);
  };

  const handleLogLevelChange = (event: SelectChangeEvent) => {
    logEvent('info', `Log level changed to: ${event.target.value as string}`);
    setLogLevel(event.target.value as string);
  };

  return (
    <Box className="pageWrapper">
      <Card className="pageCard">
        <CardContent style={{ overflowY: 'scroll', height: '700px', scrollbarWidth: "thin" }}>
          <h2>Logs</h2>
          <Box sx={{ display: "flex", gap: 5, marginTop: "30px" }}>
            <TextField
              label="Select Date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              style={{ marginBottom: '20px' }}
            />
            <FormControl sx={{ width: "20em" }}>
              <InputLabel id="log-level">Log Level</InputLabel>
              <Select
                labelId="log-level"
                id="log-level"
                value={selectedLogLevel}
                label="Filter Logs"
                onChange={handleLogLevelChange}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="debug">Debug</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warn">Warn</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {errors ? (
            <pre className="logWrapper" style={{ color: 'red' }}>No Logs for selected Date</pre>
          ) : (
            <pre className="logWrapper">{filteredLogs}</pre>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LogsPage;