import './CommunityComponent.scss';
import { retrieveCommunityPosts} from '../../apis/app-api';
import { retrieveAllPosts } from '../../apis/app-api';
import { retrieveCommunityAdmin} from '../../apis/app-api';
import { retrieveCommunityInfo} from '../../apis/app-api';
import * as React from 'react';
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CommentIcon from '@mui/icons-material/Comment';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ForwardIcon from '@mui/icons-material/Forward';
import MenuButton from './MenuButton'
import PostModButton from './PostModButton';
import { Checkbox, Radio, RadioGroup, Tab, tableBodyClasses } from '@mui/material';
import TabButton from './TabButton';
import {withParams } from '../../constants/constants';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

class CommunityComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [],
            //mode:[],
            //order:[],
            // admin: [],
            // info: [],
            //currentTab:'mod'
        };

        console.log("constructor")
        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            retrieveCommunityPosts({
                community_name: this.props.params.community_name,
            }).then(res => {
                console.log('loaded');
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.rows,
                    //mode: JSON.stringify(this.props.location.community),
                });
            });

            
        }

    }

        shouldComponentUpdate (nextProps) {
            if ((nextProps.isVerifyDone && !this.props.isVerifyDone) ||
            (nextProps.location.community !== this.props.location.community)) {
                this.props.setIsLoading(true);
                retrieveCommunityPosts(this.props.params.community_name).then(res => {
                    this.props.setIsLoading(false);
                    this.setState({
                        posts: res.data.rows,
                        mode: JSON.stringify(this.props.location.community),
                    });
                });
                console.log("retrieved-2");
            }
            return true;
        }

    

        // if (props.isVerifyDone) {
        //     this.props.setIsLoading(true);
        //     retrieveCommunityPosts().then(res => {
        //         this.props.setIsLoading(false);
        //         this.setState({
        //             posts: res.data.rows,
        //         });
        //     });
        //     retrieveCommunityAdmin().then(res => {
        //         this.props.setIsLoading(false);
        //         this.setState({
        //             admin: res.data.rows,
        //         });
        //     });
        //     retrieveCommunityInfo().then(res => {
        //         this.props.setIsLoading(false);
        //         this.setState({
        //             info: res.data.rows,
        //         });
        //     });
        // }

    // shouldComponentUpdate (nextProps) {
    //     if (nextProps.isVerifyDone && !this.props.isVerifyDone) {
    //         this.props.setIsLoading(true);
    //         retrieveCommunityPosts().then(res => {
    //             this.props.setIsLoading(false);
    //             this.setState({
    //                 posts: res.data.rows,
    //             });
    //         });
    //         retrieveCommunityAdmin().then(res => {
    //             this.props.setIsLoading(false);
    //             this.setState({
    //                 admin: res.data.rows,
    //             });
    //         });
    //         retrieveCommunityInfo().then(res => {
    //             this.props.setIsLoading(false);
    //             this.setState({
    //                 info: res.data.rows,
    //             });
    //         });
    //     }
    //     return true;
    // }

    renderNorm = (inf) => {
        return (
            <>
            <div className={'container'}>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={8}>
                            <div>
                                <Box sx={{ width: '100%' }}>
                                    <Stack spacing={1}>
                                        <div>
                                            <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
                                                <IconButton sx={{ p: '10px' }} aria-label="menu">
                                                    <AccountCircleIcon />
                                                </IconButton>
                                                <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Post Something New" inputProps={{ 'aria-label': 'post text' }} />
                                                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                                                <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                                                    <AddPhotoAlternateIcon />
                                                </IconButton>
                                                <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                                                    <AttachFileIcon />
                                                </IconButton>
                                            </Paper>
                                        </div>
                                        <Item>
                                            <Stack direction="row" justifyContent="left">
                                                {/* <Button style={{borderRadius:'14px'}} variant="contained" startIcon={<RocketSharpIcon />}>Best</Button>
                                                <Button style={{borderRadius:'14px'}} variant="outlined" startIcon={<LocalFireDepartmentIcon />}>Hot</Button>
                                                <Button style={{borderRadius:'14px'}} variant="outlined" startIcon={<AccessTimeFilledSharpIcon />}>New</Button>
                                                 */}
                                                <TabButton/>
                                            </Stack>
                                        </Item>
                                        {this.state.posts.map(post => {
                                            // {console.log(post)}
                                            return (
                                                   <Item style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex'}}>
                                                    <div>r/{post.community_name}</div>
                                                        <div style= {{marginLeft:'16px',}}>
                                                            Posted by u/{post.user_name}
                                                        </div>
                                                        <div
                                                            style={{marginLeft:'16px'}}>
                                                            {/* {post.age.days ? post.age.days + ' days ago' : post.age.hours +' hours ago'} */}
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{textAlign: 'left'}}>
                                                        <b>{post.title}</b>
                                                        <Chip
                                                            label={post.flair_name}
                                                            color="primary"
                                                            variant="outlined"
                                                            size="small"
                                                            clickable={true}
                                                        />
                                                    </div>
                                                    <div style={{display: 'flex'}}>
                                                        <IconButton sx={{ p: '10px'}} aria-label="upvote">
                                                            <ForwardIcon style={{transform:'rotate(270deg)'}}/>
                                                        </IconButton>
                                                        <div style={{alignSelf:'center'}}>
                                                            2{/* {post.favour} */}
                                                        </div>
                                                        <IconButton sx={{ p: '10px'}} aria-label="downvote">
                                                            <ForwardIcon style={{transform:'rotate(90deg)'}}/>
                                                        </IconButton>

                                                        <IconButton sx={{ p: '10px' }} aria-label="comment">
                                                            <CommentIcon />
                                                        </IconButton>
                                                        <p style={{ marginRight:'16px'}}>
                                                            7 {/* {post.noOfComments}{' '} */}
                                                            Comments
                                                        </p>
                                                        <IconButton sx={{ p: '10px' }} aria-label="favourite">
                                                            <BookmarkIcon />
                                                        </IconButton>
                                                        <p>Favourite</p>
                                                        <MenuButton/>
                                                    </div>
                                                </Item>
                                            );
                                        })}
                                    </Stack>
                                </Box>
                            </div>
                        </Grid>
                        <Grid item xs={4}>
                            <div style={{ backgroundColor: inf.colour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                                <b>About Community</b>
                            </div>
                            <Item>

                                <div style={{ textAlign: 'left', padding: 10 }}>
                                    <b>Welcome to r/{inf.community_name}</b>
                                    <p></p>
                                    <Divider style={{margin:'16px 0'}}></Divider>
                                    <b>Creation Date: {inf.datetime_created}</b>
                                    <Divider style={{margin:'16px 0'}}></Divider>
                                    <b>Moderators:</b>
                                    <ul>
                                    {this.state.admin.map((adm) => {
                                            return (
                                                <ul>
                                                    <li>u/{adm.user_name} </li>
                                                </ul>                                                   
                                            );
                                        })}
                                    </ul>
                                </div>
                            </Item>

                        </Grid>
                    </Grid>
                </Box>
            </div>
        </>
        )
    }

    renderMod = (inf) => {
        return (
            <>
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
                                                     </tr>
                                                    <tr>
                                                        <td>12</td>
                                                        <td>22</td>
                                                        <td>2</td>
                                                    </tr>
                                                </table>
                                            </Paper>
                                        </div>
                                    </Stack>
                                </Box>
                            </div>
                        </Grid>
                        <Grid item xs={4}>
                            <div style={{ backgroundColor: inf.colour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                                <b>Community Settings:</b>
                            </div>
                            <Item >
                                <span><b>Allow Comments: </b><Checkbox></Checkbox></span>
                                <br></br>
                                <span><b>Allow Favours: </b><Checkbox></Checkbox></span>
                            </Item>
                        </Grid>
                    </Grid>
                </Box>
            </div> 
            </>
        )
    }



    render() {
        return (
            <div>
                {this.state.posts?.map((inf) => {
                                            return (
                                                <>
                                                <div style={{ display: 'block', backgroundColor: inf.colour, height: 175 }}></div>
                                                    
                                                 {/* <div style={{ backgroundColor: 'white', height: 135 }}>
                                                    <div style={{ display: 'flex', marginLeft: '20%', paddingTop: '10px' }}>
                                                        <div>
                                                            <Avatar alt="Community Logo" sx={{ width: 55, height: 55 }} src='logo192.png' />
                                                        </div>
                                                        <div style={{ marginRight: '25px' }}>
                                                            <b style={{ fontSize: '30px', marginLeft: '10%' }}>{inf.community_name}</b>
                                                            <p style={{ marginLeft: '10%', marginTop: '0px' }}>r/{inf.community_name}</p>
                                                            <PostModButton />
                                                        </div>
                                                        <div style={{ margin: '15px' }}>
                                                            <Button style={{ borderRadius: '14px' }} variant="contained">Followed</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                    {console.log("we're here")}
                                                    {console.log(this.state.mode)}
                                                    {this.state.mode === 'mod' ? this.renderMod(inf) : this.renderNorm(inf) } */}
                                                </>
                                            );
                })}
            </div>
        );
    }
}

export default  withParams(CommunityComponent);