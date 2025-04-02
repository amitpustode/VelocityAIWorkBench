import React, { useState, useEffect } from "react";
import "../styles/promptLibrary.scss";
import { Button, Box, TextField } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import SearchBar from "@/components/SearchBar";
import Icon from "@/components/Icons";
import "../styles/promptLibrary.scss";
import TitleBar from "@/components/TitleBar";
import { useDispatch } from 'react-redux';
import { setHeaderTooltip, setPageTitle } from '@/redux/slices/appSlice';
import { logEvent } from "@/utility/logger";

type Role = "user" | "agent";

interface Prompt {
  title: string;
  role: Role;
  description: string;
  exampleUserInput: string;
  output: string;
}

interface AddPromptModalProps {
  onSave: (newPrompt: Prompt) => void;
  onCancel: () => void;
  existingPrompt?: Prompt | null;
}

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  open: boolean;
}

const roleStyles: Record<Role, { color: string; icon: string }> = {
  user: { color: "blue", icon: "👤" },
  agent: { color: "green", icon: "🤖" },
};

const predefinedprompts: Prompt[] = [
  {
    "title": "Corporate Policy Advisor",
    "role": "agent",
    "description": "Help with drafting and updating company policies.",
    "exampleUserInput": "How do I create a remote work policy?",
    "output": "Define eligibility, work hours, communication expectations, data security measures, and performance evaluation methods."
  },
  {
    "title": "Meeting Scheduler",
    "role": "agent",
    "description": "Help me schedule meetings based on given participant availability and timezone.",
    "exampleUserInput": "Schedule a 1-hour meeting for 5 participants from India, USA (PST), and UK (GMT) for project discussion next week.",
    "output": "I suggest scheduling the meeting for Monday at 9:30 PM IST / 9:00 AM PST / 5:00 PM GMT."
  },
  {
    "title": "Email Draft Assistant",
    "role": "agent",
    "description": "Help me draft professional emails.",
    "exampleUserInput": "Write an email to the team about the postponed deadline for project submission due to unforeseen challenges.",
    "output": "Subject: Update on Project Deadline\n\nDear Team,\n\nDue to unforeseen challenges, the deadline for [Project Name] has been postponed to [New Deadline]. Thank you for your understanding and continued commitment.\n\nBest regards,\n[Your Name]"
  },
  {
    "title": "Productivity Coach",
    "role": "agent",
    "description": "Assist with optimizing daily schedules for efficiency.",
    "exampleUserInput": "How can I optimize my 9 AM to 6 PM workday for more productivity?",
    "output": "1. Start with high-priority tasks. 2. Reserve afternoons for meetings or routine tasks. 3. Take a 5-minute break every hour. Use productivity tools like Trello for task management."
  },
  {
    "title": "Conflict Resolution Advisor",
    "role": "agent",
    "description": "Suggest strategies for resolving workplace conflicts.",
    "exampleUserInput": "There’s tension between two team members over task ownership. What should I do?",
    "output": "Arrange a one-on-one meeting with both individuals to understand their perspectives. Then, mediate a discussion where you set clear boundaries and responsibilities."
  },
  {
    "title": "Performance Review Helper",
    "role": "agent",
    "description": "Guide me on conducting effective performance reviews.",
    "exampleUserInput": "How can I review an employee who excels at technical work but struggles with teamwork?",
    "output": "Acknowledge their technical contributions, provide specific examples of teamwork struggles, and offer actionable solutions like training or mentorship programs."
  },
  {
    "title": "Presentation Designer",
    "role": "agent",
    "description": "Help me design visually engaging slides for corporate presentations.",
    "exampleUserInput": "Create a slide template for a monthly sales review meeting.",
    "output": "Use a clean, minimal template with a title slide, agenda slide, data visualization slide (bar and line charts), and a concluding summary."
  },
  {
    "title": "Career Growth Advisor",
    "role": "agent",
    "description": "Provide strategies for advancing in a corporate career.",
    "exampleUserInput": "I want to grow into a leadership role in my company. Any tips?",
    "output": "1. Develop communication and team-building skills. 2. Volunteer for cross-department projects. 3. Build a relationship with a mentor in a leadership role."
  },
  {
    "title": "Task Automation Consultant",
    "role": "agent",
    "description": "Suggest automation tools to simplify recurring tasks.",
    "exampleUserInput": "How can I automate sending weekly reports to my manager?",
    "output": "Use Google Sheets with App Script or Excel Macros to create reports and set up automation using Outlook/Gmail for scheduling email delivery."
  },
  {
    "title": "Decision-Making Guide",
    "role": "agent",
    "description": "Provide frameworks for making effective corporate decisions.",
    "exampleUserInput": "How should I decide on a software vendor for my company?",
    "output": "Use a weighted scoring model with criteria such as cost, features, scalability, and vendor support to score and compare your options."
  },
  {
    "title": "Data Analysis Support",
    "role": "agent",
    "description": "Assist with analyzing and interpreting business data.",
    "exampleUserInput": "What insights can I draw from monthly sales data showing a 20% increase in one region?",
    "output": "Focus marketing efforts in that region, analyze customer demographics for patterns, and replicate strategies in other regions."
  },
  {
    "title": "Time Management Expert",
    "role": "agent",
    "description": "Suggest techniques for better time management.",
    "exampleUserInput": "How can I ensure my team meets deadlines for multiple projects?",
    "output": "1. Break tasks into milestones. 2. Use Gantt charts or tools like Asana. 3. Schedule daily stand-ups to track progress."
  },
  {
    "title": "Stress Management Coach",
    "role": "agent",
    "description": "Provide strategies for managing workplace stress.",
    "exampleUserInput": "What can I do to reduce stress during tight deadlines?",
    "output": "Prioritize tasks, delegate responsibilities, and practice relaxation techniques like deep breathing or short walks."
  },
  {
    "title": "Knowledge Sharing Facilitator",
    "role": "agent",
    "description": "Suggest ways to improve knowledge sharing in teams.",
    "exampleUserInput": "Our team struggles to share information across projects. Any ideas?",
    "output": "Use a shared document repository like Notion or Confluence and set up bi-weekly knowledge-sharing sessions."
  },
  {
    "title": "Diversity Advocate",
    "role": "agent",
    "description": "Suggest initiatives to promote workplace diversity.",
    "exampleUserInput": "How can our company become more inclusive?",
    "output": "Create mentorship programs for underrepresented groups, include diverse voices in hiring panels, and set measurable diversity goals."
  }
]


