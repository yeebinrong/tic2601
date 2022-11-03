import { Box, Button, Divider, Stack, Tab, Tabs, TextField } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import moment from 'moment';
import { withSnackbar } from 'notistack';
import React from 'react';
import { getUserProfile, updateFollow, updateUserDescription, uploadProfilePicture } from '../../apis/app-api';
import { snackBarProps, withParams } from '../../constants/constants';
import { Item } from '../HomePageComponent/HomePageComponent';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';

class ProfilePageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user_name: null,
            profile_picture: null,
            selectedFile: null,
            user_description: null,
            profileLoaded: false,
        }

        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            getUserProfile(this.props.params.userName)
            .then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    ...res.data.userInfo,
                    profileLoaded: true,
                    followedCommunities: res.data.followedCommunities,
                    userComments: res.data.userComments,
                    userFavoured: res.data.userFavoured,
                    userModeratorCommunities: res.data.userModeratorCommunities,
                    userPosts: res.data.userPosts,
                });
            })
        }
        this.fileRef = React.createRef(null);
    }

    shouldComponentUpdate (nextProps) {
        if ((nextProps.isVerifyDone && !this.props.isVerifyDone) ||
        nextProps.params.userName !== this.props.params.userName ||
        nextProps.userInfo.username !== this.props.userInfo.username
        ) {
            this.props.setIsLoading(true);
            getUserProfile(nextProps.params.userName)
            .then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    ...res.data.userInfo,
                    followedCommunities: res.data.followedCommunities,
                    userComments: res.data.userComments,
                    userFavoured: res.data.userFavoured,
                    userModeratorCommunities: res.data.userModeratorCommunities,
                    userPosts: res.data.userPosts,
                    selectedFile: null,
                    profileLoaded: true,
                });
            })
        }
        return true;
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
                profile_picture: URL.createObjectURL(e.target.files[0])
            });
        }
    }

    onProfilePictureChange = (e) => {
        this.props.setIsLoading(true);
        const formData = new FormData();
        formData.set('username', this.props.userInfo.username)
        formData.set('file', this.state.selectedFile)
        uploadProfilePicture(formData)
        .then(res => {
            if (!res.error) {
                const profile_pic_url = `${res.data.profile_picture}?${Date.now()}`;
                this.props.setUserInfo({
                    ...this.props.userInfo,
                    profile_picture: profile_pic_url,
                });
                this.setState({
                    profile_picture: profile_pic_url,
                    selectedFile: null,
                });
                this.props.enqueueSnackbar(
                    "Successfully changed profile picture!",
                    snackBarProps('success'),
                );
            } else {
                this.props.enqueueSnackbar(
                    "Failed to change profile picture!",
                    snackBarProps('error'),
                );
            }
            this.props.setIsLoading(false);
        })
        e.target.value = null;
    }

    changeFollow = (communityName) => {
            updateFollow({ communityName, isFollowing: true })
                .then(res => {
                    if (!res.error) {
                        const tempFollows = this.state.followedCommunities.filter(fc => fc.community_name !== communityName);
                        this.setState({
                            followedCommunities: tempFollows,
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

    render() {
        return (
            <Grid container spacing={6} style={{ margin: '32px 280px 0px 280px' }}>
                <Grid xs={this.state.user_name ? 8 : 12}>
                    <Item key={'community_panel'} style={{ padding: '16px' }}>
                        <Stack spacing={2} direction="column">
                            {this.props.isVerifyDone &&
                            this.props.userInfo &&
                            !this.props.isLoading &&
                            !this.state.user_name &&
                            this.state.profileLoaded &&
                                <div className={'app-error-container'}>
                                    <h2 style={{ textAlign: 'center' }}>
                                        {`User [${this.props.params.userName}] does not exists.`}
                                    </h2>
                                    <img
                                        draggable={false}
                                        src="/static/404_1.png"
                                        className={'app-error'}
                                        alt="error 404"
                                    />
                                    <Button
                                        className={'app-error-button'}
                                        onClick={() => {
                                            this.props.navigate('/home');
                                        }}
                                        variant="outlined"
                                    >
                                        Go Home Page
                                    </Button>
                                </div>
                            }
                            {this.state.user_name &&
                            <Box style={{ textAlign: 'left' }}>
                                <Tabs
                                    defaultValue="overview"
                                    value={this.props.params.currentTab}
                                    TabIndicatorProps={{
                                        style: {
                                            backgroundColor: 'rgb(0, 178, 210)'
                                        }
                                    }}
                                    onChange={(e, newValue) => {
                                        this.props.navigate({
                                            pathname: `/user/${this.props.params.userName}/profile/${newValue}`,
                                            replace: true,
                                        });
                                    }}
                                >
                                    <Tab
                                        label="Overview"
                                        value="overview"
                                    />
                                    <Tab
                                        label="Posts"
                                        value="posts"
                                    />
                                    <Tab
                                        label="Comments"
                                        value="comments"
                                    />
                                    {this.props.userInfo.username !== '' &&
                                    this.state.user_name === this.props.userInfo.username &&
                                    <Tab
                                        label="Favoured"
                                        value="favoured"
                                    />}
                                </Tabs>
                                <Divider />
                                {this.props.params.currentTab === 'overview' &&
                                <div style={{ margin: '16px', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ margin: '8px 0 8px 0', width: '100%', color: 'white', backgroundColor: 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                        <b>User Statistics</b>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'row', margin: '16px' }}>
                                        <Box style={{ marginLeft: '16px' }}>
                                            <div>Username: {this.state.user_name}</div>
                                            <div>Date created: {moment(this.state.datetime_created).format('DD-MM-YYYY hh:mmA')} </div>
                                        </Box>
                                        <Box style={{ margin: '0 auto' }}>
                                            <div>Total posts posted: {this.state.total_posts ? this.state.total_posts : 0} </div>
                                            <div>Total comments posted: {this.state.total_comments ? this.state.total_comments : 0} </div>
                                            <div>Total favours received: {this.state.total_favours ? this.state.total_favours : 0}</div>
                                        </Box>
                                    </div>
                                    <div style={{ width: '100%', color: 'white', backgroundColor: 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                        <b>Followed Communities</b>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', margin: '16px' }}>
                                        <Box style={{ marginLeft: '16px', textAlign: 'left', verticalAlign: 'middle' }}>
                                            {this.state.followedCommunities?.length === 0 && (
                                                <p>No followed communities!</p>
                                            )}
                                            {this.state.followedCommunities?.map(fc => {
                                                return (
                                                    <Box key={fc.community_name} style={{ marginLeft: '16px', marginTop: '8px', display: 'flex' }}>
                                                        <span style={{ margin: 'auto auto auto 0' }}>
                                                            r/{fc.community_name}
                                                        </span>
                                                        <span style={{ margin: 'auto 0 auto auto' }}>
                                                            Followed on {moment(fc.followedDate).format('DD-MM-YYYY hh:mmA')}
                                                        </span>
                                                        <Button
                                                            style={{ marginLeft: '16px', textTransform: 'none' }}
                                                            variant='outlined'
                                                            size='small'
                                                            onClick={() => {
                                                                this.props.navigate({
                                                                    pathname: `/community/${fc.community_name}/posts/best`,
                                                                    replace: true,
                                                                })
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                        {this.props.params?.userName === this.props.userInfo?.username &&
                                                        <Button
                                                            variant="contained"
                                                            style={{ marginLeft: '16px', textTransform: 'none' }}
                                                            onClick={() => this.changeFollow(fc.community_name)}
                                                            color={"primary"}
                                                        >
                                                            Unfollow
                                                        </Button>}
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </div>
                                    <div style={{ width: '100%', color: 'white', backgroundColor: 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                        <b>Communities you moderate</b>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', margin: '16px' }}>
                                        <Box style={{ marginLeft: '16px', textAlign: 'left', verticalAlign: 'middle' }}>
                                            {this.state.userModeratorCommunities?.length === 0 && (
                                                <p>No communities moderated!</p>
                                            )}
                                            {this.state.userModeratorCommunities?.map(mc => {
                                                return (
                                                    <Box key={mc.community_name} style={{ marginLeft: '16px', marginTop: '8px', display: 'flex' }}>
                                                        <span style={{ margin: 'auto 0 auto 0' }}>
                                                            r/{mc.community_name}
                                                        </span>
                                                        <span style={{ margin: '8px 0 auto 16px' }}>
                                                            {mc.is_admin ? <LocalPoliceIcon /> : <ShieldIcon />}
                                                        </span>
                                                        <span style={{ margin: 'auto 0 auto 4px' }}>
                                                            <b>{mc.is_admin ? 'Super Moderator' : 'Moderator'}</b>
                                                        </span>
                                                        <Button
                                                            style={{ margin: 'auto 0 auto auto', textTransform: 'none' }}
                                                            variant='outlined'
                                                            size='small'
                                                            onClick={() => {
                                                                this.props.navigate({
                                                                    pathname: `/community/${mc.community_name}/posts/best`,
                                                                    replace: true,
                                                                })
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </div>
                                </div>}
                                {this.props.params.currentTab === 'posts' &&
                                <div style={{ margin: '16px', display: 'flex', flexDirection: 'column' }}>
                                </div>}
                                {this.props.params.currentTab === 'comments' &&
                                <div style={{ margin: '16px', display: 'flex', flexDirection: 'column' }}>
                                </div>}
                                {this.props.params.currentTab === 'favoured' &&
                                <div style={{ margin: '16px', display: 'flex', flexDirection: 'column' }}>
                                </div>}
                            </Box>}
                        </Stack>
                    </Item>
                </Grid>
                {!(this.props.isVerifyDone &&
                this.props.userInfo &&
                !this.props.isLoading &&
                !this.state.user_name &&
                this.state.profileLoaded) &&
                    <Grid xs style={{ position: 'relative' }}>
                    <div style={{ color: 'white', backgroundColor: 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                        <b>Profile Page</b>
                    </div>
                    <Item>
                        <div style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
                            <img
                                draggable={false}
                                src={this.state.profile_picture ?
                                    this.state.profile_picture:
                                    `/static/user-avatar-default.png`}
                                className={'profile-page-picture'}
                                alt="readit logo"
                            />
                            {this.props.userInfo.username !== '' &&
                            this.state.user_name === this.props.userInfo.username &&
                            <>
                                <Button
                                    style={{ width: '300px', margin: 'auto', marginTop: '16px', textTransform: 'none', backgroundColor: 'rgb(0, 178, 210)' }}
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
                                    Select Profile Picture
                                </Button>
                                <div style={{ width: '200px', margin: '16px auto', padding: '8px', textAlign: 'center', border: 'solid 1px rgb(0, 178, 210)', borderRadius: '5px' }}>
                                    {this.state.selectedFile ? this.state.selectedFile.name : 'No file is selected!'}
                                </div>
                                <Button
                                    style={{ width: '300px', margin: 'auto', textTransform: 'none', backgroundColor: !this.state.selectedFile ? 'rgba(0, 0, 0, 0.24)' : 'rgb(0, 178, 210)' }}
                                    disabled={!this.state.selectedFile}
                                    onClick={this.onProfilePictureChange}
                                    variant='contained'
                                >
                                    Change Profile Picture
                                </Button>
                            </>}
                        </div>
                        <div style={{ textAlign: 'center', marginLeft: '16px' }}>
                            <b>{this.state.user_name}</b>
                            <div>u/{this.state.user_name}</div>
                            {this.props.userInfo.username !== '' &&
                            this.state.user_name === this.props.userInfo.username &&
                            <div>{this.props.userInfo.email}</div>}
                        </div>
                        {this.props.userInfo.username !== '' &&
                        this.state.user_name !== this.props.userInfo.username &&
                        <div style={{ minHeight: '160px', margin: 'auto', display: 'flex', width: '100%' }}>
                            <div style={{ width: '100%', margin: 'auto 32px', overflowWrap: 'anywhere' }}>
                                {this.state.user_description && this.state.user_description !== '' ?
                                `Description: ${this.state.user_description}` : 'User has not entered a description!'}
                            </div>
                        </div>}
                        {this.props.userInfo.username !== '' &&
                            this.state.user_name === this.props.userInfo.username &&
                        <div style={{ margin: '16px 0 8px 32px' }}>
                            Description:
                        </div>}
                        <div style={{ margin: '0 32px', textAlign: 'center' }}>
                            {this.props.userInfo.username !== '' &&
                            this.state.user_name === this.props.userInfo.username &&
                            <TextField
                                fullWidth
                                multiline
                                rows='5'
                                size="small"
                                onChange={(e) =>  {
                                    this.setState({ user_description: e.target.value })
                                }}
                                value={this.state.user_description}
                            />}
                            {this.props.userInfo.username !== '' &&
                            this.state.user_name === this.props.userInfo.username &&
                            <Button
                                disabled={!this.state.user_description || this.state.user_description === ''}
                                style={{ margin: '24px auto',  width: '300px', textTransform: 'none', backgroundColor: 'rgb(0, 178, 210)' }}
                                variant='contained'
                                onClick={() => {
                                    this.props.setIsLoading(true);
                                    updateUserDescription(this.state.user_description)
                                        .then(res => {
                                            if (!res.error) {
                                                this.props.setUserInfo({
                                                    ...this.props.userInfo,
                                                    user_description: res.data.description,
                                                });
                                                this.props.enqueueSnackbar(
                                                    "User description updated successfully!",
                                                    snackBarProps('success'),
                                                );
                                            } else {
                                                this.props.enqueueSnackbar(
                                                    "Failed to update user description!",
                                                    snackBarProps('error'),
                                                );
                                            }
                                            this.props.setIsLoading(false);
                                        })
                                }}
                            >
                                Change Description
                            </Button>}
                        </div>
                    </Item>
                </Grid>}
            </Grid>
        );
    }
}

export default withSnackbar(withParams(ProfilePageComponent));