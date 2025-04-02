import { useState, MouseEvent, useRef, useEffect } from 'react';
import { Box, List, ListItem, Tooltip, IconButton, Menu, MenuItem, Button } from '@mui/material';
import Icon from './Icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import '../styles/sidebar.scss';
import Logo from './Logo';

interface SubmenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  icon: string;
  label: string;
  path?: string;
  submenu?: SubmenuItem[];
}

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const showAppBar = useSelector((state:any) => state.app.showAppBar);
  const navigate = useNavigate();

  const [isActive, SetIsActive] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Retrieve query parameters
  const page = params.get('label');

  useEffect(() => {
    SetIsActive(page);
    console.log(isActive);
    
  },[page, location]);

  /* const scrollUp = () => containerRef.current?.scrollBy({ top: -100, behavior: 'smooth' });
  const scrollDown = () => containerRef.current?.scrollBy({ top: 100, behavior: 'smooth' }); */

  const menuItems = [
    // Removed for MVP
    // { "icon": "add", "label": "Add", "submenu": [
    //     { "label": "Add Workspace", "header":"Add Workspace", "path": "/addworkspace" },
    //     { "label": "Import Workspace", "header":"Import Workspace", "path": "/addworkspace" }
    //   ]
    // },
    { icon: "support", label: 'Dx Advisor (Not Released)', header:'AI Assisted Digital Transformation Advisory', link:'/external', path: 'underconstruction' },
    { icon: "checklist", label: 'Generate Requirement', header:'GenAI Assistance in Generating Business Requirements', path: '/bravo' },
    { icon: "edit", label: 'Generate Diagrams', header: 'Visualize Your Architecture in Style', path: '/imaginex' },
    { icon: "terminal", label: 'CodeBuddy', header:'AI Assisted Software Development', path: '/codebuddy' },
    { icon: "toggle_switch", label: 'qaCompanion', header:'STLC Workbench', path: '/qacompanion' },
    { icon: "scale", label: 'ScaleQA', header:'Deploy and Execute Testing Enviornment With ScaleQA (Requires GL VPN)', path: '/scaleqa' },
    { icon: "rotate_right", label: 'DevSecOps 360', header:'DevSecOps 360 (Require GL VPN)', link:'https://dso360.globallogic.com:4443/projects', path: '/external' },
  ];

  const bottomMenuItems = [
    { icon: "chat", label: 'Chat', path: '/chat' },
    { icon: "server", label: 'Prompt Library', path: '/promptLibrary' },
    { icon: "book", label: 'Knowledge Hub', path: '/knowledgebase' },
    { icon: "logs", label: 'VAW Logs', path: '/logs' },
    { icon: "cog", label: 'Settings', path: '/settings' },
  ];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [submenuItems, setSubmenuItems] = useState<SubmenuItem[]>([]);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>, submenu?: SubmenuItem[]) => {
    setAnchorEl(event.currentTarget);
    setSubmenuItems(submenu || []);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSubmenuItems([]);
  };

  return (
    <>
    {!showAppBar &&
    <Box
      className="sidebar-container"
    >
      <Tooltip title="VelocityAI Workbench" placement="right" arrow>
          <Button
              className='logobtn'
              onClick={() => navigate('/')}
          >
              
              <Logo />

          </Button>
      </Tooltip>
    <Box className="menu-container" ref={containerRef}>
        {/* Top Menu Items */}
        <List className='top-menu'>
          {menuItems.map((item:any, index) => (
            index === 0 ?
            (
            <ListItem key={index} disablePadding>
              <Tooltip title={item.label} placement="right" arrow>
                <Button
                  className={`
                    squareMenuButton ${isActive === item.label ? 'isactive': ''}
                    ${isActive === "Add Workspace" || isActive === "Import Workspace" ? 'isactive': ''}
                  `}
                  onClick={
                    item.submenu
                      ? (e:any) => handleMenuOpen(e, item.submenu)
                      : undefined
                  }
                >
                  <Icon name={item.icon} size={25} />
                </Button>
              </Tooltip>
              {item.submenu && (
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  sx={{
                    '& .MuiPaper-root': {
                      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)', // Low shadow
                    },
                  }}
                >
                  {submenuItems.map((submenuItem:any, subIndex:any) => (
                    <MenuItem key={subIndex} onClick={handleMenuClose}>
                      <Link
                        to={`${submenuItem.path}?label=${submenuItem.label}&&header=${submenuItem.header}&&link=${submenuItem.link}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {submenuItem.label}
                      </Link>
                    </MenuItem>
                  ))}
                </Menu>
              )}
            </ListItem>
            ) : (
            <ListItem key={index} disablePadding>
              <Link to={`${item.path}?label=${item.label}&&header=${item.header}&&link=${item.link}`}
              >
                <Tooltip title={item.label} placement="right" arrow>
                  <Button
                    className={`squareMenuButton ${isActive === item.label ? 'isactive': ''}`}
                  >
                    <Icon name={item.icon} size={25} />
                  </Button>
                </Tooltip>
              </Link>
            </ListItem>  
            )
          ))}
        </List>

        {/* Bottom Menu Items */}
        <List className='bottom-menu'>
          {bottomMenuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <Link to={`${item.path}?label=${item.label}`}>
                <Tooltip title={item.label} placement="right" arrow>
                  <Button
                    className={`squareMenuButton ${isActive === item.label ? 'isactive': ''}`}>
                    <Icon name={item.icon} size={25} />
                  </Button>
                </Tooltip>
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>
      {/* <Box className="navcontainer-bottom">
          <Tooltip title="Scroll Up" placement="right" arrow>
            <Button className='upbtn' onClick={scrollUp} fullWidth size="small"><ExpandLessIcon /></Button>
          </Tooltip>
          <Tooltip title="Scroll Down" placement="right" arrow>
            <Button className='downbtn' onClick={scrollDown} fullWidth size="small"><ExpandMoreIcon /></Button>
          </Tooltip>
        </Box> */}
    </Box>
    }
    </>
  );
};

export default Sidebar;