const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel, open }) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">Confirm Action</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} className="secondary-btn">
          Cancel
        </Button>
        <Button onClick={onConfirm} className="primary-btn" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PromptLibrary: React.FC = () => {
  const dispatch = useDispatch();
  const [prompts, setPrompts] = useState<Prompt[]>([]); // Main list of prompts
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]); // List for displaying based on search
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [sidebarstate, Setsidebarstate] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    logEvent(`info`,`Prompt Library screen loaded.`);
    
    // Retrieve stored prompts from localStorage
    const storedPrompts = JSON.parse(localStorage.getItem("prompts") || "[]") as Prompt[];
    
    // Merge the predefined prompts and the stored prompts, ensuring there are no duplicates
    const combinedPrompts = [
      ...storedPrompts,
      ...predefinedprompts.filter(
        (predefinedPrompt) => !storedPrompts.some(storedPrompt => storedPrompt.title === predefinedPrompt.title)
      )
    ];
  
    // Set the prompts in state and filtered prompts initially
    setPrompts(combinedPrompts);
    setFilteredPrompts(combinedPrompts); // Set the initial filtered list
    setSelectedPrompt(combinedPrompts[0]);
    dispatch(setPageTitle('Prompt Details'));
  }, []);

  useEffect(() => {
    if (prompts.length > 0) {
      localStorage.setItem("prompts", JSON.stringify(prompts));
      setSelectedPrompt(selectedPrompt);
    }
  }, [prompts]);

  const addPrompt = (newPrompt: Prompt) => {
    if (editingPrompt) {
      logEvent("info", `Updating existing prompt: ${newPrompt.title}`);
      setPrompts(prompts.map((prompt) => (prompt === editingPrompt ? newPrompt : prompt)));
      setFilteredPrompts(prompts.map((prompt) => (prompt === editingPrompt ? newPrompt : prompt)));
      setSelectedPrompt(selectedPrompt);
    } else {
      logEvent("info", `Adding new prompt: ${newPrompt.title}`);
      setPrompts([...prompts, newPrompt]);
      setFilteredPrompts([...prompts, newPrompt]);
    }
    setIsModalOpen(false);
    setEditingPrompt(null);
  };

  const handlesidepane = () => {
    Setsidebarstate(!sidebarstate);
    logEvent("debug", `Sidebar state toggled: ${!sidebarstate}`);
  }

  const handleDelete = (prompt: Prompt) => {
    logEvent("warn", `Delete initiated for prompt: ${prompt.title}`);
    setPromptToDelete(prompt);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (promptToDelete) {
      logEvent("info", `Prompt deleted: ${promptToDelete.title}`);
      setPrompts(prompts.filter((prompt) => prompt !== promptToDelete));
      setFilteredPrompts(prompts.filter((prompt) => prompt !== promptToDelete));
      setPromptToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleEdit = (prompt: Prompt) => {
    logEvent("info", `Editing prompt: ${prompt.title}`);
    setEditingPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    logEvent("debug", `Search initiated with value: ${value}`);
    const filtered = prompts.filter((prompt) =>
      prompt.title.toLowerCase().includes(value.toLowerCase())
    );
    if (filtered.length === 0) {
      logEvent("warn", `No prompts found for search query: ${value}`);
    }
    setFilteredPrompts(filtered); // Update the filtered list
  };

  return (
    <div className="prompt-library-container">
      <div className={`sidebar ${sidebarstate === true ? 'show':'hide'}`} >
        <SearchBar 
        status="active"
        placeholder="Search here..."
        value={searchValue}
        onChange={handleSearchChange} />
        <p className="sidebar-title">Prompts Library</p>
        <ul className="prompt-list">
          {filteredPrompts.map((prompt, index) => (
            <PromptItem
              key={index}
              prompt={prompt}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={() => setSelectedPrompt(prompt)}
              currentPrompt={selectedPrompt}
            />
          ))}
        </ul>
        <Box className="btn-container">
          <Button className="primary-btn add-button" onClick={() => setIsModalOpen(true)} variant="outlined">
            <Icon name='add_thin' size={25} />
            Create New Prompt
          </Button>
        </Box>
      </div>
      <div className="details-box">
        <div className='header-container'>
          <div onClick={handlesidepane}>
            {sidebarstate ? 
            <Icon name="arrow-left" size={40} /> 
            : 
            <Icon name="arrow-right" size={40} />
            }
          </div>  
          <TitleBar />
        </div>
        <div style={{marginLeft:"20px"}}>
          {selectedPrompt ? (
            <div>
              <h2>{selectedPrompt.title}</h2>
              <h4>Prompt</h4>
              <p>{selectedPrompt.description}</p>
              {selectedPrompt.exampleUserInput &&
              <>
              <h4>Example User Input</h4>
              <p>{selectedPrompt.exampleUserInput}</p>
              </>
              }
              {selectedPrompt.output && 
              <>
              <h4>Example Output</h4>
              <p>{selectedPrompt.output}</p>
              </>
              }
            </div>
          ) : (
            <h4 style={{marginLeft: "20px"}}>Select Prompt in Left Panel, to View Details.</h4>
          )}
        </div>
      </div>
      {isModalOpen && (
        <AddPromptModal
          onSave={addPrompt}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPrompt(null);
          }}
          existingPrompt={editingPrompt}
        />
      )}
      {isConfirmModalOpen && (
        <ConfirmationModal
          open={isConfirmModalOpen}
          message="Are you sure you want to delete this prompt?"
          onConfirm={confirmDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}
    </div>
  );
};

interface PromptItemProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onSelect: () => void;
  currentPrompt: any;
}

