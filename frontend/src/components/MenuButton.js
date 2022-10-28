import React from 'react';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import { reportUserInCommunity } from '../apis/app-api';
import { withSnackbar } from 'notistack';
import { snackBarProps } from '../constants/constants';

const MenuButton = (props) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box>
            <IconButton
                aria-label="more"
                id="menu-button"
                aria-controls={open ? 'option-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                style={{ marginTop: '2px' }}
                onClick={handleClick}
            >
                <MoreHorizIcon />
            </IconButton>
            <Menu
                id="option-menu"
                MenuListProps={{
                    'aria-labelledby': 'menu-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            left: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                    style: {
                        width: '140px',
                    },
                }}
            >
                <MenuItem>
                    <ContentCopyIcon style={{ marginRight: '8px' }} /> Copy Link
                </MenuItem>
                <MenuItem>
                    <DeleteIcon style={{ marginRight: '8px' }} /> Delete
                </MenuItem>
                <MenuItem
                    onClick={()=> {
                        reportUserInCommunity(props.postOwner, props.communityName)
                            .then(res => {
                                if (!res.error) {
                                    props.enqueueSnackbar(
                                        `User [${props.postOwner}] is reported for [${props.communityName}] community.`,
                                        snackBarProps('success'),
                                    );
                                } else {
                                    props.enqueueSnackbar(
                                        `An error has occurred reporting user [${props.postOwner}] for [${props.communityName}] community.`,
                                        snackBarProps('error'),
                                    );
                                }
                            })
                    }}
                >
                    <FlagIcon style={{ marginRight: '8px' }} /> Report
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default withSnackbar(MenuButton);
