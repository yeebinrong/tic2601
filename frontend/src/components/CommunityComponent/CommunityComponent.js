import './CommunityComponent.scss';
import { retrieveCommunityPosts, retrieveCommunityMods, retrieveCommunityInfo} from '../../apis/app-api';
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
            comColour:"",
            comDesc:"",
            comDate:"",
            posts: [],
            url:[],
            mod:[],
            communityInfo:[],
        };

        if (props.isVerifyDone) {
            this.props.setIsLoading(true);  
            retrieveCommunityMods(this.props.params.community_name)
            .then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    mods:res.data.rows
                });
            });
            this.props.setIsLoading(true);
            retrieveCommunityInfo(this.props.params.community_name)
            .then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    communityInfo:res.data.rows,
                    //url: this.props.location.pathname,
                });
            });
            this.props.setIsLoading(true);  
            retrieveCommunityPosts(this.props.params.community_name)
            .then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.rows,
                    url: this.props.location.pathname,
    
                });
            });

            
        }

    }

    shouldComponentUpdate (nextProps) {
        if ((nextProps.isVerifyDone && !this.props.isVerifyDone) ||
        (nextProps.location.community !== this.props.location.community)) {
            this.props.setIsLoading(true);
            retrieveCommunityPosts(nextProps.params.community_name).then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.rows,
                    url: nextProps.location.pathname,
                });
            });
            this.props.setIsLoading(true);
            retrieveCommunityInfo(nextProps.params.community_name)
            .then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    communityInfo:res.data.rows,
                    //url: this.props.location.pathname,
                });
            });
        }
        return true;
    }

    handleChange= (e, newValue) => {
        this.props.navigate({
            pathname: `/community/${this.props.params.community_name}/posts/${newValue}`,
            replace: true,
        });
    };


    renderNorm = (inf) => {
        return (
            <Grid container spacing={6} style={{ margin: '0px 160px' }}>
                <Grid xs={9}>
                    <Box sx={{ width: '100%' }}>
                        <Stack spacing={2}>
                        {renderPostLists(this.state.posts, this.props.params, this.handleChange)}
                        </Stack>
                    </Box>
                </Grid>
                <Grid xs={3} style={{ position: 'relative' }}>
                    <div style={{ backgroundColor: inf.colour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                        <b>About Community</b>
                    </div>
                    <Item>
                        <div style={{ textAlign: 'left', padding: 10 }}>
                            <b>Welcome to r/{inf.community_name}</b>
                            <p></p>
                            <Divider style={{margin:'16px 0'}}></Divider>
                            <b>Creation Date:{this.state.comDate}</b>
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
                            <ul>
                                    
                            </ul>
                        </div>
                    </Item>

                </Grid>
            </Grid>
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
                                                        <td>112</td>
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
                                <div className={'sideBoxHeader'}>Community Settings:</div>
                            </div>
                            <Item>
                                <Box>
                                    <Stack spacing={1} direction={'column'}>
                                        <div><b>Allow Comments: </b><Checkbox></Checkbox></div>
                                        <div><b>Allow Favours: </b><Checkbox></Checkbox></div>
                                    </Stack>
                                </Box>
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
                {this.state.communityInfo.map(cominf => {
                                            this.setState({
                                                comColour:cominf.colour,
                                                comDesc:cominf.description,
                                                comDate:cominf.datetime_created
                                            });
                                            return (
                                                <>
                                                    <div style={{ display: 'block', backgroundColor:this.state.comColour, height: 175 }}></div>
                                                        <div style={{ backgroundColor: 'white', height: 135 }}>
                                                            <div style={{ display: 'flex', marginLeft: '20%', paddingTop: '10px' }}>
                                                                <div>
                                                                    <Avatar alt="Community Logo" sx={{ width: 55, height: 55 }} src={cominf.profile_picture ?
                                                                     cominf.profile_picture: `/static/readit_logo.png`} />
                                                                </div>
                                                                <div style={{ marginRight: '25px' }}>
                                                                    <b style={{ fontSize: '30px', marginLeft: '10%' }}>{cominf.community_name}</b>
                                                                    <p style={{ marginLeft: '10%', marginTop: '0px' }}>r/{cominf.community_name}</p>
                                                                    {/* { console.log(this.props.params.community_name) } */}
                                                                    <PostModButton params={this.props.params} navigate={this.props.navigate}/>
                                                                </div>
                                                                <div style={{ margin: '15px' }}>
                                                                <Button style={{ borderRadius: '14px' }} variant="contained">Followed</Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                </>
                                            )

                })}
                {this.state.posts?.map(inf => {
                                            return (
                                                <>
                                                    { this.state.url.split("/").pop() === "mod" ? this.renderMod(inf) : this.renderNorm(inf) }
                                                </>
                                            );
                })}
            </div>
        );
    }
}

export default  withParams(CommunityComponent);