const PromptItem: React.FC<PromptItemProps> = ({ prompt, onEdit, onDelete, onSelect, currentPrompt  }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <li onClick={onSelect} className={`prompt-item ${prompt.role === 'agent' ? 'isagent':'isuser'} 
                                        ${currentPrompt?.title === prompt.title ? 'selected' : ''}`}>
      <div style={{display:"flex",alignItems:"center"}} >
        <span><Icon name="bullet" size={35} /></span>
        {prompt.title}
      </div>
      <Box className="action-btns">
        <span onClick={() => {
            onEdit(prompt);
          }}><Icon name="edit_2" size={16} /></span>
        <span  onClick={() => {
            handleClose();
            onDelete(prompt);
          }}><Icon name="bin" size={16} /></span>
      </Box>
    </li>
  );
};

const AddPromptModal: React.FC<AddPromptModalProps> = ({
  onSave,
  onCancel,
  existingPrompt = null,
}) => {
  const [title, setTitle] = useState<string>(existingPrompt?.title || "");
  const [role, setRole] = useState<Role>(existingPrompt?.role || "user");
  const [description, setDescription] = useState<string>(existingPrompt?.description || "");
  const [exampleUserInput, setExampleUserInput] = useState<string>(existingPrompt?.exampleUserInput || "");
  const [output, setOutput] = useState<string>(existingPrompt?.output || "");

  const handleSave = () => {
    if (title.trim() && description.trim()) {
      onSave({ title, role, description, exampleUserInput, output });
    } else {
      alert("Please fill out all fields");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{existingPrompt ? "Edit Prompt" : "Add New Prompt"}</h2>
        <TextField
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="select"
        >
          <option value="user">User</option>
          <option value="agent">Agent</option>
        </select>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea"
        />
        <div className="modal-actions">
          <Button onClick={handleSave} className="primary-btn save-button">
            Save
          </Button>
          <Button onClick={onCancel} className="secondary-btn cancel-button">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptLibrary;
