import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, Button, Divider, FormControl, InputLabel, MenuItem, Select, Stack, Tab, Tabs, TextField } from '@mui/material';
import { Item } from '../HomePageComponent/HomePageComponent';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';

class CreatePostComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            community: null,
        };
    }

    renderDefaultPanel = () => {
        return (
            <Grid xs={3} style={{ position: 'relative' }}>
                <div style={{ backgroundColor: 'lightblue', height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
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
                        <b>4. Read the community's rules</b>
                        <Divider style={{margin:'16px 0'}}></Divider>
                    </div>
                </Item>
            </Grid>
        );
    };

    renderCommunityPanel = () => {
        return (
            <Grid xs={3} style={{ position: 'relative' }}>
                <div style={{ backgroundColor: this.state.community?.colour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>
                    <b>About Community</b>
                </div>
                <Item>
                    <div style={{ textAlign: 'left', padding: 10 }}>
                        <b>Welcome to r/{this.state.community?.community_name}</b>
                        <p></p>
                        <Divider style={{margin:'16px 0'}}></Divider>
                        <b>Creation Date: {this.state.community?.datetime_created}</b>
                        <Divider style={{margin:'16px 0'}}></Divider>
                        <b>Moderators:</b>
                        <ul>
                        {/* {this.state.admin.map((adm) => {
                                return (
                                    <ul>
                                        <li>u/{adm.user_name} </li>
                                    </ul>
                                );
                            })} */}
                        </ul>
                    </div>
                </Item>
            </Grid>
        );
    };

    render() {
        console.log(this.state.community);
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
                                                // value={age}
                                                label="Select a community"
                                                // onChange={handleChange}
                                            >
                                                <MenuItem value={10}>a</MenuItem>
                                                <MenuItem value={20}>b</MenuItem>
                                                <MenuItem value={30}>c</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </Item>
                                <Item>
                                    <Tabs
                                        value={'text'}
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
                                            size='small'
                                            fullWidth
                                            label='Title'
                                        />
                                        <TextField
                                            style={{ marginTop: '32px' }}
                                            size='small'
                                            fullWidth
                                            multiline
                                            rows='10'
                                            label='Text'
                                        />
                                    </div>
                                    <div style={{ padding: '0 24px 24px 24px', display: 'flex' }}>
                                        <Button
                                            variant='contained'
                                        >
                                            flairs
                                        </Button>
                                        <Button
                                            style={{ marginLeft: 'auto' }}
                                            variant='contained'
                                        >
                                            Post
                                        </Button>
                                    </div>
                                </Item>
                            </Stack>
                        </Box>
                    </Grid>
                    {this.state.community ? this.renderCommunityPanel() : this.renderDefaultPanel()}
                </Grid>
            </div>
        );
    }
}

export default CreatePostComponent;