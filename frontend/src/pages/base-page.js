import {
    AppBar,
    Autocomplete,
    Avatar,
    Backdrop,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    TextField,
    Toolbar,
    Tooltip,
} from '@mui/material';
import React from 'react';
import { MainSelectors } from '../state/selectors';
import { connect } from 'react-redux';
import { MainActions } from '../state/actions';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

class BasePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            menuAnchorElement: null,
            searchBarText: '',
            searchBarChips: [],
        };
    }

    logoutUser = () => {
        // TODO remove user from backend using logoutAccount
        this.props.setToken(null);
        localStorage.removeItem('token');
        this.props.navigate('/login');
    };

    searchAdornment = (otherAdornment) => {
        return (
            <>
                <InputAdornment position="start">
                    <IconButton
                        style={{ cursor: 'inherit' }}
                        disableRipple
                        edge="end"
                    >
                        <SearchIcon />
                    </IconButton>
                </InputAdornment>
                {otherAdornment?.map(adornment => {
                    return adornment;
                })}
            </>
        );
    }

    render() {
        return (
            <>
                {!this.props.isLoginPage && (
                    <AppBar
                        className={'app-bar'}
                        position="static"
                        open
                        variant="dense"
                    >
                        <Toolbar>
                            <img
                                draggable={false}
                                src="/static/readit_logo.png"
                                className={'app-bar-logo'}
                                alt="readit logo"
                            />
                            <div style={{ display: 'flex', flexGrow: '1', marginLeft: '16px' }}>\
                                <Autocomplete
                                    multiple
                                    onChange={(e, chips) => {
                                        this.setState({
                                            searchBarChips: chips,
                                        });
                                    }}
                                    freeSolo
                                    className="app-bar-search-bar"
                                    options={[]}
                                    defaultValue={[]}
                                    open={!this.props.isLoading}
                                    handleHomeEndKeys
                                    filterOptions={(options, params) => {
                                        if (params.inputValue.length <= 2) {
                                            return [];
                                        }
                                        let toAdd = '';
                                        if (params.inputValue.startsWith('u/')) {
                                            toAdd = 'Add user filter: ';
                                        } else if (params.inputValue.startsWith('c/')) {
                                            toAdd = 'Add community filter: ';
                                        } else if (params.inputValue.startsWith('f/')) {
                                            toAdd = 'Add flair filter: ';
                                        }
                                        if (toAdd === '') {
                                            return [];
                                        }
                                        return [{
                                            inputValue: params.inputValue.substring(2),
                                            title: `${toAdd} ${params.inputValue.substring(2)}`,
                                        }];
                                    }}
                                    getOptionLabel={(option) => {
                                        return option.title;
                                    }}
                                    renderInput={params => {
                                        return (
                                            <TextField
                                                {...params}
                                                onChange={e => {
                                                    this.setState({
                                                        searchBarText: e.target.value,
                                                    });
                                                }}
                                                // size="small"
                                                label="Search Readit"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: this.searchAdornment(params.InputProps.startAdornment),
                                                }}
                                                inputProps={{
                                                ...params.inputProps,
                                                onKeyDown: (e) => {
                                                    if (e.key === 'Enter') {
                                                        e.stopPropagation();
                                                        e.target.blur();
                                                        this.props.setIsLoading(true);
                                                        // TODO add logic to send search request to backend
                                                    }
                                                },
                                                }}
                                            />
                                        );
                                    }}
                                />
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                                <IconButton>
                                    <NotificationsIcon />
                                </IconButton>
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                                <Tooltip title="Account settings">
                                    <Button
                                        style={{ textTransform: 'none' }}
                                        onClick={(e) => {
                                            this.setState({
                                                menuAnchorElement: e.currentTarget,
                                            })
                                        }}
                                        disableRipple
                                        variant='text'
                                        size="small"
                                    >
                                        <Avatar sx={{ width: 32, height: 32 }}>M</Avatar>
                                        <span style={{ marginLeft: '8px', marginRight: '8px    ' }}>Username</span>
                                        <ExpandMoreIcon style={{ marginRight: '8px' }} />
                                    </Button>
                                </Tooltip>
                                <Menu
                                    anchorEl={this.state.menuAnchorElement}
                                    id="account-menu"
                                    open={!!this.state.menuAnchorElement}
                                    onClose={() => { this.setState({ menuAnchorElement: null })}}
                                    onClick={() => { this.setState({ menuAnchorElement: null })}}
                                    PaperProps={{
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
                                        '&:before': {
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
                                    style: {
                                      width: '220px',
                                    },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem>
                                        <AccountBoxIcon style={{ marginRight: '8px' }} /> Profile
                                    </MenuItem>
                                    <MenuItem>
                                        <AddIcon style={{ marginRight: '8px' }} /> Create a community
                                    </MenuItem>
                                    <MenuItem onClick={() => this.logoutUser()}>
                                        <LogoutIcon style={{ marginRight: '8px' }} /> Logout
                                    </MenuItem>
                                </Menu>
                            </div>
                        </Toolbar>
                    </AppBar>
                )}
                <div>
                    <Backdrop
                        sx={{
                            color: '#fff',
                            zIndex: (theme) => theme.zIndex.drawer + 1,
                        }}
                        open={this.props.isLoading}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                </div>
                {this.props.component}
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    token: MainSelectors.getToken(state),
    isLoading: MainSelectors.getIsLoading(state),
});

const mapDispatchToProps = {
    setToken: MainActions.setToken,
    setIsLoading: MainActions.setIsLoading,
};

export default connect(mapStateToProps, mapDispatchToProps)(BasePage);
