import React from 'react';
import './HomePageComponent.scss';
import { retrieveHomePagePosts } from '../../apis/app-api';
import { getQueryParameters, withParams } from '../../constants/constants';
import TabButton from '../TabButton';
import MenuButton from '../MenuButton';
import {
    styled,
    Box,
    Stack,
    Paper,
    InputBase,
    IconButton,
    Divider,
    Chip,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CommentIcon from '@mui/icons-material/Comment';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarsIcon from '@mui/icons-material/Stars';
import ForwardIcon from '@mui/icons-material/Forward';
import CreateCommunityComponent from '../CreateCommunityComponent/CreateCommunityComponent';

class HomePageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isCreateCommunityDialogOpen: false,
            currentTab: '',
            posts: [],
        };
        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            retrieveHomePagePosts({
                ...getQueryParameters(this.props.location.search),
                currentTab: this.props.params.currentTab,
                sortBy: this.props.params.sortBy,
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
            nextProps.location.search !== this.props.location.search
        ) {
            this.props.setIsLoading(true);
            retrieveHomePagePosts({
                ...getQueryParameters(nextProps.location.search),
                currentTab: nextProps.params.currentTab,
                sortBy: nextProps.params.sortBy,
            }).then((res) => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.rows,
                });
            });
        }
        return true;
    }

    setIsCreateCommunityDialog = (value) => {
        this.setState({
            isCreateCommunityDialogOpen: value,
        });
    };

    render() {
        return (
            <Grid container spacing={6} style={{ margin: '16px 160px' }}>
                <Grid xs={9}>
                    <Box sx={{ width: '100%' }}>
                        <Stack spacing={2}>
                            <Box>
                                <Paper
                                    component="form"
                                    sx={{
                                        p: '2px 4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <IconButton
                                        sx={{ p: '10px' }}
                                        aria-label="profile"
                                    >
                                        <AccountCircleIcon />
                                    </IconButton>
                                    <InputBase
                                        sx={{ ml: 1, flex: 1 }}
                                        placeholder="Create Post"
                                        inputProps={{
                                            'aria-label': 'create a post',
                                        }}
                                    />
                                    <Divider
                                        sx={{ height: 28, m: 0.5 }}
                                        orientation="vertical"
                                    />
                                    <IconButton
                                        color="primary"
                                        sx={{ p: '10px' }}
                                        aria-label="photo"
                                    >
                                        <AddPhotoAlternateIcon />
                                    </IconButton>
                                    <IconButton
                                        color="primary"
                                        sx={{ p: '10px' }}
                                        aria-label="attach"
                                    >
                                        <AttachFileIcon />
                                    </IconButton>
                                </Paper>
                            </Box>
                            <Item>
                                <TabButton />
                            </Item>
                            {this.state.posts?.map((post) => {
                                return (
                                    <Item>
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
                                                    r/{post.community_name}
                                                </Box>
                                                <Box
                                                    style={{
                                                        paddingTop: '11px',
                                                    }}
                                                >
                                                    Posted by u/{post.user_name}
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
                                            <Stack direction="row" spacing={1}>
                                                <Box>
                                                    <IconButton
                                                        sx={{ p: '10px' }}
                                                        aria-label="upvote"
                                                    >
                                                        <ForwardIcon
                                                            style={{
                                                                transform:
                                                                    'rotate(270deg)',
                                                            }}
                                                        />
                                                    </IconButton>
                                                    {post.fav_point
                                                        ? post.fav_point
                                                        : 0}
                                                    <IconButton
                                                        sx={{ p: '10px' }}
                                                        aria-label="downvote"
                                                    >
                                                        <ForwardIcon
                                                            style={{
                                                                transform:
                                                                    'rotate(90deg)',
                                                            }}
                                                        />
                                                    </IconButton>
                                                </Box>
                                                <Box>
                                                    <IconButton
                                                        sx={{ p: '10px' }}
                                                        aria-label="comment"
                                                    >
                                                        <CommentIcon />
                                                    </IconButton>
                                                    {post.comment_count}{' '}
                                                    Comments
                                                </Box>
                                                <Box>
                                                    <IconButton
                                                        sx={{ p: '10px' }}
                                                        aria-label="favourite"
                                                    >
                                                        <BookmarkIcon />
                                                    </IconButton>
                                                    Favourite
                                                </Box>
                                                <MenuButton />
                                            </Stack>
                                        </Stack>
                                    </Item>
                                );
                            })}
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
                                onClose={() =>
                                    this.setIsCreateCommunityDialog(false)
                                }
                            />
                        </Stack>
                    </Item>
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
                                position: 'absolute',
                                bottom: '23px',
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        );
    }
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
}));

export default withParams(HomePageComponent);
