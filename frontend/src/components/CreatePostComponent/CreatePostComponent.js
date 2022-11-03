import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, Button, Divider, FormControl, InputLabel, MenuItem, Select, Stack, Tab, Tabs, TextField } from '@mui/material';
import { Item } from '../HomePageComponent/HomePageComponent';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import { createImagePostApi, createLinkPostApi, createTextPostApi, retrieveAllFollowedCommunities } from '../../apis/app-api';
import { withSnackbar } from 'notistack';
import { snackBarProps } from '../../constants/constants';



class CreatePostComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedCommunity: null,
            title: '',
            content: '',
            selectedFlair: 'Text',
            followedCommunties: null,
            currentTab: 'text',
        };
        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            retrieveAllFollowedCommunities().then(res => {
                this.props.setIsLoading(false);
                if (!res.error) {
                    this.setState({
                        followedCommunties: res.data.rows.map(k => k.community_name),
                    });
                } else {
                    this.setState({
                        followedCommunties: [],
                    })
                }
            });
        }
    }

    shouldComponentUpdate (nextProps) {
        if (nextProps.isVerifyDone && !this.props.isVerifyDone) {
            this.props.setIsLoading(true);
            retrieveAllFollowedCommunities().then(res => {
                this.props.setIsLoading(false);
                if (!res.error) {
                    this.setState({
                        followedCommunties: res.data.rows.map(k => k.community_name),
                    });
                } else {
                    this.setState({
                        followedCommunties: [],
                    })
                }
            });
        }
        return true;
    }

    renderDefaultPanel = () => {
        return (
            <Grid xs={3} style={{ position: 'relative' }}>
                <div style={{ color: 'white', backgroundColor: '#1565c0', height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                    <b>Posting to Readit</b>
                </div>
                <Item>
                    <div style={{ textAlign: 'left', padding: 10 }}>
                        <b>1. Behave like you would in real life </b>
                        <Divider style={{margin:'16px 0'}}></Divider>
                        <b>2. Look for the original source of content </b>
                        <Divider style={{margin:'16px 0'}}></Divider>
                        <b>3. Search for duplicates before posting </b>
                        <Divider style={{margin:'16px 0'}}></Divider>
                    </div>
                </Item>
            </Grid>
        );
    };

    onFileChange = (e) => {
        if(e.target.files[0].size > 1000000){
            this.props.enqueueSnackbar(
                "Maximum file size 1mb, selected file is too big!",
                snackBarProps('error'),
            );
            e.target.value = null;
        } else {
            this.setState({ content: e.target.files[0] });
        }
    }

    handleCreatePostResponse = (res) => {
        if (!res.error) {
            this.props.enqueueSnackbar(
                "Successfully created post!",
                snackBarProps('success'),
            );
            this.props.navigate({
                pathname: `/community/${res.data.community_name}/view/${res.data.post_id}`,
                replace: true,
            });
        } else {
            this.props.enqueueSnackbar(
                "Failed to create post!",
                snackBarProps('error'),
            );
        }
    }

    render() {
        return (
            <div>
                <h2 style={{ marginLeft: '184px', marginBottom: '0' }}>Create a Post</h2>
                <Grid container spacing={6} style={{ margin: '0px 160px' }}>
                    <Grid xs={9}>
                        <Box sx={{ width: '100%' }}>
                            <Stack spacing={2}>
                                <Item>
                                    <div style={{ padding: '24px' }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Select a community</InputLabel>
                                            <Select
                                                value={this.state.selectedCommunity}
                                                label="Select a community"
                                                onChange={(e) => {
                                                    this.setState({
                                                        selectedCommunity: e.target.value,
                                                    });
                                                }}
                                            >
                                                {this.state.followedCommunties &&
                                                    this.state.followedCommunties.map(fc => {
                                                    return (
                                                        <MenuItem key={fc} value={fc}>{fc}</MenuItem>
                                                    );
                                                })}
                                                {!this.state.followedCommunties &&
                                                <MenuItem disabled value={'a'}>No followed communities. Please follow a community before creating a post!</MenuItem>}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </Item>
                                <Item>
                                    <Tabs
                                        value={this.state.currentTab}
                                        onChange={(e, v) => this.setState({ currentTab: v, content: '' })}
                                    >
                                        <Tab
                                            label="text"
                                            value="text"
                                            icon={<TextSnippetIcon />}
                                            iconPosition="start"
                                        />
                                        <Tab
                                            label="image"
                                            value="image"
                                            icon={<ImageIcon />}
                                            iconPosition="start"
                                        />
                                        <Tab
                                            label="link"
                                            value="link"
                                            icon={<LinkIcon />}
                                            iconPosition="start"
                                        />
                                    </Tabs>
                                    <div style={{ padding: '24px' }}>
                                        <TextField
                                            value={this.state.title}
                                            size='small'
                                            fullWidth
                                            label='Title'
                                            onChange={e => this.setState({ title: e.target.value })}
                                        />
                                        {this.state.currentTab === 'text' &&
                                        <TextField
                                            style={{ marginTop: '32px' }}
                                            value={this.state.content}
                                            onChange={e => this.setState({ content: e.target.value })}
                                            size='small'
                                            fullWidth
                                            multiline
                                            rows='10'
                                            label='Text'
                                        />}
                                        {this.state.currentTab === 'image' &&
                                        <input
                                                type="file"
                                                style={{ marginTop: '32px' }}
                                                onChange={this.onFileChange}
                                                accept="image/png, image/gif, image/jpeg, image/jpg"
                                        />}
                                        {this.state.currentTab === 'link' &&
                                        <TextField
                                            style={{ marginTop: '32px' }}
                                            value={this.state.content}
                                            size='small'
                                            fullWidth
                                            label='Link'
                                            onChange={e => this.setState({ content: e.target.value })}
                                        />}
                                    </div>
                                    <div style={{ padding: '0 24px 24px 24px', display: 'flex' }}>
                                        <span style={{ width: '260px' }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Select a flair</InputLabel>
                                                <Select
                                                    value={this.state.selectedFlair}
                                                    label="Select a flair"
                                                    onChange={(e) => {
                                                        this.setState({
                                                            selectedFlair: e.target.value,
                                                        });
                                                    }}
                                                >
                                                    <MenuItem key={'Text'} value={'Text'}>{'Text'}</MenuItem>
                                                    <MenuItem key={'News'} value={'News'}>{'News'}</MenuItem>
                                                    <MenuItem key={'Discussion'} value={'Discussion'}>{'Discussion'}</MenuItem>
                                                    <MenuItem key={'Photo'} value={'Photo'}>{'Photo'}</MenuItem>
                                                    <MenuItem key={'Video'} value={'Video'}>{'Video'}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </span>
                                        <Button
                                            disabled={
                                                !this.state.selectedCommunity ||
                                                this.state.title === '' ||
                                                this.state.content === ''
                                            }
                                            style={{ marginLeft: 'auto' }}
                                            variant='contained'
                                            onClick={() => {
                                                if (this.state.currentTab === 'text') {
                                                    createTextPostApi(
                                                        this.state.selectedCommunity,
                                                        this.state.title,
                                                        this.state.content,
                                                        this.state.selectedFlair,
                                                    ).then(res => {
                                                        this.handleCreatePostResponse(res);
                                                    });
                                                } else if (this.state.currentTab === 'image') {
                                                    const formData = new FormData();
                                                    formData.set('username', this.props.userInfo.username);
                                                    formData.set('selectedCommunity', this.state.selectedCommunity);
                                                    formData.set('title', this.state.title);
                                                    formData.set('selectedFlair', this.state.selectedFlair);
                                                    formData.set('file', this.state.content)
                                                    createImagePostApi(formData)
                                                    .then(res => {
                                                        this.handleCreatePostResponse(res);
                                                    });
                                                } else if (this.state.currentTab === 'link') {
                                                    if (this.state.content.includes('embed')) {
                                                        createLinkPostApi(
                                                            this.state.selectedCommunity,
                                                            this.state.title,
                                                            this.state.content,
                                                            this.state.selectedFlair,
                                                        ).then(res => {
                                                            this.handleCreatePostResponse(res);
                                                        });
                                                    } else {
                                                        this.props.enqueueSnackbar(
                                                            "Please enter a valid embed link!",
                                                            snackBarProps('error'),
                                                        );
                                                    }
                                                }
                                            }}
                                        >
                                            Post
                                        </Button>
                                    </div>
                                </Item>
                            </Stack>
                        </Box>
                    </Grid>
                    {this.renderDefaultPanel()}
                </Grid>
            </div>
        );
    }
}

export default withSnackbar(CreatePostComponent);