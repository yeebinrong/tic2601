import { Box, Button, Divider, Stack, Tab, Tabs } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { getUserProfile } from '../../apis/app-api';
import { withParams } from '../../constants/constants';
import { Item } from '../HomePageComponent/HomePageComponent';

class ProfilePageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            localUserInfo: {},
        }

        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            getUserProfile(this.props.params.userName)
            .then(res => {
                this.props.setIsLoading(false);
                console.log(res);
                this.setState({
                    localUserInfo: res.data.userInfo,
                });
            })
        }
    }

    shouldComponentUpdate (nextProps) {
        if ((nextProps.isVerifyDone && !this.props.isVerifyDone) ||
        nextProps.params.userName !== this.props.params.userName
        ) {
            this.props.setIsLoading(true);
            getUserProfile(this.props.params.userName)
            .then(res => {
                this.props.setIsLoading(false);
                console.log(res);
                this.setState({
                    localUserInfo: res.data.userInfo,
                });
            })
        }
        return true;
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
                            !this.state.localUserInfo?.user_name &&
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
                            {this.state.localUserInfo && this.state.localUserInfo.user_name &&
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
                                    this.state.localUserInfo?.user_name === this.props.userInfo.username &&
                                    <Tab
                                        label="Saved"
                                        value="saved"
                                    />}
                                    {this.props.userInfo.username !== '' &&
                                    this.state.localUserInfo?.user_name === this.props.userInfo.username &&
                                    <Tab
                                        label="Hidden"
                                        value="hidden"
                                    />}
                                    {this.props.userInfo.username !== '' &&
                                    this.state.localUserInfo?.user_name === this.props.userInfo.username &&
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
                                            src="/static/user-avatar-default.png"
                                            className={'profile-page-picture'}
                                            alt="readit logo"
                                        />
                                        {this.props.userInfo.username !== '' &&
                                        this.state.localUserInfo?.user_name === this.props.userInfo.username &&
                                        <Button>
                                            Change profile picture
                                        </Button>}
                                    </div>
                                    <div style={{ marginLeft: '16px' }}>
                                        <b>{this.state.localUserInfo?.user_name}</b>
                                        <div>u/{this.state.localUserInfo?.user_name}</div>
                                        {this.props.userInfo.username !== '' &&
                                        this.state.localUserInfo?.user_name === this.props.userInfo.username &&
                                        <div>{this.props.userInfo.email}</div>}
                                    </div>
                                    <div style={{ marginLeft: '32px' }}>
                                        Description:
                                    </div>
                                    <div style={{ marginLeft: '32px' }}>
                                        <div>
                                            {this.state.localUserInfo?.user_description &&
                                            this.state.localUserInfo?.user_description !== '' ?
                                            this.state.localUserInfo?.user_description : 'User has not entered a description!'}
                                        </div>
                                        {this.props.userInfo.username !== '' &&
                                        this.state.localUserInfo?.user_name === this.props.userInfo.username &&
                                        <Button style={{ marginTop: 'auto' }}>
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

export default withParams(ProfilePageComponent);