import './CommunityComponent.scss';
import moment from 'moment';
import { modifyFavour, retrieveCommunityPosts, updateFollow, deleteFromBanlist,deleteFromMods, retrieveModPageStats, updateColour, approveBan,updateComDesc, addMods} from '../../apis/app-api';
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
import { Checkbox, Chip , TextField} from '@mui/material';
import {snackBarProps, withParams } from '../../constants/constants';
import { renderPostLists } from '../HomePageComponent/HomePageComponent';
import { LineChart,Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { withSnackbar } from 'notistack';

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
                    <Line type="monotone" dataKey="Value" stroke="#8884d8" />
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
            <Line type="monotone" dataKey="Value" stroke="#8884d8" />
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
            <Line type="monotone" dataKey="Value" stroke="#8884d8" />
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
            newModAdmin:true
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
        this.state.followerStats.map((fol,index) => {
            followerData[index].Value = fol.follow_total ? fol.follow_total : 0
        })
        this.state.postStats.map((pos,index) => {
            postData[index].Value = pos.post_total ? pos.post_total : 0
        })
        this.state.favStats.map((fav,index) => {
            favData[index].Value = fav.fav_total ? fav.fav_total : 0
        })
    }

    //Mod page Banlist Approve Checkbox onChcek
    handleCheck= (banusername, index) => {
       // console.log(banusername)
        approveBan({communityName:this.props.params.community_name,username:banusername})
            .then(res => {
                if (!res.error) {
                    const tempBans = this.state.bans;
                    tempBans[index].is_approved = 'Y';
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
     console.log(this.state.newModAdmin);
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
        console.log(inputDesc)
        updateComDesc({communityName:this.props.params.community_name,newDesc:inputDesc})
        .then(res => {
            if (!res.error) {
                this.props.enqueueSnackbar(
                    `Community Description Updated`,
                    snackBarProps('success'),
                );
            }
            else {
                this.props.enqueueSnackbar(
                    `An error has occurred`,
                    snackBarProps('error'),
                );
            }
        })
    }

    //Adding New Mods
    handleNewMods = (username,isadmin) => {
        console.log(this.props.params.community_name + username + isadmin)
        addMods({communityName:this.props.params.community_name,userName:username,isAdmin:isadmin ? "Y" : "N"})
        .then(res => {
            if (!res.error) {
                const tempMods = res.data.modRows;
                console.log(tempMods);
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
      // console.log(this.state.following[0].count);
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
                <Grid container spacing={6} style={{ margin: '0px 160px' }}>
                    <Grid xs={9}>
                        <Box sx={{ width: '100%' }}>
                            <Stack spacing={2}>
                            {renderPostLists(this.state.posts, this.props.params, this.handleChange, this.onFavourChange, this.onDeletePostCallBack, this.props.userInfo.username)}
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid xs={3} style={{ position: 'relative' }}>
                        <div style={{ backgroundColor:this.state.info.colour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                            
                            <b className={'sideBoxHeader'}>About Community</b>
                        </div>
                        <Item>
                            <div style={{ textAlign: 'left', padding: 10 }}>
                                <b>Welcome to r/{this.state.info.community_name}</b>
                                <p>{this.state.info.description}</p>
                                <Divider style={{margin:'16px 0'}}></Divider>
                                <b>Creation Date:{moment(this.state.info.datetime_created).format('DD/MM/YYYY')}</b>
                                <Divider style={{margin:'16px 0'}}></Divider>
                                <div style={{ marginTop: '16px' }}>
                                    <Chip
                                        style={{ display: 'flex' }}
                                        label="Create Post"
                                        color="primary"
                                        clickable={true}
                                        onClick={() =>
                                            this.props.navigate({
                                                pathname: '/create_post',
                                                replace: true,
                                            })
                                        }
                                    />
                                </div>
                                <Divider style={{margin:'16px 0'}}></Divider>
                                <b>Moderators:</b>
                                <ul style={{listStylePosition: 'inside'}}>
                                    {this.state.mod.map(mods => {
                                        return (
                                            <li style={{listStyleType:'circle'}}>
                                                {mods.user_name}
                                            </li>
                                        )
                                    })}
                                </ul>
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
                        {followerData[3].Value=stat.follower_count ? stat.follower_count : "0"}
                        {postData[3].Value=stat.post_count ? stat.post_count : "0"}
                        {favData[3].Value=stat.fav_total ? stat.fav_total : "0"}
                        return(
                            <div className={'modPage'}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Grid  container spacing={10}>
                                        <Grid item xs={6}>
                                            <div>
                                                <Box sx={{ width: '100%' }}>
                                                    <Stack spacing={3}>
                                                        <div>
                                                            <Paper component="form" sx={{ p: '2px 4px', display: 'flex', justifyContent: 'center' }}>
                                                                <table>
                                                                    <tr>
                                                                        <th>Follower Count</th>
                                                                        <th>Post Count</th>
                                                                        <th>Total Favours</th>
                                                                        <th>Moderator Count</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>{followerData[3].Value}</td>
                                                                        <td>{postData[3].Value}</td>
                                                                        <td>{favData[3].Value}</td>
                                                                        <td>{stat.mod_count ? stat.mod_count : "0"}</td>
                                                                    </tr>
                                                                </table>
                                                            </Paper>
                                                        </div>
                                                        <div>
                                                        <b>Followers</b>
                                                            <Paper component="form" sx={{ p: '2px 4px', display: 'flex', justifyContent: 'center' }}>
                                                                <FollowerChart/>
                                                            </Paper>
                                                        </div>
                                                        <div>
                                                        <b>Posts</b>
                                                            <Paper component="form" sx={{ p: '2px 4px', display: 'flex', justifyContent: 'center' }}>
                                                                <PostChart/>
                                                            </Paper>
                                                        </div>
                                                        <div>
                                                        <b>Favours</b>
                                                            <Paper component="form" sx={{ p: '2px 4px', display: 'flex', justifyContent: 'center' }}>
                                                                <FavChart/>
                                                            </Paper>
                                                        </div>
                                                    </Stack>
                                                </Box>
                                            </div>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <div style={{ backgroundColor: this.state.info.colour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                                                <div className={'sideBoxHeader'}>Community Banlist:</div>
                                            </div>
                                            <Item>
                                                <Box>
                                                    <Stack spacing={1} direction={'column'}>
                                                        <Paper component="form" sx={{ p: '2px 4px', display: 'flex', justifyContent: 'center' }}>    
                                                            <div>
                                                                <table>
                                                                    <tr>
                                                                        <th>Username</th>
                                                                        <th>Approve?</th>
                                                                        <th>Delete</th>
                                                                    </tr>
                                                                    {this.state.bans?.map((ban, index) => {
                                                                            return(
                                                                                <tr>
                                                                                    <td>
                                                                                        {ban.user_name}
                                                                                    </td>
                                                                                    <td>
                                                                                        {ban.is_approved === 'Y' ? <Checkbox disabled checked/> : <Checkbox onChange={() => this.handleCheck(ban.user_name, index)}/>}
                                                                                    </td>
                                                                                    <td>
                                                                                        <Button style={{ borderRadius: '14px' }} variant="contained" color="secondary" onClick={() => this.handleDelete(ban.user_name, index)}>Delete</Button>
                                                                                    </td>
                                                                                </tr>
                                                                            )
                                                                        })}
                                                                </table>
                                                            </div>
                                                        </Paper>
                                                    </Stack>
                                                </Box>
                                            </Item>
                                            <div style={{ backgroundColor: this.state.info.colour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                                                <div className={'sideBoxHeader'}>Community Description:</div>
                                            </div>
                                            <Item>
                                                <Paper component="form" sx={{ p: '2px 4px', display: 'flex', justifyContent: 'left' }}>
                                                    <TextField multiline maxRow={5} fullWidth value={this.state.description}
                                                         onChange={(e) => {
                                                                    this.setState({
                                                                        description: e.target.value,
                                                                    });
                                                                }}
                                                    />
                                                    <input type="button" value = "Update" onClick={() => this.handleDescChange(this.state.description)}/>
                                                </Paper>
                                            </Item>
                                            <div style={{ backgroundColor: this.state.info.colour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                                                <div className={'sideBoxHeader'}>Community Moderators:</div>
                                            </div>

                                            <Item>
                                                <Paper component="form" sx={{ p: '2px 4px', display: 'flex', justifyContent: 'center' }}>   
                                                        <Stack>   
                                                            {console.log(this.state.isModAdmin)}
                                                            {this.state.isModAdmin === "Y" && <table>
                                                                <tr>
                                                                    <th>Add New Moderator</th>
                                                                    <th>Admin? </th>
                                                                    <th>Add</th>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <TextField sx={{m:'2px'}} label="User Name"
                                                                                onChange={(e) => {
                                                                                        this.setState({
                                                                                            newMod: e.target.value,
                                                                                        });
                                                                                }}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        {this.state.newModAdmin ? <Checkbox checked onChange={() => this.handleAdminCheck()}/> : <Checkbox onChange={() =>this.handleAdminCheck()}/>}
                                                                    </td>
                                                                    <td>
                                                                        <input type="button" value = " Add " onClick={() => this.handleNewMods(this.state.newMod, this.state.newModAdmin)}/>           
                                                                    </td>
                                                                </tr>
                                                            </table>}
                                                            <br></br>
                                                            <table>
                                                                <tr>
                                                                    <th>Moderator</th>
                                                                    <th>Is Admin?</th>
                                                                    <th>Remove</th>
                                                                </tr>              
                                                                {this.state.mod.map(mods =>{
                                                                    return(
                                                                        <tr>
                                                                            <td>{mods.user_name}</td>
                                                                            <td>{mods.is_admin === 'Y' ? "Yes" : "No"} </td>
                                                                            <td> 
                                                                                {this.state.isModAdmin === "Y" &&<Button style={{ borderRadius: '14px' }} variant="contained" color="secondary" onClick={() => this.handleDeleteMod(mods.user_name)}>Remove</Button>}
                                                                                {this.state.isModAdmin !== "Y" &&<Button style={{ borderRadius: '14px' }} disabled variant="contained"  color="secondary">Remove</Button>}
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </table>
                                                        </Stack>
                                                </Paper>
                                            </Item>
                                            <div style={{ backgroundColor: this.state.info.colour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                                                <div className={'sideBoxHeader'}>Community Colour:</div>
                                            </div>
                                            <Item>
                                                <Paper component="form" sx={{ p: '2px 4px', display: 'flex', justifyContent: 'center' }}>                            
                                                    <SketchPicker
                                                    // color = {comColour}
                                                    color = {this.state.info.colour}
                                                    onChangeComplete={this.handleComColourChange}
                                                    />
                                                </Paper>
                                            </Item>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </div>
                     );
                })}
            </>
        )
    }



    render() {
        return (
            <div>
                <div style={{ display: 'block', backgroundColor:this.state.info.colour, height: 175 }}></div>
                    <div style={{ backgroundColor: 'white', height: 135 }}>
                        <div style={{ display: 'flex', marginLeft: '20%', paddingTop: '10px' }}>
                            <div>
                                <Avatar alt="Community Logo" sx={{ width: 55, height: 55 }} src={this.state.info.profile_picture ?
                                    this.state.info.profile_picture: `/static/readit_logo.png`} />
                            </div>
                            <div style={{ marginRight: '25px' }}>
                                <b style={{ fontSize: '30px', marginLeft: '10%' }}>{this.state.info.community_name}</b>
                                <p style={{ marginLeft: '10%', marginTop: '0px' }}>r/{this.state.info.community_name}</p>
                                <PostModButton handleChange={this.handleModeChange} value={this.state.mode} isModAdmin={this.state.isModAdmin} params={this.props.params} navigate={this.props.navigate}/>
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