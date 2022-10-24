import './CommunityComponent.scss';
import { retrieveCommunityPosts, updateFollow, deleteFromBanlist, retireveModPageStats} from '../../apis/app-api';
import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import PostModButton from './PostModButton';
import { Checkbox, Chip } from '@mui/material';
import {withParams } from '../../constants/constants';
import { renderPostLists } from '../HomePageComponent/HomePageComponent';
import { LineChart,Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

let comColour = ""
let comDesc = ""
let comDate = ""
let comName = ""


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

const modStats = [
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

const data = [
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
            info:[],
            url:[],
            mod:[],
            bans:[],
            following:"",
            followStatus: "",
        };

        if (props.isVerifyDone) {
            this.props.setIsLoading(true);  
            retrieveCommunityPosts(this.props.params.community_name)
            .then(res => {
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
                });
            });
            retireveModPageStats(this.props.params.community_name).then(res => {
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
        (nextProps.location.community !== this.props.location.community)
        ) {
            this.props.setIsLoading(true);
            retrieveCommunityPosts(nextProps.params.community_name).then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.postsRows,
                    mod: res.data.modRows,
                    info: res.data.infoRows,
                    stats: res.data.statsRows,
                    bans: res.data.banRows,
                    following: res.data.isFollowing,
                    url: this.props.location.pathname,
                    followStatus: res.data.isFollowing === '0' ? 'follow' : 'following',
                });
            });
            retireveModPageStats(nextProps.params.community_name).then(res => {
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

    handleCheck= (e) => {
        console.log(e.target.value)
    }

    handleChange= (e, newValue) => {
        this.props.navigate({
            pathname: `/community/${this.props.params.community_name}/posts/${newValue}`,
            replace: true,
        });
    };

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

    handleDelete = (banusername) => {
        console.log("deleting")
        console.log(banusername)
        deleteFromBanlist({communityName:this.props.params.community_name,username:banusername})
        

    }

    changeFollow = () => {
      // console.log(this.state.following[0].count);
        updateFollow({communityName:this.props.params.community_name,isFollowing:this.state.following})
            .then(res => {
            this.setState({
                following: res.data.isFollowing,
            });
            console.log(this.state.following)
            this.setState({ followStatus: this.state.following === '0' ? 'follow' : 'following',});
            console.log("change colour")
            console.log(this.state.followStatus)
           })
    }       


    renderNorm = () => {
        return (
            <>
                <Grid container spacing={6} style={{ margin: '0px 160px' }}>
                    <Grid xs={9}>
                        <Box sx={{ width: '100%' }}>
                            <Stack spacing={2}>
                            {renderPostLists(this.state.posts, this.props.params, this.handleChange)}
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid xs={3} style={{ position: 'relative' }}>
                        <div style={{ backgroundColor:comColour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                            
                            <b className={'sideBoxHeader'}>About Community</b>
                        </div>
                        <Item>
                            <div style={{ textAlign: 'left', padding: 10 }}>
                                <b>Welcome to r/{comName}</b>
                                <p>{comDesc}</p>
                                <Divider style={{margin:'16px 0'}}></Divider>
                                <b>Creation Date:{comDate}</b>
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

    renderMod = () => {
        return (
            <>
            { this.state.stats.map(stat => {
                        {followerData[3].Value=stat.follower_count ? stat.follower_count : "0"}
                        {postData[3].Value=stat.post_count ? stat.post_count : "0"}
                        {favData[3].Value=stat.fav_total ? stat.fav_total : "0"}
                        {modStats[3].Value=stat.mod_count ? stat.mod_count : "0"}
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
                                                                    <tr> {console.log(stat.follower_count)}
                                                                        <td>{followerData[3].Value}</td>
                                                                        <td>{postData[3].Value}</td>
                                                                        <td>{favData[3].Value}</td>
                                                                        <td>{modStats[3].Value}</td>
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
                                            <div style={{ backgroundColor: comColour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                                                <div className={'sideBoxHeader'}>Community Banlist:</div>
                                            </div>
                                            <Item>
                                                <Box>
                                                    <Stack spacing={1} direction={'column'}>
                                                        <div>
                                                            <table>
                                                                <tr>
                                                                    <th>Username</th>
                                                                    <th>Approve?</th>
                                                                    <th>Delete</th>
                                                                </tr>
                                                                {this.state.bans?.map(ban => {
                                                                        return(
                                                                            <tr>
                                                                                <td>
                                                                                    {ban.user_name}
                                                                                </td>
                                                                                <td>
                                                                                    {ban.is_approved === true ? <Checkbox disabled checked/> : <Checkbox onChange={this.handleCheck}/>}
                                                                                </td>
                                                                                <td>
                                                                                    <Button style={{ borderRadius: '14px' }} variant="contained" color="secondary" onClick={() => this.handleDelete(ban.user_name)}>Delete</Button>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                            </table>
                                                        </div>
                                                        {/* <div><b>Allow Favours: </b><Checkbox></Checkbox></div> */}
                                                    </Stack>
                                                </Box>
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
                {this.state.info.map(cominf => {
                                            comColour=cominf.colour;
                                            comDate= cominf.datetime_created;
                                            comDesc=cominf.description;
                                            comName=cominf.community_name;
                                            return (
                                                <>
                                                    <div style={{ display: 'block', backgroundColor:comColour, height: 175 }}></div>
                                                        <div style={{ backgroundColor: 'white', height: 135 }}>
                                                            <div style={{ display: 'flex', marginLeft: '20%', paddingTop: '10px' }}>
                                                                <div>
                                                                    <Avatar alt="Community Logo" sx={{ width: 55, height: 55 }} src={cominf.profile_picture ?
                                                                     cominf.profile_picture: `/static/readit_logo.png`} />
                                                                </div>
                                                                <div style={{ marginRight: '25px' }}>
                                                                    <b style={{ fontSize: '30px', marginLeft: '10%' }}>{cominf.community_name}</b>
                                                                    <p style={{ marginLeft: '10%', marginTop: '0px' }}>r/{cominf.community_name}</p>
                                                                    <PostModButton handleChange={this.handleModeChange} value={this.state.mode} params={this.props.params} navigate={this.props.navigate}/>
                                                                </div>
                                                                <div style={{ margin: '15px' }}>
                                                                    {console.log("here")}
                                                                {console.log(this.state.following)}
                                                                {console.log(this.state.followStatus)}
                                                                <Button style={{ borderRadius: '14px' }} variant="contained" onClick={this.changeFollow} color={this.state.following !== '0' ? "primary":"secondary"}>{this.state.followStatus}</Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                </>
                                            )

                })}
                { this.state.mode === "mod" ? this.renderMod() : this.renderNorm() }
            
            </div>
        );
    }
}

export default  withParams(CommunityComponent);