import './CommunityComponent.scss';
import { retrieveCommunityPosts} from '../../apis/app-api';
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
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const data = [
    {
      name: 'User Count',
      Value: 4000,
    },
    {
      name: 'Post Count',
      Value: 3000,
    },
    {
      name: 'Total Favours',
      Value: 2000,
    },
    {
      name: 'Moderator Count',
      Value: 2780,
    },
  ];

export const Recharts = () => {
            {console.log("this is recharts")}   
            return (
              <ResponsiveContainer width="100%" aspect={3}>
                <BarChart
                  width={500}
                  height={1000}
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
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
            following: true,
            followStatus: "Follow",
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
                });
            });

            
        }

    }

    shouldComponentUpdate (nextProps) {
        if ((nextProps.isVerifyDone && !this.props.isVerifyDone) ||
        (nextProps.location.community !== this.props.location.community)||
        (nextProps.following !== this.props.following)) {
            this.props.setIsLoading(true);
            retrieveCommunityPosts(nextProps.params.community_name).then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.postsRows,
                    mod: res.data.modRows,
                    info: res.data.infoRows,
                    stats: res.data.statsRows,
                    bans: res.data.banRows,
                    url: this.props.location.pathname,
                });
            });
        }
        return true;
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
    }

    changeColor = () => {
        this.setState({following:!this.state.following})
        this.setState({followStatus: this.state.following ? "Following" : "Follow"});
        console.log("change colour")
        console.log(this.state.following)
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
                        {data[0].Value=stat.follower_count ? stat.follower_count : "0"}
                        {data[1].Value=stat.post_count ? stat.post_count : "0"}
                        {data[2].Value=stat.fav_total ? stat.fav_total : "0"}
                        {data[3].Value=stat.mod_count ? stat.mod_count : "0"}
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
                                                                        <th>User Count</th>
                                                                        <th>Post Count</th>
                                                                        <th>Total Favours</th>
                                                                        <th>Moderator Count</th>
                                                                    </tr>
                                                                    <tr> {console.log(stat.follower_count)}
                                                                        <td>{data[0].Value}</td>
                                                                        <td>{data[1].Value}</td>
                                                                        <td>{data[2].Value}</td>
                                                                        <td>{data[3].Value}</td>
                                                                    </tr>
                                                                </table>
                                                            </Paper>
                                                        </div>
                                                        <div>
                                                            <Paper component="form" sx={{p: '5px 5px', display: 'flex', justifyContent: 'center' }}>
                                                                <Recharts/>
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
                                                                <Button style={{ borderRadius: '14px' }} variant="contained" onClick={this.changeColor} color={this.state.following ? "primary":"secondary"}>{this.state.followStatus}</Button>
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