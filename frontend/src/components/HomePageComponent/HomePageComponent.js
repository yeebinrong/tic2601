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
    Avatar,
    Divider,
    Chip,
    Button,
    Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import CommentIcon from '@mui/icons-material/Comment';
import ForwardIcon from '@mui/icons-material/Forward';
import CreateCommunityComponent from '../CreateCommunityComponent/CreateCommunityComponent';
import moment from 'moment'

export const renderPostLists = (posts, params, handleChange, onFavourChange, onDeletePostCallBack, currentUser, mainColour) => {
    return (
    <>
        <Item>
            <TabButton
                value={params.currentTab}
                handleChange={handleChange}
                indicatorColor={mainColour}
            />
        </Item>
        {!posts && (
            <Item key={'no_post_found'} style={{ height: '64px', padding: '32px', textAlign: 'center' }}>
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
                            style={{ paddingTop: '8px' }}
                            direction="row"
                            divider={
                                <Divider
                                    orientation="vertical"
                                    flexItem
                                />
                            }
                            spacing={2}
                        >
                            <Box
                                style={{
                                    display: 'flex',
                                }}
                            >
                                <Avatar
                                    style={{ margin: '0 8px 0 8px' }}
                                    sx={{ width: 32, height: 32 }}
                                    src={post.post_profile_picture ? post.post_profile_picture : `/static/user-avatar-default.png`}>
                                </Avatar>
                                <a  href={`/community/${post.community_name}/posts/best`}
                                style={{
                                    margin: 'auto',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                }}>
                                    <Button
                                        style={{ textTransform: 'none' }}
                                    >
                                        r/{post.community_name}
                                    </Button>
                                </a>
                            </Box>
                            <Box
                                style={{
                                    display: 'flex',
                                }}
                            >
                                <Avatar
                                    style={{ margin: '0 8px 0 0' }}
                                    sx={{ width: 32, height: 32 }}
                                    src={post.profile_picture ?
                                        post.profile_picture :
                                        `/static/user-avatar-default.png`}>
                                </Avatar>
                                <a style={{ margin: 'auto', color: 'inherit', textDecoration: 'none' }} href={`/user/${post.user_name}/profile/overview`}>
                                    <Button
                                        style={{ textTransform: 'none' }}
                                    >
                                        Posted by u/{post.user_name}
                                    </Button>
                                </a>
                            </Box>
                            <Box
                                style={{
                                    margin: 'auto 0 auto 16px',
                                }}
                            >
                                <Tooltip title={moment(post.datetime_created).format('DD-MM-YYYY hh:mmA')}>
                                    <div>
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
                                    </div>
                                </Tooltip>
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
                                clickable={false}
                            />
                        </Stack>
                        {post.url && !post.url.includes('digitaloceanspaces') &&
                        <Stack>
                            <iframe
                                width="560"
                                height="315"
                                src={post.url}
                                title={`embedUrl-${index}`}
                                className={'post-image'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </Stack>}
                        {post.url && post.url.includes('digitaloceanspaces') &&
                        <Stack>
                            <img
                                alt={''}
                                width="560"
                                height="315"
                                src={post.url}
                                title={post.url}
                                className={'post-image'}
                                frameBorder="0"
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
                                <a style={{ color: 'inherit', textDecoration: 'none' }} href={`/community/${post.community_name}/view/${post.post_id}`}>
                                    <Button
                                            style={{ textTransform: 'none', height: '100%' }}
                                    >
                                        <CommentIcon sx={{ color:'rgba(0, 0, 0, 0.54)', marginRight: '8px' }} />
                                        {post.comment_count}{' '}
                                        Comments
                                    </Button>
                                </a>
                            </Box>
                            <MenuButton
                                communityName={post.community_name}
                                postId={post.post_id}
                                postOwner={post.user_name}
                                href={`/community/${post.community_name}/view/${post.post_id}`}
                                deleteCallback={onDeletePostCallBack}
                                canDelete={post.user_name === currentUser}
                            />
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
    function scrollToTop() {
        window.scrollTo({
        top: 0,
        behavior: "smooth"
    });}

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
                        backgroundColor: 'rgb(0, 178, 210)',
                    }}
                    onClick={() => scrollToTop()}
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

    onDeletePostCallBack = (name, id) => {
        let tempPosts = this.state.posts;
        tempPosts = tempPosts.filter(p => !(p.community_name === name && p.post_id === id));
        this.setState({
            posts: tempPosts,
        });
    }

    render() {
        return (
            <Grid container spacing={6} style={{ margin: '16px 280px' }}>
                <Grid xs={8} >
                    <Box sx={{ width: '100%' }}>
                        <Stack spacing={2}>
                            {renderPostLists(this.state.posts, this.props.params, this.handleChange, this.onFavourChange, this.onDeletePostCallBack, this.props.userInfo?.username, 'rgb(0, 178, 210)')}
                        </Stack>
                    </Box>
                </Grid>
                <Grid xs style={{ position: 'relative' }}>
                    <div style={{ color: 'white', backgroundColor: 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '16px 6px 6px 6px', textIndent: '16px' }}>
                        <b>Home</b>
                    </div>
                    <Item style={{ padding: '12px 32px 32px 32px' }}>
                        <Stack spacing={2} direction="column">
                            <Box style={{ textAlign: 'left' }}>
                                <p>Your personal Readit homepage.</p>
                                <p>
                                    Come here to check in with your favourite
                                    communities.
                                </p>
                            </Box>
                            <Chip
                                style={{ backgroundColor: 'rgb(0, 178, 210)' }}
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
