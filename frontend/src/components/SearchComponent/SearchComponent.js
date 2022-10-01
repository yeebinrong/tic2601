import { Box, Stack, Chip, IconButton, Button } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { searchForPostWithParams } from '../../apis/app-api';
import { getQueryParameters, withParams } from '../../constants/constants';
import { Item, renderBackToTopChip, renderPostLists } from '../HomePageComponent/HomePageComponent';

class SearchComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            posts: [],
            communities: {},
            users: {},
        };

        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            searchForPostWithParams({
                ...getQueryParameters(this.props.location.search),
                order: this.props.params.currentTab,
            }).then(res => {
                this.props.setIsLoading(false);
                const communities = {};
                const users = {};
                const posts = res.data.rows;
                for (let i = 0; i < posts?.length; i += 1) {
                    communities[posts[i].community_name] = posts[i].community_name;
                    users[posts[i].user_name] = posts[i].user_name;
                }
                this.setState({
                    posts: posts,
                    communities: communities,
                    users: users,
                });
            });
        }
    }

    shouldComponentUpdate (nextProps) {
        if ((nextProps.isVerifyDone && !this.props.isVerifyDone) ||
        (nextProps.location.search !== this.props.location.search) ||
        nextProps.params.currentTab !== this.props.params.currentTab
        ) {
            this.props.setIsLoading(true);
            searchForPostWithParams({
                ...getQueryParameters(nextProps.location.search),
                order: nextProps.params.currentTab,
            }).then(res => {
                this.props.setIsLoading(false);
                const communities = {};
                const users = {};
                const posts = res.data.rows;
                for (let i = 0; i < posts?.length; i += 1) {
                    communities[posts[i].community_name] = posts[i].community_name;
                    users[posts[i].user_name] = posts[i].user_name;
                }
                this.setState({
                    posts: posts,
                    communities: communities,
                    users: users,
                });
            });
        }
        return true;
    }

    handleChange = (e, newValue) => {
        this.props.navigate({
            pathname: `/search/${newValue}`,
            search: this.props.location.search,
            replace: true,
        });
    };

    removeChipAndSearch = (val) => {
        const queryParams = getQueryParameters(this.props.location.search);
        if (val.startsWith('r/')) {
            queryParams.community = '';
        } else if (val.startsWith('u/')) {
            queryParams.user = '';
        } else if (val.startsWith('f/')) {
            queryParams.flair = ''
        } else {
            queryParams.q = '';
        }
        const searchParams = '';
        if (queryParams.community !== '') {
            searchParams += queryParams.community;
        }
        if (queryParams.user !== '') {
            searchParams += queryParams.user;
        }
        if (queryParams.flair !== '') {
            searchParams += queryParams.flair;
        }
        if (queryParams.q !== '') {
            searchParams += queryParams.q;
        }
        this.props.navigate({
            pathname: `/search/${this.props.params.currentTab}`,
            search: searchParams !== '' ? `?${searchParams}` : '',
            replace: true,
        });
    }

    parseSearchToChips = () => {
        const queryParams = getQueryParameters(this.props.location.search);
        const keys = Object.keys(queryParams);
        let chipArray = [];
        for (let i = 0; i < keys.length; i += 1) {
            if (queryParams[keys[i]] !== '') {
                if (keys[i] === 'community') {
                    chipArray.push(`r/${queryParams[keys[i]]}`);
                } else if (keys[i] === 'user') {
                    chipArray.push(`u/${queryParams[keys[i]]}`);
                } else if (keys[i] === 'flair') {
                    chipArray.push(`f/${queryParams[keys[i]]}`);
                } else if (keys[i] === 'q') {
                    chipArray.push(queryParams[keys[i]]);
                }
            }
        }
        return chipArray.map(((val, index) => {
            return (
                <Chip
                    key={index}
                    value={val}
                    label={val}
                    color="primary"
                    variant="outlined"
                    onDelete={() => this.removeChipAndSearch(val)}
                />
            );
        }));
    }

    render() {
        return (
            <>
                <div style={{ fontSize: '30px', margin: '32px 184px 0px 184px' }}>
                    <div>
                        {this.props.location.search === '' ? 'All posts' : 'Search Results'}
                    </div>
                    {this.parseSearchToChips()}
                </div>
                <Grid container spacing={6} style={{ margin: '0px 160px' }}>
                    <Grid xs={9}>
                        <Box sx={{ width: '100%' }}>
                            <Stack spacing={2}>
                                {renderPostLists(this.state.posts, this.props.params, this.handleChange)}
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid xs style={{ position: 'relative' }}>
                        <Item key={'community_panel'} style={{ padding: '16px' }}>
                            <Stack spacing={2} direction="column">
                                <Box style={{ textAlign: 'left' }}>
                                    <b>Communities</b>
                                    {Object.keys(this.state.users).length === 0 && (
                                        <p>No communities found!</p>
                                    )}
                                    {Object.keys(this.state.communities).map(community => {
                                        return (
                                            <Box key={community} style={{ marginLeft: '16px', marginTop: '8px' }}>
                                                r/{community}
                                                <Button
                                                    style={{ marginLeft: '16px' }}
                                                    variant='outlined'
                                                    size='small'
                                                >
                                                    Joined
                                                </Button>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Stack>
                        </Item>
                        <Item key={'user_panel'} style={{ padding: '16px', marginTop: '16px' }}>
                            <Stack spacing={2} direction="column">
                                <Box style={{ textAlign: 'left' }}>
                                    <b>Users</b>
                                    {Object.keys(this.state.users).length === 0 && (
                                        <p>No users found!</p>
                                    )}
                                    {Object.keys(this.state.users).map(user => {
                                        return (
                                            <Box key={user} style={{ marginLeft: '16px', marginTop: '8px' }}>
                                                u/{user}
                                                <Button
                                                    style={{ marginLeft: '16px' }}
                                                    variant='outlined'
                                                    size='small'

                                                >
                                                    View
                                                </Button>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Stack>
                        </Item>
                        {renderBackToTopChip()}
                    </Grid>
                </Grid>
            </>
        );
    }
}


export default withParams(SearchComponent);
