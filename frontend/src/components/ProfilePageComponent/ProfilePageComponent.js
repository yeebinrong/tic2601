import { Box, Button, Divider, Stack, Tab, Tabs } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { withSnackbar } from 'notistack';
import React from 'react';
import { getUserProfile, uploadProfilePicture } from '../../apis/app-api';
import { snackBarProps, withParams } from '../../constants/constants';
import { Item } from '../HomePageComponent/HomePageComponent';

class ProfilePageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user_name: null,
            profile_picture: null,
            selectedFile: null,
            user_description: null,
        }

        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            getUserProfile(this.props.params.userName)
            .then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    ...res.data.userInfo,
                });
            })
        }
    }

    shouldComponentUpdate (nextProps) {
        if ((nextProps.isVerifyDone && !this.props.isVerifyDone) ||
        nextProps.params.userName !== this.props.params.userName ||
        nextProps.userInfo.username !== this.props.userInfo.username ||
        nextProps.userInfo.profile_picture !== this.props.userInfo.profile_picture
        ) {
            this.props.setIsLoading(true);
            getUserProfile(nextProps.params.userName)
            .then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    ...res.data.userInfo,
                    selectedFile: null,
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
            this.setState({ selectedFile: e.target.files[0] });
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
                this.props.setUserInfo({
                    ...this.props.userInfo,
                    profile_picture: `${res.data.profile_picture_url}?${Date.now()}`,
                });
                this.props.setIsLoading(false);
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
        })
        e.target.value = null;
    }

    render() {
        return (
            <div style={{ fontSize: '30px', margin: '32px 184px 0px 184px' }}>
                <Grid xs style={{ position: 'relative' }}>
                    <Item key={'community_panel'} style={{ padding: '16px' }}>
                        <Stack spacing={2} direction="column">
                            {this.props.isVerifyDone &&
                            this.props.userInfo &&
                            !this.props.isLoading &&
                            !this.state.user_name &&
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
                                    value={'overview'}
                                    onChange={() => {}}
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
                                        label="Saved"
                                        value="saved"
                                    />}
                                    {this.props.userInfo.username !== '' &&
                                    this.state.user_name === this.props.userInfo.username &&
                                    <Tab
                                        label="Hidden"
                                        value="hidden"
                                    />}
                                    {this.props.userInfo.username !== '' &&
                                    this.state.user_name === this.props.userInfo.username &&
                                    <Tab
                                        label="Favoured"
                                        value="favoured"
                                    />}
                                </Tabs>
                                <Divider />
                                <div style={{ margin: '16px', display: 'flex' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                                            <input
                                                type="file"
                                                style={{ marginTop: '16px' }}
                                                onChange={this.onFileChange}
                                                accept="image/png, image/gif, image/jpeg, image/jpg"
                                            />
                                            <Button
                                                disabled={!this.state.selectedFile}
                                                onClick={this.onProfilePictureChange}
                                            >
                                                Change profile picture
                                            </Button>
                                        </>}
                                    </div>
                                    <div style={{ marginLeft: '16px' }}>
                                        <b>{this.state.username}</b>
                                        <div>u/{this.state.user_name}</div>
                                        {this.props.userInfo.username !== '' &&
                                        this.state.user_name === this.props.userInfo.username &&
                                        <div>{this.props.userInfo.email}</div>}
                                    </div>
                                    <div style={{ marginLeft: '32px' }}>
                                        Description:
                                    </div>
                                    <div style={{ marginLeft: '32px' }}>
                                        <div>
                                            {this.state.user_description &&
                                            this.state.user_description !== '' ?
                                            this.state.user_description : 'User has not entered a description!'}
                                        </div>
                                        {this.props.userInfo.username !== '' &&
                                        this.state.user_name === this.props.userInfo.username &&
                                        <Button
                                            style={{ marginTop: 'auto' }}
                                        >
                                            Change description
                                        </Button>}
                                    </div>
                                </div>
                            </Box>}
                        </Stack>
                    </Item>
                </Grid>
            </div>
        );
    }
}

export default withSnackbar(withParams(ProfilePageComponent));