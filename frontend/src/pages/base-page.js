import {
    AppBar,
    Autocomplete,
    Avatar,
    Backdrop,
    Button,
    Chip,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import CreateCommunityComponent from '../components/CreateCommunityComponent/CreateCommunityComponent';
import { defaultFlairs } from '../constants/constants';

class BasePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            menuAnchorElement: null,
            searchBarText: '',
            searchBarChips: [],
            isCreateCommunityDialogOpen: false,
        };
    }

    logoutUser = () => {
        this.props.setToken(null);
        localStorage.removeItem('token');
        this.props.navigate('/login');
    };

    setIsCreateCommunityDialog = value => {
        this.setState({
            isCreateCommunityDialogOpen: value,
        });
    }

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

    createSearchParams = (chips) => {
        const validatedChips = {};
        chips.forEach(chip => validatedChips[chip.type] = chip);
        const chipKeys = Object.keys(validatedChips);
        let searchParamStr = '';
        for (let i = 0; i < chipKeys.length; i += 1) {
            const currValue = encodeURIComponent(validatedChips[chipKeys[i]].inputValue);
            if (chipKeys[i] === 'community') {
                if (searchParamStr !== '')
                    searchParamStr += '&';
                searchParamStr += `community=${currValue}`;
            } else if (chipKeys[i] === 'flair') {
                if (searchParamStr !== '')
                    searchParamStr += '&';
                searchParamStr += `flair=${currValue}`;
            } else if (chipKeys[i] === 'user') {
                if (searchParamStr !== '')
                    searchParamStr += '&';
                searchParamStr += `user=${currValue}`;
            }
        }
        if (this.state.searchBarText !== '') {
            if (searchParamStr !== '')
                searchParamStr += '&';
            searchParamStr += `q=${encodeURIComponent(this.state.searchBarText)}`;
        }
        return searchParamStr;
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
                                alt=""
                                onClick={() => {
                                    this.props.navigate({
                                        pathname: '/home',
                                        replace: true,
                                    });
                                }}
                            />
                            <div style={{ display: 'flex', flexGrow: '1', marginLeft: '16px' }}>
                                <Autocomplete
                                    multiple
                                    inputValue={this.state.searchBarText}
                                    value={this.state.searchBarChips}
                                    onChange={(e, chips) => {
                                        const validatedChips = {};
                                        chips.forEach(chip => validatedChips[chip.type] = chip);
                                        const chipKeys = Object.keys(validatedChips);
                                        const finalChips = [];
                                        for (let i = 0; i < chipKeys.length; i += 1) {
                                            finalChips.push(validatedChips[chipKeys[i]]);
                                        }
                                        this.setState({
                                            searchBarText: '',
                                            searchBarChips: finalChips,
                                        });
                                    }}
                                    freeSolo
                                    className="app-bar-search-bar"
                                    options={[]}
                                    defaultValue={[]}
                                    open={!this.props.isLoading}
                                    handleHomeEndKeys
                                    filterOptions={(options, params) => {
                                        if (params.inputValue.startsWith('f/')) {
                                            return defaultFlairs;
                                        } else if (params.inputValue.length <= 2) {
                                            return [];
                                        }
                                        let toAdd = '';
                                        let type = '';
                                        if (params.inputValue.startsWith('u/')) {
                                            toAdd = 'Add user filter:';
                                            type = 'user';
                                        } else if (params.inputValue.startsWith('r/')) {
                                            toAdd = 'Add community filter:';
                                            type = 'community';
                                        } else if (params.inputValue.startsWith('f/')) {
                                            return defaultFlairs;
                                        }
                                        if (toAdd === '') {
                                            return [];
                                        }
                                        return [{
                                            type,
                                            inputValue: params.inputValue.substring(2),
                                            title: `${toAdd} ${params.inputValue.substring(2)}`,
                                        }];
                                    }}
                                    getOptionLabel={(option) => {
                                        return option.title;
                                    }}
                                    renderTags={(val, getTagProps) => {
                                        return val.map((option, index) => {
                                            let color = 'rgb(0, 178, 210)';
                                            if (option.title.startsWith('Add user')) {
                                                color = 'teal';
                                            } else if (option.title.startsWith('Add flairs')) {
                                                color = 'purple'
                                            }
                                            return (
                                                <Chip
                                                    {...getTagProps({ index })}
                                                    style={{ backgroundColor: color }}
                                                    color='primary'
                                                    label={option.title}
                                                />
                                            );
                                        });
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
                                                    if (this.state.searchBarText.startsWith('f/') && e.key !== 'Backspace') {
                                                        e.preventDefault();
                                                    } else if (e.key === 'Enter') {
                                                        e.stopPropagation();
                                                        if (this.state.searchBarChips.length !== 0 || this.state.searchBarText !== '') {
                                                            this.setState({
                                                                searchBarText: '',
                                                                searchBarChips: [],
                                                            })
                                                            e.target.blur();
                                                            this.props.navigate({
                                                                pathname: '/search/best',
                                                                search: `?${this.createSearchParams(this.state.searchBarChips)}`,
                                                                replace: true,
                                                            });
                                                        }
                                                    }
                                                },
                                                }}
                                            />
                                        );
                                    }}
                                />
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
                                        <Avatar
                                            sx={{ width: 32, height: 32 }}
                                            src={this.props.userInfo.profile_picture ?
                                                this.props.userInfo.profile_picture:
                                                `/static/user-avatar-default.png`}
                                        >
                                            M
                                        </Avatar>
                                        <span style={{ marginLeft: '8px', marginRight: '8px    ' }}>
                                            {this.props.userInfo.username ? this.props.userInfo.username : 'Username' }
                                        </span>
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
                                    <MenuItem
                                        onClick={() => {
                                            this.props.navigate({
                                                pathname: `/user/${this.props.userInfo.username}/profile/overview`,
                                                replace: true,
                                            })
                                        }}
                                    >
                                        <AccountBoxIcon style={{ marginRight: '8px' }} /> Profile
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => this.setIsCreateCommunityDialog(true)}
                                    >
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
                {this.props.component(this.props)}
                <CreateCommunityComponent
                    open={this.state.isCreateCommunityDialogOpen}
                    onClose={() => this.setIsCreateCommunityDialog(false)}
                />
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    userInfo: MainSelectors.getUserInfo(state),
    isVerifyDone: MainSelectors.getIsVerifyDone(state),
    token: MainSelectors.getToken(state),
    isLoading: MainSelectors.getIsLoading(state),
});

const mapDispatchToProps = {
    setUserInfo: MainActions.setUserInfo,
    setIsVerifyDone: MainActions.setIsVerifyDone,
    setToken: MainActions.setToken,
    setIsLoading: MainActions.setIsLoading,
};

export default connect(mapStateToProps, mapDispatchToProps)(BasePage);
