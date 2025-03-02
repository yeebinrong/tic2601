import { Box, Stack, Chip, Button } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { searchForPostWithParams } from '../../apis/app-api';
import { getQueryParameters, withParams } from '../../constants/constants';
import { handleOnFavourChange, Item, renderBackToTopChip, renderPostLists } from '../HomePageComponent/HomePageComponent';

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
        if (this.props.location.search === '') {
            this.props.navigate({
                pathname: `/home/best`,
                replace: true,
            });
        }
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
        let searchParams = '';
        if (queryParams.community !== '') {
            searchParams += `community=${queryParams.community}&`;
        }
        if (queryParams.user !== '') {
            searchParams += `user=${queryParams.user}&`;
        }
        if (queryParams.flair !== '') {
            searchParams += `flair=${queryParams.flair}&`;
        }
        if (queryParams.q !== '') {
            searchParams += `q=${queryParams.q}&`;
        }
        if (searchParams === '') {
            this.props.navigate({
                pathname: `/home/best`,
                replace: true,
            });
        } else {
            this.props.navigate({
                pathname: `/search/${this.props.params.currentTab}`,
                search: searchParams !== '' ? `?${searchParams.slice(0, -1)}` : '',
                replace: true,
            });
        }
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
                    chipArray.push(`Searching for [${queryParams[keys[i]]}]`);
                }
            }
        }
        return chipArray.map(((val, index) => {
            let color = 'rgb(0, 178, 210)';
            if (val.startsWith('u/')) {
                color = 'teal';
            } else if (val.startsWith('f/')) {
                color = 'purple'
            } else if (val.startsWith('Searching')) {
                color = '#1976d2';
            }
            return (
                <Chip
                    style={{ marginLeft: '8px', backgroundColor: color }}
                    key={index}
                    value={val}
                    label={val}
                    color="primary"
                    variant="contained"
                    onDelete={() => this.removeChipAndSearch(val)}
                />
            );
        }));
    }

    onFavourChange = async (posts, postId, favour, value, receiver, index, communityName) => {
        let tempPosts = await handleOnFavourChange(posts, postId, favour, value, receiver, index, communityName);
        this.setState({
            posts: tempPosts,
        });
    };

    onDeletePostCallBack = (name, id) => {
        let tempPosts = this.state.posts;
        tempPosts = tempPosts.filter(p => !(p.community_name === name && p.post_id === id));
        this.setState({
            posts: tempPosts,
        });
    }

    render() {
        return (
            <>
                <div style={{ fontSize: '30px', margin: '32px 184px 0px 304px' }}>
                    <div>
                        Search Results
                    </div>
                    {this.parseSearchToChips()}
                </div>
                <Grid container spacing={6} style={{ margin: '16px 280px' }}>
                    <Grid xs={8}>
                        <Box sx={{ width: '100%' }}>
                            <Stack spacing={2}>
                                {renderPostLists(this.state.posts, this.props.params, this.handleChange, this.onFavourChange, this.onDeletePostCallBack, this.props.userInfo.username, 'rgb(0, 178, 210)')}
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid xs style={{ position: 'relative' }}>
                        <div style={{ color: 'white', backgroundColor: 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                            <b>Communities</b>
                        </div>
                        <Item key={'community_panel'} style={{ padding: '16px' }}>
                            <Stack spacing={2} direction="column">
                                <Box style={{ textAlign: 'left' }}>
                                    {Object.keys(this.state.users).length === 0 && (
                                        <p>No communities found!</p>
                                    )}
                                    {Object.keys(this.state.communities).map(community => {
                                        return (
                                            <Box key={community} style={{ marginLeft: '16px', marginTop: '8px', display: 'flex' }}>
                                                r/{community}
                                                <Button
                                                    style={{ marginLeft: 'auto', textTransform: 'none' }}
                                                    variant='outlined'
                                                    size='small'
                                                    onClick={() => {
                                                        this.props.navigate({
                                                            pathname: `/community/${community}/posts/best`,
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
                            </Stack>
                        </Item>
                        <Item key={'user_panel'} style={{ marginTop: '16px' }}>
                            <div style={{ color: 'white', backgroundColor: 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                                <b>Users</b>
                            </div>
                            <Stack spacing={2} direction="column" style={{ padding: '16px' }}>
                                <Box style={{ textAlign: 'left' }}>
                                    {Object.keys(this.state.users).length === 0 && (
                                        <p>No users found!</p>
                                    )}
                                    {Object.keys(this.state.users).map(user => {
                                        return (
                                            <Box key={user} style={{ marginLeft: '16px', marginTop: '8px', display: 'flex' }}>
                                                u/{user}
                                                <Button
                                                    style={{ marginLeft: 'auto' }}
                                                    variant='outlined'
                                                    size='small'
                                                    onClick={() => {
                                                        this.props.navigate({
                                                            pathname: `/user/${user}/profile/overview`,
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
