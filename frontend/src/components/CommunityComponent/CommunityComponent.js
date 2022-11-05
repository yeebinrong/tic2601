import './CommunityComponent.scss';
import moment from 'moment';
import { modifyFavour, retrieveCommunityPosts, updateFollow, deleteFromBanlist,deleteFromMods, retrieveModPageStats, updateColour, approveBan,updateComDesc, addMods, updateMods, uploadProfilePicture} from '../../apis/app-api';
import * as React from 'react';
import {SketchPicker} from 'react-color';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import PostModButton from './PostModButton';
import { Checkbox, Chip , FormControlLabel, TextField} from '@mui/material';
import {snackBarProps, withParams } from '../../constants/constants';
import { renderPostLists } from '../HomePageComponent/HomePageComponent';
import { LineChart,Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { withSnackbar } from 'notistack';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const followerData = [
    {
      name: '21 Days ago',
      Value: 0,
    },
    {
      name: '14 Days ago',
      Value: 0,
    },
    {
      name: '7 Days ago',
      Value: 0,
    },
    {
      name: 'Now',
      Value: 0,
    },
];

const postData = [
    {
        name: '21 Days ago',
        Value: 0,
    },
    {
        name: '14 Days ago',
        Value: 0,
    },
    {
        name: '7 Days ago',
        Value: 0,
    },
    {
        name: 'Now',
        Value: 0,
    },
];

const favData = [
    {
        name: '21 Days ago',
        Value: 0,
    },
    {
        name: '14 Days ago',
        Value: 0,
    },
    {
        name: '7 Days ago',
        Value: 0,
    },
    {
        name: 'Now',
        Value: 0,
    },
];

export const FollowerChart = () => {
            return (
                <>
                    <LineChart width={600} height={250} data={followerData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Value" name="No. of followers" stroke="#8884d8" />
                    </LineChart>
                </>
            );
}

export const PostChart = () => {
    return (
        <>
            <LineChart width={600} height={250} data={postData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Value" name="No. of posts" stroke="#8884d8" />
            </LineChart>
        </>
    );
}

export const FavChart = () => {
    return (
        <>
            <LineChart width={600} height={250} data={favData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Value" name="No. of favours" stroke="#8884d8" />
            </LineChart>
        </>
    );
}


class CommunityComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [],
            mode:"posts",
            stats:[],
            info:{},
            url:[],
            mod:[],
            bans:[],
            following:"",
            followStatus: "",
            newMod:"",
            newModAdmin:false,
            selectedFile: null,
            profile_picture: null,
        };

        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            retrieveCommunityPosts({
                communityName: this.props.params.community_name,
                currentTab: this.props.params.currentTab,
            }).then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.postsRows,
                    mod: res.data.modRows,
                    info: res.data.infoRows,
                    stats: res.data.statsRows,
                    bans: res.data.banRows,
                    url: this.props.location.pathname,
                    following: res.data.isFollowing,
                    followStatus: res.data.isFollowing === '0' ? 'follow' : 'following',
                    isModAdmin: res.data.isModAdmin,
                });
            });
            retrieveModPageStats(this.props.params.community_name).then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    followerStats:res.data.folRows,
                    postStats:res.data.posRows,
                    favourStats:res.data.favRows,
                    overallStats:res.data.infoRows,
                });
            })
        }
        this.fileRef = React.createRef(null);
    }

    shouldComponentUpdate (nextProps) {
        if ((nextProps.isVerifyDone && !this.props.isVerifyDone) ||
        (nextProps.location.community !== this.props.location.community) ||
        (nextProps.params.currentTab !== this.props.params.currentTab) ||
        (nextProps.params.mode !== this.props.params.mode)
        ) {
            this.props.setIsLoading(true);
            retrieveCommunityPosts({
                communityName: nextProps.params.community_name,
                currentTab: nextProps.params.currentTab,
            }).then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.postsRows,
                    mod: res.data.modRows,
                    info: res.data.infoRows,
                    description: res.data.infoRows.description,
                    stats: res.data.statsRows,
                    bans: res.data.banRows,
                    following: res.data.isFollowing,
                    url: this.props.location.pathname,
                    followStatus: res.data.isFollowing === '0' ? 'follow' : 'following',
                    isModAdmin: res.data.isModAdmin,
                });
            });
            retrieveModPageStats(nextProps.params.community_name).then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    followerStats:res.data.folRows,
                    postStats:res.data.posRows,
                    favourStats:res.data.favRows,
                    overallStats:res.data.infoRows,
                });
            });
        }
        return true;
    }
    //Mod page analytics Init
    initModPage = () => {
        this.state.followerStats.forEach((fol,index) => {
            followerData[index].Value = fol.follow_total ? fol.follow_total : 0
        })
        this.state.postStats.forEach((pos,index) => {
            postData[index].Value = pos.post_total ? pos.post_total : 0
        })
        this.state.favStats.forEach((fav,index) => {
            favData[index].Value = fav.fav_total ? fav.fav_total : 0
        })
    }

    //Mod page Banlist Approve Checkbox onChcek
    handleCheck= (banusername, index) => {
        approveBan({communityName:this.props.params.community_name,username:banusername})
            .then(res => {
                if (!res.error) {
                    const tempBans = this.state.bans;
                    tempBans[index].is_approved = true;
                    this.setState({
                        bans: tempBans,
                    });
                    this.props.enqueueSnackbar(
                        `User [${banusername}] banned successfully.`,
                        snackBarProps('success'),
                    );
                } else {
                    this.props.enqueueSnackbar(
                        `An error has occurred`,
                        snackBarProps('error'),
                    );
                }
            });
    }

    //New Mod Admin Rights
    handleAdminCheck= () => {
        this.setState({
            newModAdmin: !(this.state.newModAdmin)
     });
    }

    //postrenderlist onChange
    handleChange= (e, newValue) => {
        this.props.navigate({
            pathname: `/community/${this.props.params.community_name}/posts/${newValue}`,
            replace: true,
        });
    };

    //postmodButton onChange
    handleModeChange = (event, newValue) => {
        this.setState({mode:newValue})
        if(newValue === "posts"){
            this.props.navigate({
                pathname: `/community/${this.props.params.community_name}/${newValue}/best`,
                replace: true,
            });
        }
        else{
            this.props.navigate({
                pathname: `/community/${this.props.params.community_name}/${newValue}`,
                replace: true,
            });
        }
    };

    //Community Description OnClick
    handleDescChange = (inputDesc) => {
        updateComDesc({communityName:this.props.params.community_name,newDesc:inputDesc})
        .then(res => {
            if (!res.error) {
                this.props.enqueueSnackbar(
                    `Community Description updated successfully`,
                    snackBarProps('success'),
                );
            }
            else {
                this.props.enqueueSnackbar(
                    `An error has occurred while updating community description`,
                    snackBarProps('error'),
                );
            }
            this.props.setIsLoading(false);
        })
    }

    //Adding New Mods
    handleNewMods = (username,isadmin) => {
        addMods({communityName:this.props.params.community_name,userName:username,isAdmin:isadmin ? true : false})
        .then(res => {
            if (!res.error) {
                const tempMods = res.data.modRows;
                    this.setState({
                        mod: tempMods
                    })
                this.props.enqueueSnackbar(
                    `User [${username}] is now a moderator.`,
                    snackBarProps('success'),
                );
            } else {
                this.props.enqueueSnackbar(
                    `An error has occurred`,
                    snackBarProps('error'),
                );
            }
        });
    }

        //Adding New Mods
        handleUpdateMods = (username,isadmin) => {
            updateMods({communityName:this.props.params.community_name,userName:username,isAdmin:isadmin ? 1 : 0})
            .then(res => {
                if (!res.error) {
                    const tempMods = res.data.modRows;
                        this.setState({
                            mod: tempMods,
                            isModAdmin: username === this.props.userInfo.username ? isadmin : this.state.isModAdmin,
                        })
                    this.props.enqueueSnackbar(
                        `User [${username}] is now ${isadmin ? 'Admin' : ''} Moderator.`,
                        snackBarProps('success'),
                    );
                } else {
                    this.props.enqueueSnackbar(
                        `An error has occurred`,
                        snackBarProps('error'),
                    );
                }
            });
        }

    //Delete Button onClick
    handleDelete = (banusername, index) => {
        deleteFromBanlist({communityName:this.props.params.community_name,username:banusername})
            .then(res => {
                if (!res.error) {
                    const tempBans = this.state.bans.filter(b => b.user_name !== banusername);
                    this.setState({
                        bans: tempBans,
                    });
                    this.props.enqueueSnackbar(
                        `User [${banusername}] unbanned successfully.`,
                        snackBarProps('success'),
                    );
                } else {
                    this.props.enqueueSnackbar(
                        `An error has occurred`,
                        snackBarProps('error'),
                    );
                }
            });
    };

    //Mod Delete Button onClick
    handleDeleteMod = (modUserName) => {
        deleteFromMods({communityName:this.props.params.community_name,username:modUserName})
            .then(res => {
                if (!res.error) {
                    const tempMods = this.state.mod.filter(mods => mods.user_name !== modUserName);
                    this.setState({
                        mod: tempMods
                    })
                    this.props.enqueueSnackbar(
                        `User [${modUserName}] is no longer moderator.`,
                        snackBarProps('success'),
                    );
                } else {
                    this.props.enqueueSnackbar(
                        `An error has occurred`,
                        snackBarProps('error'),
                    );
                }
            });
    };

    //Community Colour onChange
    handleComColourChange = (colour) => {
          updateColour({communityName:this.props.params.community_name,newColour:colour.hex})
            .then(res => {
                if (!res.error) {
                    this.setState(prevState => {
                        return {
                            ...prevState,
                            info: {
                                ...prevState.info,
                                colour: colour.hex,
                            },
                        };
                    });
                    this.props.enqueueSnackbar(
                        `Community colour changed successfully.`,
                        snackBarProps('success'),
                    );
                } else {
                    this.props.enqueueSnackbar(
                        `An error has occurred`,
                        snackBarProps('error'),
                    );
                }
            });
    };

    //Follow Button onClick
    changeFollow = () => {
        updateFollow({communityName:this.props.params.community_name,isFollowing:this.state.following})
            .then(res => {
                if (!res.error) {
                    this.setState({
                        following: res.data.isFollowing,
                        followStatus: res.data.isFollowing === '0' ? 'follow' : 'following',
                    });
                    this.props.enqueueSnackbar(
                        `Community ${res.data.isFollowing === '0' ? 'unfollowed' : 'followed'} successfully.`,
                        snackBarProps('success'),
                    );
                } else {
                    this.props.enqueueSnackbar(
                        `An error has occurred`,
                        snackBarProps('error'),
                    );
                }
           })
    }       

    onFavourChange = (postId, favour, value, receiver, index, communityName) => {
        modifyFavour({
            postId: postId,
            favour: favour ? favour : 0,
            value: value,
            receiver: receiver,
            communityName,
        }).then(res => {
            if (!res.error) {
                const tempPosts = this.state.posts;
                if (favour) {
                    if (favour === -1) {
                        if (value === 1) {
                            tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) + 2 : 1;
                            tempPosts[index].is_favour = 1;
                        } else if (value === 0) {
                            tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) + 1 : 0;
                            tempPosts[index].is_favour = null;
                        }
                    } else if (favour === 1) {
                        if (value === -1) {
                            tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) - 2 : -1;
                            tempPosts[index].is_favour = -1;
                        } else if (value === 0) {
                            tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) - 1 : 0;
                            tempPosts[index].is_favour = null;
                        }
                    }
                } else {
                    if (value === 1) {
                        tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) + 1 : 1;
                        tempPosts[index].is_favour = 1;
                    } else if (value === -1) {
                        tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) - 1 : -1;
                        tempPosts[index].is_favour = -1;
                    }
                }
                this.setState({
                    posts: tempPosts,
                });
            }
        })
    };

    onDeletePostCallBack = (name, id) => {
        let tempPosts = this.state.posts;
        tempPosts = tempPosts.filter(p => !(p.community_name === name && p.post_id === id));
        this.setState({
            posts: tempPosts,
        });
    }

    //Posts UI
    renderNorm = () => {
        return (
            <>
                <Grid container spacing={6} style={{ margin: '16px 280px' }}>
                    <Grid xs={8}>
                        <Box sx={{ width: '100%' }}>
                            <Stack spacing={2}>
                            {renderPostLists(this.state.posts, this.props.params, this.handleChange, this.onFavourChange, this.onDeletePostCallBack, this.props.userInfo?.username, this.state.info?.colour)}
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid xs style={{ position: 'relative' }}>
                        <div style={{ color: 'white', backgroundColor: this.state.info.colour ? this.state.info.colour : 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                            <b>About Community</b>
                        </div>
                        <Item>
                            <div style={{ textAlign: 'left', padding: 10 }}>
                                <b>Welcome to r/{this.state.info.community_name}</b>
                                <p>{this.state.info.description}</p>
                                <Divider style={{margin:'16px 0'}}></Divider>
                                <b>Creation Date: {moment(this.state.info.datetime_created).format('DD-MM-YYYY hh:mmA')}</b>
                                <Divider style={{margin:'16px 0'}}></Divider>
                                <div style={{ marginTop: '16px' }}>
                                    <Chip
                                        style={{ display: 'flex', backgroundColor: this.state.info.colour ? this.state.info.colour : 'rgb(0, 178, 210)' }}
                                        label="Create Post"
                                        color='primary'
                                        clickable={true}
                                        onClick={() =>
                                            this.props.navigate({
                                                pathname: '/create_post',
                                                replace: true,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </Item>
                        <div style={{ marginTop: '16px', color: 'white', backgroundColor: this.state.info.colour ? this.state.info.colour : 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                            <b>Community Moderators</b>
                        </div>
                        <Item>
                            <div>
                                <Box style={{ textAlign: 'left', verticalAlign: 'middle' }}>
                                    {this.state.mod?.map(mods => {
                                        return (
                                            <>
                                                <Box key={mods.user_name} style={{margin: '8px 0', display: 'flex' }}>
                                                    <span style={{ margin: '8px 0 auto 16px' }}>
                                                        {mods.is_admin === true ? <LocalPoliceIcon /> : <ShieldIcon />}
                                                    </span>
                                                    <span style={{ margin: 'auto 0 auto 4px' }}>
                                                        <b>{mods.is_admin === true ? 'Admin Moderator' : 'Moderator'}</b>
                                                    </span>
                                                    <span style={{ margin: 'auto 0 auto 8px' }}>
                                                        {mods.user_name}
                                                    </span>
                                                </Box>
                                                <Divider/>
                                            </>
                                        )
                                    })}
                                </Box>
                            </div>
                        </Item>

                    </Grid>
                </Grid>
            </>
        )
    }

    //Mod Setting UI
    renderMod = () => {
        return (
            <>
            { this.state.stats.map(stat => {
                        followerData[3].Value=stat.follower_count ? stat.follower_count : "0";
                        postData[3].Value=stat.post_count ? stat.post_count : "0";
                        favData[3].Value=stat.fav_total ? stat.fav_total : "0";
                        return(
                            <Grid container spacing={6} style={{ margin: '16px 280px' }}>
                                <Grid item xs={7.5}>
                                    <Box sx={{ width: '100%' }}>
                                        <Stack spacing={2}>
                                            <div>
                                                <div style={{ color: 'white', backgroundColor: this.state.info.colour ? this.state.info.colour : 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                                    <b>Community Statistics</b>
                                                </div>
                                                <div>
                                                    <Paper component="form" sx={{ p: '2px 4px', display: 'flex', justifyContent: 'center' }}>
                                                        <table>
                                                            <tr>
                                                                <th>Follower Count</th>
                                                                <th>Post Count</th>
                                                                <th>Total Favours</th>
                                                                <th>Moderator Count</th>
                                                                <th>No. of banned users</th>
                                                            </tr>
                                                            <tr>
                                                                <td>{followerData[3].Value}</td>
                                                                <td>{postData[3].Value}</td>
                                                                <td>{favData[3].Value}</td>
                                                                <td>{this.state.mod ? `${this.state.mod.length}` : '0'}</td>
                                                                <td>{this.state.ban ? `${this.state.ban.filter(b => b.is_approved).length}` : '0'}</td>
                                                            </tr>
                                                        </table>
                                                    </Paper>
                                                </div>
                                            </div>
                                            <div>
                                            <div style={{ marginTop: '16px', color: 'white', backgroundColor: this.state.info.colour ? this.state.info.colour : 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                                <b>Followers</b>
                                            </div>
                                                <Paper component="form" sx={{ p: '32px 4px', display: 'flex', justifyContent: 'center' }}>
                                                    <FollowerChart/>
                                                </Paper>
                                            </div>
                                            <div>
                                            <div style={{ marginTop: '16px', color: 'white', backgroundColor: this.state.info.colour ? this.state.info.colour : 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                                <b>Posts</b>
                                            </div>
                                                <Paper component="form" sx={{ p: '32px 4px', display: 'flex', justifyContent: 'center' }}>
                                                    <PostChart/>
                                                </Paper>
                                            </div>
                                            <div>
                                            <div style={{ marginTop: '16px', color: 'white', backgroundColor: this.state.info.colour ? this.state.info.colour : 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                                <b>Favours</b>
                                            </div>
                                                <Paper component="form" sx={{ p: '32px 4px', display: 'flex', justifyContent: 'center' }}>
                                                    <FavChart/>
                                                </Paper>
                                            </div>
                                            <div>
                                                <div style={{ marginTop: '16px', color: 'white', backgroundColor: this.state.info.colour, height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                                    <b>Community Moderators</b>
                                                </div>
                                                <Item style={{ display: 'flex', flexDirection: 'column', padding: '32px' }}>
                                                    {this.state.mod.map(mods => {
                                                        return (
                                                            <>
                                                                <Box key={mods.user_name} style={{ marginTop: '8px', display: 'flex' }}>
                                                                    <span style={{ margin: '8px 0 auto 0' }}>
                                                                        {mods.is_admin === true ? <LocalPoliceIcon /> : <ShieldIcon />}
                                                                    </span>
                                                                    <span style={{ margin: 'auto 0 auto 4px' }}>
                                                                        <b>{mods.is_admin === true ? 'Admin Moderator' : 'Moderator'}</b>
                                                                    </span>
                                                                    <span style={{ margin: 'auto 0 auto 8px' }}>
                                                                        u/{mods.user_name}
                                                                    </span>
                                                                    <Button
                                                                        style={{ margin: 'auto 0 auto auto', textTransform: 'none' }}
                                                                        variant='outlined'
                                                                        size='small'
                                                                        onClick={() => {
                                                                            this.props.navigate({
                                                                                pathname: `/user/${mods.user_name}/profile/overview`,
                                                                                replace: true,
                                                                            })
                                                                        }}
                                                                    >
                                                                        View
                                                                    </Button>
                                                                    {this.state.isModAdmin === true && this.props.userInfo.username !== mods.user_name &&
                                                                    <Button
                                                                        style={{ margin: 'auto 0 auto 16px', textTransform: 'none' }}
                                                                        variant='contained'
                                                                        size='small'
                                                                        onClick={() => {
                                                                            this.handleUpdateMods(mods.user_name, !mods.is_admin);
                                                                        }}
                                                                    >
                                                                        {mods.is_admin ? 'Demote' : 'Promote'}
                                                                    </Button>}
                                                                    {this.state.isModAdmin === true  && this.props.userInfo.username !== mods.user_name &&
                                                                    <Button
                                                                        style={{ margin: 'auto 0 auto 16px', textTransform: 'none' }}
                                                                        variant='contained'
                                                                        size='small'
                                                                        color={"secondary"}
                                                                        onClick={() => {
                                                                            this.handleDeleteMod(mods.user_name)
                                                                        }}
                                                                    >
                                                                        Remove
                                                                    </Button>}
                                                                </Box>
                                                                <Divider style={{margin:'16px 0'}}></Divider>
                                                            </>
                                                        )}
                                                    )}
                                                    <Box style={{ marginTop: '8px', display: 'flex' }}>
                                                        <div style={{ marginRight: '16px', display: 'flex', flexGrow: '1' }}>
                                                            <TextField
                                                                fullWidth
                                                                sx={{m:'2px'}}
                                                                label="User Name"
                                                                onChange={(e) => {
                                                                    this.setState({
                                                                        newMod: e.target.value,
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                        {this.state.isModAdmin === true &&
                                                        <FormControlLabel
                                                            label="Admin"
                                                            control={
                                                                <Checkbox
                                                                checked={this.state.newModAdmin}
                                                                onChange={() => this.handleAdminCheck()}
                                                                />
                                                            }
                                                        />}
                                                        <Button
                                                            style={{ margin: 'auto 0 auto 16px', textTransform: 'none' }}
                                                            variant='contained'
                                                            size='small'
                                                            color={"primary"}
                                                            onClick={() => {
                                                                this.handleNewMods(this.state.newMod, this.state.newModAdmin);
                                                            }}
                                                        >
                                                            Add New Moderator
                                                        </Button>
                                                    </Box>
                                                </Item>
                                            </div>
                                        </Stack>
                                    </Box>
                                </Grid>
                                <Grid xs style={{ position: 'relative' }}>
                                    <div style={{ width: '100%', color: 'white', backgroundColor: this.state.info.colour, height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                        <b>Community Profile</b>
                                    </div>
                                    <Item>
                                        <div style={{ margin: '16px 32px 0 32px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
                                                <img
                                                    draggable={false}
                                                    src={this.state.profile_picture ?
                                                        this.state.profile_picture:
                                                        `/static/user-avatar-default.png`}
                                                    className={'profile-page-picture'}
                                                    alt="community profile"
                                                />
                                                <Button
                                                    style={{ margin: 'auto', marginTop: '16px', textTransform: 'none', backgroundColor: this.state.info.colour }}
                                                    onClick={() => { this.fileRef.current.click() }}
                                                    variant='contained'
                                                >
                                                    <input
                                                        ref={this.fileRef}
                                                        type="file"
                                                        style={{ display: 'none' }}
                                                        onChange={this.onFileChange}
                                                        accept="image/png, image/gif, image/jpeg, image/jpg"
                                                    />
                                                    Select Community Profile Picture
                                                </Button>
                                                <div style={{ margin: '16px auto', padding: '8px', textAlign: 'center', border: 'solid 1px rgb(0, 178, 210)', borderRadius: '5px' }}>
                                                    {this.state.selectedFile ? this.state.selectedFile.name : 'No file is selected!'}
                                                </div>
                                                <Button
                                                    style={{ margin: 'auto', textTransform: 'none', backgroundColor: !this.state.selectedFile ? 'rgba(0, 0, 0, 0.24)' : this.state.info.colour }}
                                                    disabled={!this.state.selectedFile}
                                                    onClick={this.onProfilePictureChange}
                                                    variant='contained'
                                                >
                                                    Change Community Profile Picture
                                                </Button>
                                            </div>
                                        </div>
                                        <div style={{ margin: '16px 32px 0 32px', textAlign: 'center' }}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows='5'
                                                size="small"
                                                onChange={(e) => {
                                                    this.setState({ description: e.target.value })
                                                }}
                                                value={this.state.description}
                                            />
                                            <Button
                                                disabled={!this.state.description || this.state.description === ''}
                                                style={{
                                                    margin: '24px auto',
                                                    width: '300px',
                                                    textTransform: 'none',
                                                    backgroundColor: !this.state.description || this.state.description === '' ? 'rgba(0, 0, 0, 0.24)' : this.state.info.colour,
                                                }}
                                                variant='contained'
                                                color={'primary'}
                                                onClick={() => {
                                                    this.props.setIsLoading(true);
                                                    this.handleDescChange(this.state.description);
                                                }}
                                            >
                                                Change Community Description
                                            </Button>
                                        </div>
                                        <div style={{ padding: '0 32px 16px 32px' }}>
                                            <SketchPicker
                                                width={'auto'}
                                                color = {this.state.info.colour}
                                                onChangeComplete={this.handleComColourChange}
                                            />
                                        </div>
                                    </Item>
                                    <div style={{ marginTop: '32px', color: 'white', backgroundColor: this.state.info.colour ? this.state.info.colour : 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                        <b>Community Colour</b>
                                    </div>
                                    <Item style={{ padding: '32px' }}>
                                    </Item>
                                    <div style={{ marginTop: '32px', color: 'white', backgroundColor: this.state.info.colour ? this.state.info.colour : 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                        <b>Community Banlist</b>
                                    </div>
                                    <Item style={{ padding: '12px 32px 32px 32px' }}>
                                        <Stack spacing={2} direction="column">
                                            <Box style={{ textAlign: 'left' }}>
                                                <div>
                                                    {this.state.bans?.length === 0 &&
                                                    <div style={{ marginTop: '16px' }}>
                                                        No users banned or reported!
                                                    </div>}
                                                    {this.state.bans?.map((ban, index) => {
                                                        return(
                                                        <>
                                                            <Box key={ban.user_name} style={{ marginTop: '8px', display: 'flex' }}>
                                                                <span style={{ margin: 'auto', display: 'flex', flexGrow: '1' }}>
                                                                    u/{ban.user_name}
                                                                </span>
                                                                {!ban.is_approved &&
                                                                <Button
                                                                    style={{ margin: 'auto 0 auto 16px', textTransform: 'none' }}
                                                                    variant='contained'
                                                                    size='small'
                                                                    color={"primary"}
                                                                    onClick={() => {
                                                                        this.handleCheck(ban.user_name, index)
                                                                    }}
                                                                >
                                                                    Ban u/{ban.user_name}
                                                                </Button>}
                                                                <Button
                                                                    style={{ margin: 'auto 0 auto 16px', textTransform: 'none' }}
                                                                    variant='contained'
                                                                    size='small'
                                                                    color={"secondary"}
                                                                    onClick={() => {
                                                                        this.handleDelete(ban.user_name, index)
                                                                    }}
                                                                >
                                                                    {ban.is_approved ? `Unban u/${ban.user_name}` : 'Remove'}
                                                                </Button>
                                                            </Box>
                                                            <Divider style={{margin:'16px 0'}}></Divider>
                                                        </>
                                                        )
                                                    })}
                                                </div>
                                            </Box>
                                        </Stack>
                                    </Item>
                                </Grid>
                            </Grid>
                     );
                })}
            </>
        )
    }

    onFileChange = (e) => {
        if(e.target.files[0].size > 1000000){
            this.props.enqueueSnackbar(
                "Maximum file size 1mb, selected file is too big!",
                snackBarProps('error'),
            );
            e.target.value = null;
        } else {
            this.setState({
                selectedFile: e.target.files[0],
                profile_picture: URL.createObjectURL(e.target.files[0]),
            });
        }
    }

    onProfilePictureChange = (e) => {
        this.props.setIsLoading(true);
        const formData = new FormData();
        formData.set('communityName', this.state.info.community_name)
        formData.set('type', 'community')
        formData.set('file', this.state.selectedFile)
        uploadProfilePicture(formData)
        .then(res => {
            if (!res.error) {
                const profile_pic_url = `${res.data.profile_picture}?${Date.now()}`;
                this.setState({
                    info: {
                        ...this.state.info,
                        profile_picture: profile_pic_url,
                    },
                    selectedFile: null,
                });
                this.props.enqueueSnackbar(
                    "Successfully changed community profile picture!",
                    snackBarProps('success'),
                );
            } else {
                this.props.enqueueSnackbar(
                    "Failed to change community profile picture!",
                    snackBarProps('error'),
                );
            }
            this.props.setIsLoading(false);
        })
        e.target.value = null;
    }

    render() {
        return (
            <div>
                <div style={{ display: 'block', backgroundColor:this.state.info.colour, height: 175 }}></div>
                <div style={{ backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', marginLeft: '20%', paddingTop: '10px' }}>
                        <div>
                            <Avatar alt="Community Logo" sx={{ width: 128, height: 128, margin: '8px' }} src={this.state.info.profile_picture ?
                                this.state.info.profile_picture: `/static/user-avatar-default.png`} />
                        </div>
                        <div style={{ marginRight: '25px' }}>
                            <b style={{ fontSize: '30px', marginLeft: '10%' }}>{this.state.info.community_name}</b>
                            <p style={{ marginLeft: '10%', marginTop: '0px' }}>r/{this.state.info.community_name}</p>
                            <PostModButton isModAdmin={this.state.isModAdmin} indicatorColor={this.state.info?.colour} handleChange={this.handleModeChange} value={this.state.mode} params={this.props.params} navigate={this.props.navigate}/>
                        </div>
                        <div style={{ margin: '15px' }}>
                            <Button style={{ borderRadius: '14px' }} variant="contained" onClick={this.changeFollow} color={this.state.following !== '0' ? "primary":"secondary"}>{this.state.followStatus}</Button>
                        </div>
                    </div>
                </div>
                { this.state.mode === "mod" ? this.renderMod() : this.renderNorm() }
            </div>
        );
    }
}

export default withSnackbar(withParams(CommunityComponent));