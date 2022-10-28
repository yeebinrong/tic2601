import React from 'react';
import './HomePageComponent.scss';
import { retrieveHomePagePosts, modifyFavour } from '../../apis/app-api';
import { getQueryParameters, withParams } from '../../constants/constants';
import TabButton from '../TabButton';
import MenuButton from '../MenuButton';
import {
    styled,
    Box,
    Stack,
    Paper,
    IconButton,
    Divider,
    Chip,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import CommentIcon from '@mui/icons-material/Comment';
import StarsIcon from '@mui/icons-material/Stars';
import ForwardIcon from '@mui/icons-material/Forward';
import CreateCommunityComponent from '../CreateCommunityComponent/CreateCommunityComponent';

export const renderPostLists = (posts, params, handleChange, onFavourChange) => {
    return (
    <>
        <Item>
            <TabButton
                value={params.currentTab}
                handleChange={handleChange}
            />
        </Item>
        {!posts && (
            <Item key={'no_post_found'} style={{ height: '64px', textAlign: 'center' }}>
                <p>No posts found!</p>
            </Item>
        )}
        {posts && posts.map((post, index) => {
            return (
                <Item key={`${post.community_name}${post.post_id}`}>
                    <Stack
                        spacing={1}
                        direction="column"
                        style={{ margin: '6px' }}
                    >
                        <Stack
                            direction="row"
                            divider={
                                <Divider
                                    orientation="vertical"
                                    flexItem
                                />
                            }
                            spacing={2}
                        >
                            <Box>
                                <IconButton
                                    color="primary"
                                    sx={{ p: '10px' }}
                                    aria-label="stars"
                                >
                                    <StarsIcon />
                                </IconButton>
                                <a href={`/community/${post.community_name}/posts/best`}>
                                    r/{post.community_name}
                                </a>
                            </Box>
                            <Box
                                style={{
                                    paddingTop: '11px',
                                }}
                            >
                                <a href={`/user/${post.user_name}/view`}>
                                    Posted by u/{post.user_name}
                                </a>
                            </Box>
                            <Box
                                style={{
                                    paddingTop: '11px',
                                }}
                            >
                                {(post.age.years &&
                                    post.age.years +
                                        ' years ago') ||
                                    (post.age.months &&
                                        post.age.months +
                                            ' months ago') ||
                                    (post.age.days &&
                                        post.age.days +
                                            ' days ago') ||
                                    (post.age.hours &&
                                        post.age.hours +
                                            ' hours ago') ||
                                    (post.age.minutes &&
                                        post.age.minutes +
                                            ' minutes ago') ||
                                    (post.age.seconds &&
                                        post.age.seconds +
                                            ' seconds ago')}
                            </Box>
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={1}
                            style={{
                                alignItems: 'center',
                                textAlign: 'left',
                                paddingLeft: '11px',
                            }}
                        >
                            <b>{post.title}</b>
                            <Chip
                                label={post.flair}
                                color="primary"
                                variant="outlined"
                                size="small"
                                clickable={true}
                            />
                        </Stack>
                        {post.url && !post.url.includes('digitaloceanspaces') &&
                        <Stack>
                            <iframe
                                width="560"
                                height="315"
                                src={post.url}
                                title={`embedUrl-${index}`}
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                            />
                        </Stack>}
                        {post.url && post.url.includes('digitaloceanspaces') &&
                        <Stack>
                            <img
                                alt={''}
                                width="560"
                                height="315"
                                src={post.url}
                                title={`embedUrl-${index}`}
                                frameborder="0"
                            />
                        </Stack>}
                        <Stack direction="row" spacing={1}>
                            <Box>
                                <IconButton
                                    sx={{ p: '10px' }}
                                    aria-label="upfavour"
                                >
                                    {(post.is_favour === null || post.is_favour === -1) &&
                                    <ForwardIcon className='upFavourStyle' onClick={() => onFavourChange(post.post_id, post.is_favour, 1, post.user_name, index, post.community_name)} />}
                                    {post.is_favour === 1 &&
                                        <ForwardIcon className='upFavourColorStyle' onClick={() => onFavourChange(post.post_id, post.is_favour, 0, post.user_name, index, post.community_name)} />}
                                </IconButton>
                                {post.fav_point
                                    ? post.fav_point
                                    : 0}
                                <IconButton
                                    sx={{ p: '10px' }}
                                    aria-label="downfavour"
                                >
                                    {(post.is_favour === null || post.is_favour === 1) &&
                                    <ForwardIcon className='downFavourStyle' onClick={() => onFavourChange(post.post_id, post.is_favour, -1, post.user_name, index, post.community_name)} />}
                                    {post.is_favour === -1 &&
                                    <ForwardIcon className='downFavourColorStyle' onClick={() => onFavourChange(post.post_id, post.is_favour, 0, post.user_name, index, post.community_name)} />}
                                </IconButton>
                            </Box>
                            <Box>
                                <a href={`/community/${post.community_name}/view/${post.post_id}`}>
                                    <IconButton
                                        sx={{ p: '10px' }}
                                        aria-label="comment"
                                    >
                                        <CommentIcon />
                                    </IconButton>
                                    {post.comment_count}{' '}
                                    Comments
                                </a>
                            </Box>
                            <MenuButton />
                        </Stack>
                    </Stack>
                </Item>
            );
        })}
    </>
    );
};

export const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
}));

