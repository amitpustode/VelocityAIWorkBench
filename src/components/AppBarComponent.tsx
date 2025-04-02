import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    Tooltip,
    Button,
    Avatar,
    Divider,
    ListItemIcon,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
  } from "@mui/material";
  import { useDispatch, useSelector } from "react-redux";
  import { toggleAppBar } from "../redux/slices/appSlice";
  import HeaderMenu from "./HeaderMenu";
  import Menu from "@mui/material/Menu";
  import DnsIcon from "@mui/icons-material/Dns";
  import AssistantIcon from "@mui/icons-material/Assistant";
  import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
  import Logo from "./Logo";
  import { useNavigate } from "react-router-dom";
  import "../styles/common.scss";
  import ProfileDropdown from "./ProfileDropdown";
  import Icon from "./Icons";
  import { useEffect, useState } from "react";
  import { formatDistanceToNow, parseISO } from "date-fns";
  import { Logout, PersonAdd, Settings } from "@mui/icons-material";
  import React from "react";
  import Ailoader from "./Ailoader";
  
  const AppBarComponent = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [notificationData, setNotificationData] = useState<any>();
    const [readStatus, setReadStatus] = useState<boolean>(false);
    const [notificationLimit, setNotificationLimit] = useState(4);
    const [notificationAll, setNotificationAll] = useState<boolean>(false);
    const currentAIProvider = useSelector(
      (state: any) => state.app.defaultAIProvider
    );
    const [notificationDate, setNotificationDate] = useState<string>(
      new Date().toISOString().split("T")[0]
    );
    const [apiHealthData, setApiHealthData] = useState<any>(null);
    const [apiStatus, setApiStatus] = useState<boolean>(false);
  
    const apiHealthCheck = async () => {
      try {
        const response = await window.electronAPI.getServerHealth();
        if (response?.message) {
          addNotification(response.message, "success");
          setApiStatus(true);
        }
      } catch (e: any) {
        setApiStatus(false);
        addNotification("Failed to connect to the server", "error");
        console.error("API health check error:", e);
      }
    };
  
    const addNotification = (message: string, type: string) => {
      if (!apiHealthData || apiHealthData.message !== message) {
        setApiHealthData({ message, type });
      }
    };
  
    // Poll API health every 30 seconds
    useEffect(() => {
      apiHealthCheck(); // Initial call
      const interval = setInterval(apiHealthCheck, 30000);
  
      return () => clearInterval(interval);
    }, [apiHealthData]);
  
    useEffect(() => {
      fetchLogsForDate(notificationDate);
    }, []); // Ensure effect re-runs if `notificationDate` changes
  
    const fetchLogsForDate = async (date: string) => {
      if (!date) {
        console.error("No date provided for fetching logs.");
        return;
      }
  
      try {
        const response: any = await window.electronAPI.fetchLogs(date);
  
        if (response?.error) {
          console.error("Error in response:", response.error);
          return;
        }
  
        if (!response?.data) {
          console.warn("No data found in the response.");
          return;
        }
  
        const parsedData = parseLogData(response.data);
        console.log("Parsed Data:", parsedData);
        setNotificationData(parsedData);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };
  
    const parseLogData = (data: string) => {
      if (!data) {
        console.warn("Empty log data provided for parsing.");
        return [];
      }
  
      const lines = data.split("\n");
      const result = lines
        .filter((line) => line.trim()) // Filter out empty lines
        .map((line, index) => {
          const [timestamp, message] = line.split(" [INFO]: ");
  
          if (!timestamp || !message) {
            console.warn(`Malformed log line skipped: "${line}"`);
            return null;
          }
  
          const timeAgo = formatDistanceToNow(parseISO(timestamp), {
            addSuffix: true,
          });
  
          return {
            id: `${index + 1}`,
            description: message.trim(),
            time: timeAgo,
          };
        })
        .filter((entry) => entry !== null); // Remove null entries
  
      return result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    };
  
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      fetchLogsForDate(notificationDate);
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const navigate = useNavigate();
  
    const dispatch = useDispatch();
    const showAppBar = useSelector((state: any) => state.app.showAppBar);
  
    const handleNotificationClick = () => {
      setReadStatus(true);
      handleClose();
      console.log("notification click");
    };
  
    const handleViewAllBtn = () => {
      if (notificationAll) {
        setNotificationLimit(4);
        setNotificationAll(false);
      } else {
        setNotificationLimit(notificationData.length);
        setNotificationAll(true);
      }
    };
  
    useEffect(() => {
      const data: any = [];
  
      setNotificationData(data);
    }, []);
  
    return (
      <>
        {/* Always Visible: AccountCircle and Toggle Button */}
        <Box
          sx={{
            position: "fixed",
            top: -2,
            right: 1,
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Tooltip title="Toggle Menu" placement="bottom" arrow>
            <div
              style={{ position: "relative", right: "35px" }}
              className="menu-icon"
              onClick={() => dispatch(toggleAppBar())}
            >
              <div className={`bar ${showAppBar ? "open" : ""}`}></div>
              <div className={`bar ${showAppBar ? "open" : ""}`}></div>
              <div className={`bar ${showAppBar ? "open" : ""}`}></div>
            </div>
          </Tooltip>
          <button onClick={handleClick} className="notificationbtn">
            {readStatus === false ? (
              <Icon name="notification-unread" size={25} />
            ) : (
              <Icon name="notification-read" size={25} />
            )}
          </button>
          <ProfileDropdown />
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <List
              style={{
                padding: "5px 10px",
                maxHeight: 550,
                minWidth: 286,
                maxWidth: 360,
              }}
            >
              <ListItem
                onClick={() => {
                  navigate("settings");
                  handleClose();
                }}
                style={{
                  backgroundColor: "#ffece4",
                  border: "1px solid #f37137",
                  cursor: "pointer",
                }}
                className="list-item"
                alignItems="flex-start"
              >
                <ListItemAvatar
                  style={{ position: "relative", top: "10px", left: "5px" }}
                >
                  <Ailoader text="" width="50px" height="50px" />
                </ListItemAvatar>
                <ListItemText
                  sx={{ position: "relative", top: "5px" }}
                  primary={
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: "#f37137", display: "block" }}
                    >
                      {currentAIProvider &&
                      currentAIProvider.toLowerCase() === "azureopenai"
                        ? "Azure"
                        : currentAIProvider.toLowerCase() === "openai"
                        ? "OpenAI"
                        : currentAIProvider.toLowerCase() === "ollama"
                        ? "Ollama"
                        : "Azure"}
                    </Typography>
                  }
                  secondary="Current AI Provider"
                />
              </ListItem>
              {apiHealthData && (
                <ListItem
                  style={{
                    backgroundColor:
                      apiHealthData.type === "success" ? "#d4edda" : "#ffece4",
                    border:
                      apiHealthData.type === "success"
                        ? "1px solid #155724"
                        : "1px solid #f371374",
                    cursor: "pointer",
                  }}
                  className="list-item"
                  alignItems="flex-start"
                >
                  <ListItemText
                    sx={{ position: "relative", top: "5px" }}
                    primary={
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          color:
                            apiHealthData.type === "success"
                              ? "#155724"
                              : "#f37137",
                          display: "block",
                        }}
                      >
                        {apiHealthData.message}
                      </Typography>
                    }
                    secondary="Server Status: API Health Checkup"
                  />
                </ListItem>
              )}
              <Box
                className="sublist-container"
                style={{
                  maxHeight: 450,
                  overflowY: "auto",
                  overflowWrap: "break-word",
                }}
              >
                {notificationData &&
                  notificationData
                    .slice(0, notificationLimit)
                    .map((item: any) => {
                      return (
                        <ListItem
                          style={{ cursor: "pointer" }}
                          onClick={handleNotificationClick}
                          key={item.id}
                          className="list-item"
                          alignItems="flex-start"
                        >
                          <ListItemAvatar>
                            <Avatar
                              alt={item.category}
                              src="/static/images/avatar/1.jpg"
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary=""
                            secondary={
                              <React.Fragment>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  sx={{ color: "#f37137", display: "block" }}
                                >
                                  {item.description}
                                </Typography>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  sx={{ color: "text.danger", display: "block" }}
                                >
                                  {item.time}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                      );
                    })}
              </Box>
              <Button
                onClick={() => handleViewAllBtn()}
                className="view-all-btn"
                variant="contained"
                fullWidth
                size="small"
              >
                {notificationAll ? "View Less" : "View All"}
              </Button>
            </List>
          </Menu>
        </Box>
  
        {/* Conditionally Rendered AppBar */}
        {showAppBar && (
          <AppBar className="app-bar">
            <Toolbar className="tool-bar">
              {/* Logo and Menu */}
              <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                <Tooltip title="VelocityAI" placement="right" arrow>
                  <IconButton
                    className="logobtn"
                    sx={{
                      color: "rgba(0,0,0,1)",
                      width: 50,
                      height: 50,
                      borderRadius: "50%", // Circular button
                    }}
                    onClick={() => navigate("/")}
                  >
                    <Logo />
                  </IconButton>
                </Tooltip>
                <Box sx={{ marginLeft: 2 }}>
                  <HeaderMenu />
                </Box>
              </Box>
            </Toolbar>
          </AppBar>
        )}
      </>
    );
  };
  
  export default AppBarComponent;