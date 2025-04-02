import { useEffect, useState } from 'react';
import { Menu, MenuItem, IconButton, Avatar, Typography, ListItemIcon } from '@mui/material';
import { AccountCircle, Settings } from '@mui/icons-material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useNavigate } from 'react-router-dom';
import '../styles/common.scss';
import { useDispatch, useSelector } from 'react-redux';
import { setLogo, setProfilePhoto } from '@/redux/slices/appSlice';

const ProfileDropdown = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const pPhoto = useSelector((state:any) => state.app.profilePhoto);
    const nickName = useSelector((state:any) => state.app.nickName);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleSettingsClick = () => {
        navigate('settings');
        handleClose();
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedConfigJson = await window.electronAPI.getConfig("configJson");
                
                if(storedConfigJson){
                    dispatch(setProfilePhoto(storedConfigJson.profilePhoto));
                }
            } catch (error) {
                console.error("Failed to fetch configuration from electron-store:", error);
            }
        };
    
        fetchData();
    },[]);

    return (
        <>
            <IconButton
                className="profile-button"
                color="inherit"
                onClick={handleClick}
                size="large"
                sx={{ mr: 5,  }}
            >
                {pPhoto ? (
                    <>
                    <Avatar style={{width:"30px",height:"30px"}} src={pPhoto} />
                    </>
                ) : (
                    <>
                    <AccountCircle />
                    </>
                )}
                <Typography>{nickName !== '' ? nickName : 'Guest'}</Typography>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                paper: {
                    elevation: 0,
                    sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                    },
                    '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                    },
                    },
                },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleSettingsClick}>
                <ListItemIcon>
                    <Settings fontSize="small" />
                </ListItemIcon>
                Settings
                </MenuItem>
            </Menu>

        </>
    );
};

export default ProfileDropdown;
