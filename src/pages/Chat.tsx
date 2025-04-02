import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Menu,
  Tooltip,
  Divider,
  Alert,
} from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import "../styles/chat.scss";
import Icon from "@/components/Icons";
import { logEvent } from "@/utility/logger";
import { useNavigate } from "react-router-dom";
import TitleBar from "@/components/TitleBar";
import { useDispatch, useSelector } from "react-redux";
import { setHeaderTooltip, setPageTitle } from "@/redux/slices/appSlice";
import { useToast } from "@/components/ToastSnackBar";
import FormattedResponse from "@/components/FormatChatResponse";
import { useMediaQuery } from '@mui/material';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism, tomorrow, solarizedlight, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy } from "lucide-react";
import Ailoader from "@/components/Ailoader";

type Message = {
  sender: "user" | "bot";
  text: string;
};

type Conversation = {
  id: string;
  name: string;
  messages: Message[];
};

type Role = "user" | "agent";

interface Prompt {
  title: string;
  role: Role;
  description: string;
}

const Chat: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ToastSnackbar, showToast } = useToast();
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<any>(null);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [openRenameModal, setOpenRenameModal] = useState(false);
  const [newConversationName, setNewConversationName] = useState("");
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [sidebarstate, Setsidebarstate] = useState(true);
  const [searchValue, setSearchValue] = useState("general");
  const [toastOpen, setToastOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl1, setAnchorEl1] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMenuOpen1 = Boolean(anchorEl1);

  const [appConfig, setAppConfig] = useState({
    'apiKey':'',
    'endpoint':'',
    'model':''
  });
  const currentAIProvider = useSelector((state:any) => state.app.defaultAIProvider);

  // Dropdown state to control visibility
  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);

  const keywords = [
    "recommendation",
    "implementation",
    "monitor",
    "review",
    "define",
  ];

  const [chatModeDescription, setChatModeDescription] = useState<string>(
    "You are chatting in AI Chat mode."
  );

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversations from localStorage or create a new one if none exists
  useEffect(() => {
    const savedConversations = localStorage.getItem("chatConversations");
  
    if (savedConversations) {
      try {
        const parsedConversations: Conversation[] = JSON.parse(savedConversations);
        
        if (Array.isArray(parsedConversations) && parsedConversations.length > 0) {
          setConversations(parsedConversations);
          dispatch(setPageTitle(`Velocity AI Chat - ${parsedConversations[0].name}`));
          setActiveConversationId(parsedConversations[0].id);
          setMessages(parsedConversations[0].messages);
        } else {
          // Handle case where chatConversations is an empty array
          createNewConversation();
        }
      } catch (error) {
        console.error("Error parsing chat conversations:", error);
        localStorage.removeItem("chatConversations"); // Clear corrupted data
        createNewConversation();
      }
    } else {
      createNewConversation();
    }
  }, []);
  
  // Function to create and store a new conversation
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(), // More reliable than Date.now()
      name: "Conversation 1",
      messages: [],
    };
  
    setConversations([newConversation]);
    setActiveConversationId(newConversation.id);
    setMessages([]);
    localStorage.setItem("chatConversations", JSON.stringify([newConversation]));
    logEvent("info", "New conversation created.");
  };  

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("chatConversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    const storedPrompts = JSON.parse(
      localStorage.getItem("prompts") || "[]"
    ) as Prompt[];
    setPrompts(storedPrompts);
    dispatch(
      setHeaderTooltip(
        "Please ensure that you review the VAW and GenAI usage policies, terms, and conditions on the community; https://glo.globallogic.com/communities/843"
      )
    );
    logEvent(`info`,`Chat screen loaded.`);

    const fetchData = async () => {
      try {
        const [storedSearchValue, storedProvider, storedConfigJson] = await Promise.all([
          window.electronAPI.getConfig("searchpreference"),
          window.electronAPI.getConfig("provider"),
          window.electronAPI.getConfig("configJson")
        ]);

        if (storedSearchValue) {
          setSearchValue(storedSearchValue);
        }else{
          setSearchValue("general");
          const data = {
            searchpreference: 'general'
          };
          await window.electronAPI.saveConfig(data);
        }

        if(storedConfigJson){
          setAppConfig(storedConfigJson[storedProvider]);
          console.log(storedConfigJson[storedProvider]);
        }

      } catch (error) {
        console.error(
          "Failed to fetch configuration from electron-store:",
          error
        );
        logEvent(`error`,`Error fetching data`);
      }
    };

    fetchData();
  }, []);

  const copyToClipboard = (code:any, index:any) => {
    navigator.clipboard.writeText(code);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
    logEvent("info", "Copied to clipboard.");
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!input.trim()) return;
    setLoading(true);
  
    const userMessage: Message = { sender: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    logEvent("info", "User sent a message.");
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "bot", text: "..." },
    ]);
  
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? { ...conv, messages: updatedMessages }
          : conv
      )
    );
  
    setInput("");
  
    try {
      console.log("sending chat messages", input);
      const aiResponseStream = await window.electronAPI.sendChatMessage(input);
  
      let botResponse = "";
      let accumulatedChunk = "";
      let fullMessage = ""; // Keep track of full received text

      for await (const chunk of aiResponseStream) {
        accumulatedChunk += chunk;
        fullMessage += chunk; // Store full received content

        // Only update UI when we have a meaningful unit
        if (/\s/.test(chunk) || chunk.includes("\n") || chunk.includes(".")) {
          botResponse += accumulatedChunk;
          accumulatedChunk = ""; // Reset batch buffer

          // Update UI, but only if we have received a meaningful part
          setMessages((prevMessages) =>
            prevMessages.map((msg, index) =>
              index === prevMessages.length - 1
                ? { ...msg, text: fullMessage } // Use fullMessage to avoid Markdown flickering
                : msg
            )
          );

          const delay = chunk.includes(".") || chunk.includes("\n") ?  1 : 0.3;
          await new Promise((res) => setTimeout(res, delay));
        }
      }
  
      // Finalize the conversation history
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, messages: [...updatedMessages, { sender: "bot", text: botResponse }] }
            : conv
        )
      );
      logEvent("info", "AI response received in Chat");
    } catch (error) {
      console.error("Error receiving message:", error);
      logEvent("error", "Error receiving AI response in Chat.");
    } finally {
      setLoading(false);
    }
  };  

  const handleNewConversation = (): void => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      name: `Conversation ${conversations.length + 1}`,
      messages: [],
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setMessages([]);
    localStorage.setItem(
      "chatConversations",
      JSON.stringify([newConversation, ...conversations])
    );
    logEvent("info", "New conversation created.");
  };

  const handleSelectConversation = (id: string): void => {
    const selectedConversation = conversations.find((conv) => conv.id === id);
    if (selectedConversation) {
      dispatch(setPageTitle(`Velocity AI Chat - ${selectedConversation.name}`));
      setActiveConversationId(id);
      setMessages(selectedConversation.messages);
    }
  };

  const handleRenameConversation = () => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversationId
          ? { ...conv, name: newConversationName }
          : conv
      )
    );
    logEvent("info", `Conversation renamed to ${newConversationName}`);
    setOpenRenameModal(false);
    setDropdownVisible(null); // Close the dropdown after renaming
    localStorage.setItem("chatConversations", JSON.stringify(conversations));
  };

  const handleDeleteConversation = (id: string) => {
      toggleDropdown(id);
      setConversationToDelete(id);
      setShowConfirmation(true);
  };

  const confirmDeleteConversation = () => {
    const updatedConversations = conversations.filter(
      (conv) => conv.id !== conversationToDelete
    );
    setConversations(updatedConversations);

    if (
      activeConversationId === conversationToDelete &&
      updatedConversations.length > 0
    ) {
      setActiveConversationId(updatedConversations[0].id);
      setMessages(updatedConversations[0].messages);
    } else if (updatedConversations.length === 0) {
      setActiveConversationId("");
      setMessages([]);
      createNewConversation();
    }

    localStorage.setItem(
      "chatConversations",
      JSON.stringify(updatedConversations)
    );
    logEvent("warn", "Conversation deleted.");
    setShowConfirmation(false); // Close the confirmation modal
  };

  const cancelDelete = () => {
    setShowConfirmation(false); // Close the confirmation modal without deleting
  };

  const openRenameModalDialog = (id: string, currentName: string) => {
    setSelectedConversationId(id);
    setNewConversationName(currentName);
    setOpenRenameModal(true);
    toggleDropdown(id);
  };

  const closeRenameModalDialog = () => {
    setOpenRenameModal(false);
  };

  const toggleDropdown = (id: string) => {
    setDropdownVisible((prev) => (prev === id ? null : id)); // Toggle the visibility of the dropdown
  };

  const handlesidepane = () => {
    Setsidebarstate(!sidebarstate);
  };

  const handleMenuOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setTimeout(() => {
      if (inputRef.current) {
          inputRef.current.focus();
      }
    }, 0);
  };

  const handleMenuOpen1 = (event: any) => {
    setAnchorEl1(event.currentTarget);
  };

  const handleMenuClose1 = () => {
    setAnchorEl1(null);
  };

  const handleItemClick = (event: any, value: any) => {
    setInput(value);
    handleMenuClose();
  };

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    if (value.startsWith(' ')) return;
    setInput(e.target.value);
  }

  const handleSearchPreference = async (event: any) => {
    const selectedMode = event.target.value;
    setSearchValue(selectedMode);

    const data = {
      searchpreference: event.target.value,
    };
    const response = await window.electronAPI.saveConfig(data);
    if (response) {
      console.log(response);
      showToast(`Search changed to ${event.target.value}`, "success");
      logEvent("info", `Search preference updated to ${event.target.value}`);
    } else {
      showToast(`Failed to set search preference`, "error");
    }
  };

  const highlightKeyPoints = (text: string, keywords: string[]): string => {
    if (!text || !keywords || keywords.length === 0) return text;

    const normalizedText = text.replace(/\s+/g, " ").trim();

    const regex = new RegExp(
      `\\b(${keywords.map((k) => k.trim()).join("|")})\\b`,
      "gi"
    );

    return normalizedText.replace(regex, (match) => `<b>${match}</b>`);
  };

  const checkAISettings = () => {
    if (!appConfig) {
        console.error('appConfig is undefined.');
        return false;
    }
    
    if (appConfig.apiKey === '') {
        return currentAIProvider?.toLowerCase() !== 'ollama';
    } else if (appConfig.endpoint === '') {
        return true;
    } else if (appConfig.model === '') {
        return true;
    } else {
        return false;
    }
  };

    // Media query for 150% screen resolution
    const is150Percent = useMediaQuery('(max-width: 1281px)');
    // Media query for 125% screen resolution
    const is125Percent = useMediaQuery('(min-width: 1282px) and (max-width: 1920px)');
  
    const boxHeight = is150Percent ? 60 : is125Percent ? 40 : 50;

  return (
    <div className="container">
      <div
        id="sidebar"
        className={`sidebar ${sidebarstate === true ? "show" : "hide"}`}
      >
        <Box className="quick-actions">
          <Icon name="apps" size={20} />
          <p>Chat History</p>
          {/* <Icon className="qarrow" name="down_arrow" size={20} /> */}
        </Box>
        {/* <p
          style={{
            fontWeight: "700",
            marginLeft: "20px",
            marginBottom: "0px",
            paddingBottom: "10px",
            borderBottom: "2px solid #fcd7c7",
          }}
        >
          Conversations
        </p> */}
        <ul className={`conversationList ${loading ? "disabled" : "enabled"}`}>
          {conversations
            .sort((a: any, b: any) => b.id - a.id)
            .map((conv) => (
              <li
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`conversationItem ${
                  conv.id === activeConversationId ? "active" : ""
                }`}
              >
                <span className="conversationName">{conv.name}</span>
                <div className="dropdownContainer">
                  <p onClick={() => openRenameModalDialog(conv.id, conv.name)}>
                    <Icon name="edit_2" size={16} />
                  </p>
                  <p onClick={() => handleDeleteConversation(conv.id)}>
                    <Icon name="bin" size={16} />
                  </p>
                </div>
              </li>
            ))}
        </ul>
        <Box className="newchatbtn"
          sx={{
            height: boxHeight,
            marginTop: "auto",
            borderTop: "2px solid #fcd7c7",
          }}
        >
          <Button
            onClick={handleNewConversation}
            className="primary-btn newConversationButton"
            variant="outlined"
            disabled={checkAISettings()}
          >
            <Icon name="add_thin" size={25} />
            New Chat
          </Button>
        </Box>
      </div>
      <div className="chatContainer">
        <div className="chatcontainer-header">
          <div onClick={handlesidepane}>
            {sidebarstate ? (
              <Icon name="arrow-left" size={40} />
            ) : (
              <Icon name="arrow-right" size={40} />
            )}
          </div>
          <TitleBar />
        </div>
        <div className="chatBox" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender === "user" ? "userMessage" : "otherMessage"
              }`}
            >
              <div className="message-content">
                {msg.sender === "bot" ? (
                  msg.text.length > 150 ? (
                    <div className="relative group border border-gray-300 p-4 rounded-md hover:bg-gray-50 transition">
                      {/* Copy Button for Whole Response (Visible only when hovering over response) */}
                      {/* <Button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-200 text-gray-700 px-2 py-1 text-sm rounded hover:bg-gray-300 transition"
                        onClick={() => copyToClipboard(msg.text, "response")}
                      >
                        {copied === "response" ? "Copied!" : <Copy size={16} />}
                      </Button> */}

                      <Markdown
                        components={{
                          code({ node, inline, className, children, ...props }:any) {
                            const match = /language-(\w+)/.exec(className || "");
                            const codeString = String(children).replace(/\n$/, "");

                            return !inline && match ? (
                              <div className="relative group">
                                {/* Copy Button for Code Block (Visible only when hovering over response) */}
                                <Button
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-200 text-gray-700 px-2 py-1 text-sm rounded hover:bg-gray-300 transition"
                                  onClick={() => copyToClipboard(codeString, node.position?.start.offset)}
                                >
                                  {copied === node.position?.start.offset ? "Copied!" : <Copy size={16} />}
                                </Button>
                                <SyntaxHighlighter style={prism} language={match[1]} PreTag="div">
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <span className="relative inline-block">
                                <code className="bg-gray-100 px-1 py-0.5 rounded" {...props}>
                                  {children}
                                </code>
                              </span>
                            );
                          },
                        }}
                      >
                        {msg.text}
                      </Markdown>
                    </div>
                  ) : (
                    // For short bot responses
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightKeyPoints(msg.text, keywords),
                      }}
                    ></span>
                  )
                ) : (
                  // For user messages, show plain text
                  <span>
                  <h4 style={{margin:"0px 0px 5px 0px", display:"flex", alignContent:"center"}}>
                    <PersonOutlineIcon style={{marginRight:"5px", fontWeight:"normal"}} /> You
                  </h4>
                  <span style={{paddingLeft:"30px", display:"flex"}}>
                    {msg.text}
                  </span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="inputArea">
          <Box style={{
              position: 'absolute',
              top: '-80px',
              display: 'flex',
              alignItems: 'center',
              left: '45%',
              background: '#ddd',
              border: '1px solid rgb(204, 204, 204)',
              width: "120px",
              padding: '20px 20px',
              fontSize: '0.9em',
              opacity: loading ? 1 : 0,
              transform: loading ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
              boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 1000
          }}>
            <Ailoader text={{"header": "Velocity.AI Generating", "text1": "", "text": ""}} />
          </Box>
          <div className="inputSection">
            <Alert style={{width:"60vw", display:`${checkAISettings() === true ? 'flex':'none'}`, alignSelf:"center", justifySelf:"center"}} severity="error">
              To start Chatting, please set up your AI provider settings in the Settings page
            </Alert>
            {/* <Alert style={{width:"97%", top:"0px", position:"absolute", left:"0px", display:`${checkAISettings() === true ? 'none':'flex'}`, alignSelf:"center", justifySelf:"center"}} severity="info">
              {searchValue === 'general' && 'You are chatting in AI Chat mode.'}
              {searchValue === 'embedded' && 'You are chatting in Knowledge Hub Chat mode.'}
            </Alert> */}
            <textarea
              ref={inputRef}
              id="outlined-basic"
              className="input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message here..."
              disabled={checkAISettings() || loading}
            />
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <Box sx={{ minWidth: 220 }}>
                <FormControl fullWidth>
                  <Select
                    labelId="search-preference-value"
                    id="search-preference-value"
                    value={searchValue}
                    label=""
                    onChange={handleSearchPreference}
                    disabled={checkAISettings()}
                  >
                    <MenuItem value="general">AI Chat</MenuItem>
                    <MenuItem value="embedded">Knowledge Hub Chat</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <span>
                <Tooltip title="Prompt Library" placement="top" arrow>
                <span>
                  <Button
                    className="promptlibbtn"
                    aria-label="delete"
                    onClick={handleMenuOpen}
                    disabled={checkAISettings()}
                  >
                    <Icon name="quick-prompt1" size={25} />
                  </Button>
                  </span>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                >
                  {prompts &&
                    prompts.map((item) => (
                      <MenuItem
                        className={`promptItem ${
                          item.role === "agent" ? "isagent" : "isuser"
                        }`}
                        key={item.description}
                        value={item.description}
                        onClick={(event) =>
                          handleItemClick(event, item.description)
                        }
                      >
                        <Icon name="bullet" size={35} />

                        {item.title}
                      </MenuItem>
                    ))}
                  <Divider />
                  <MenuItem
                    key="lastprompt"
                    onClick={() =>
                      navigate(`/promptlibrary?label=Prompt Library`)
                    }
                  >
                    Manage Prompts
                  </MenuItem>
                </Menu>
              </span>
              <Button
                onClick={handleSendMessage}
                className="primary-btn sendButton"
                disabled={checkAISettings() || loading || input.trim()==="" || input.trim() === ""}
              >
                <Icon name="up_arrow" size={25} />
              </Button>
            </Box>
            <ToastSnackbar />
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      <Modal open={openRenameModal} onClose={closeRenameModalDialog}>
        <Box className="modalBox">
          <h2>Rename Conversation</h2>
          <TextField
            label="New Conversation Name"
            variant="outlined"
            value={newConversationName}
            onChange={(e) => setNewConversationName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <div className="modalActions">
            <Button onClick={closeRenameModalDialog} className="secondary-btn">
              Cancel
            </Button>
            <Button onClick={handleRenameConversation} className="primary-btn">
              Save
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Confirmation Modal */}

      {showConfirmation && (
        <Dialog open={showConfirmation} onClose={cancelDelete}>
          <DialogTitle>Delete Conversation</DialogTitle>
          <DialogContent>
            <p>Are you sure you want to delete this conversation?</p>
          </DialogContent>
          <DialogActions>
            <Button className="secondary-btn" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button className="primary-btn" onClick={confirmDeleteConversation}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Chat;