export const renderBackToTopChip = () => {
    return (
        <>
            <Box
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Chip
                    label="Back to Top"
                    color="primary"
                    clickable={true}
                    style={{
                        position: 'fixed',
                        bottom: '23px',
                    }}
                />
            </Box>
        </>
    );
}

class HomePageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isCreateCommunityDialogOpen: false,
            posts: [],
        };
        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            retrieveHomePagePosts({
                ...getQueryParameters(this.props.location.search),
                currentTab: this.props.params.currentTab
            }).then((res) => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.rows,
                });
            });
        }
    }

    shouldComponentUpdate(nextProps) {
        if (
            (nextProps.isVerifyDone && !this.props.isVerifyDone) ||
            (nextProps.location.search !== this.props.location.search) ||
            (nextProps.params.currentTab !== this.props.params.currentTab)
        ) {
            this.props.setIsLoading(true);
            retrieveHomePagePosts({
                ...getQueryParameters(this.props.location.search),
                currentTab: nextProps.params.currentTab
            }).then((res) => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.rows,
                });
            });
        }
        return true;
    }

    handleChange = (e, newValue) => {
        this.props.navigate({
            pathname: `/home/${newValue}`,
            replace: true,
        });
    };

    setIsCreateCommunityDialog = (value) => {
        this.setState({
            isCreateCommunityDialogOpen: value,
        });
    };

    onFavourChange = (postId, favour, value, receiver, index, communityName) => {
        modifyFavour({
            postId: postId,
            favour: favour ? favour : 0,
            value: value,
            receiver: receiver,
            communityName,
        }).then(res => {
            if (!res.error) {
                const tempPosts = this.state.posts;
                if (favour) {
                    if (favour === -1) {
                        if (value === 1) {
                            tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) + 2 : 1;
                            tempPosts[index].is_favour = 1;
                        } else if (value === 0) {
                            tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) + 1 : 0;
                            tempPosts[index].is_favour = null;
                        }
                    } else if (favour === 1) {
                        if (value === -1) {
                            tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) - 2 : -1;
                            tempPosts[index].is_favour = -1;
                        } else if (value === 0) {
                            tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) - 1 : 0;
                            tempPosts[index].is_favour = null;
                        }
                    }
                } else {
                    if (value === 1) {
                        tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) + 1 : 1;
                        tempPosts[index].is_favour = 1;
                    } else if (value === -1) {
                        tempPosts[index].fav_point = tempPosts[index].fav_point || tempPosts[index].fav_point === 0 ? parseInt(tempPosts[index].fav_point) - 1 : -1;
                        tempPosts[index].is_favour = -1;
                    }
                }
                this.setState({
                    posts: tempPosts,
                });
            }
        })
    };

    render() {
        return (
            <Grid container spacing={6} style={{ margin: '16px 160px' }}>
                <Grid xs={9}>
                    <Box sx={{ width: '100%' }}>
                        <Stack spacing={2}>
                            {renderPostLists(this.state.posts, this.props.params, this.handleChange, this.onFavourChange)}
                        </Stack>
                    </Box>
                </Grid>
                <Grid xs style={{ position: 'relative' }}>
                    <Item style={{ padding: '16px' }}>
                        <Stack spacing={2} direction="column">
                            <Box style={{ textAlign: 'left' }}>
                                <b>Home</b>
                                <p>Your personal Readit homepage.</p>
                                <p>
                                    Come here to check in with your favourite
                                    communities.
                                </p>
                            </Box>
                            <Chip
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
                            <Chip
                                label="Create Community"
                                color="primary"
                                variant="outlined"
                                clickable={true}
                                onClick={() =>
                                    this.setIsCreateCommunityDialog(true)
                                }
                            />
                            <CreateCommunityComponent
                                open={this.state.isCreateCommunityDialogOpen}
                                navigate={this.props.navigate}
                                onClose={() =>
                                    this.setIsCreateCommunityDialog(false)
                                }
                            />
                        </Stack>
                    </Item>
                    {renderBackToTopChip()}
                </Grid>
            </Grid>
        );
    }
}

export default withParams(HomePageComponent);
