import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import {
    Paper,
    Divider,
    Stack,
    Box,
    IconButton,
    TextField,
    Tooltip,
} from '@mui/material';
import ForwardIcon from '@mui/icons-material/Forward';
import { timeSince } from '../../utils/time';
import './Post.scss';
import { createComment, modifyFavour, retrieveCommunityByName, retrievePostByIdAndCommunityName, updateComment, updateCommentFavour, updateFollow } from '../../apis/app-api';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import Grid from '@mui/material/Unstable_Grid2';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));


const UpVote = ({ comment, onFavourChange }) => {
    let callUpVoteAPI = () => {
        console.log(`upvote comment ${comment}`);
        updateCommentFavour(
            comment.community_name,
            comment.post_id,
            comment.comment_id,
            comment.is_favour === 1 ? 0 : 1
        ).then(resp => {
            console.log(resp);
            onFavourChange()
        })
    };
    return (
        <div>
            {comment &&
                <IconButton
                    sx={{ p: '10px' }}
                    aria-label="upfavour"
                    onClick={() => {
                        callUpVoteAPI()
                    }}
                >
                    {(comment.is_favour === 0 || comment.is_favour === -1) &&
                        <ForwardIcon className='upFavourStyle' />}
                    {comment.is_favour === 1 &&
                        <ForwardIcon className='upFavourColorStyle' />}
                </IconButton>
            }

        </div>
    );
};
const DownVote = ({ comment, onFavourChange }) => {
    let callDownVoteAPI = () => {
        console.log(`downvote comment ${comment}`);
        updateCommentFavour(
            comment.community_name,
            comment.post_id,
            comment.comment_id,
            comment.is_favour === -1 ? 0 : -1
        ).then(resp => {
            onFavourChange()
        })
    };
    return (
        <div>
            {comment &&
                <IconButton
                    sx={{ p: '10px' }}
                    aria-label="upfavour"
                >
                    {(comment.is_favour === 0 || comment.is_favour === 1) &&
                        <ForwardIcon className='downFavourStyle' onClick={() => { callDownVoteAPI() }} />}
                    {comment.is_favour === -1 &&
                        <ForwardIcon className='downFavourColorStyle' onClick={() => { callDownVoteAPI() }} />}
                </IconButton>
            }

        </div>
    );
};

const User = (props) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
                style={{ margin: '0 8px 0 0' }}
                sx={{ width: 32, height: 32 }}
                src={props.profile_picture ?
                    props.profile_picture :
                    `/static/user-avatar-default.png`}>
            </Avatar>
            <a style={{ margin: 'auto', color: 'inherit', textDecoration: 'none' }} href={`/user/${props.user}/profile/overview`}>
                <Button
                    style={{ textTransform: 'none' }}
                >
                    {props.user}
                </Button>
            </a>
        </Box>
    );
};
const CommentBox = (props) => {
    let [commentText, setCommentText] = useState('');
    let callCreateCommentApi = () => {
        if (!commentText) {
            return;
        }
        createComment(props.communityName, props.postId, commentText, props.replyTo)
            .then(r => {
                console.log(r);
                window.location.reload();
            });
        console.log(`new comment ${commentText} replyTo ${props.replyTo}`);

    };

    let callUpdateCommentApi = () => {
        if (!commentText) {
            return;
        }
        updateComment(props.communityName, props.postId, props.commentId, commentText)
            .then(r => {
                console.log(r);
                window.location.reload();
            });
        console.log(`updated comment ${props.commentId} content to ${commentText} `);

    };
    return (
        <div>
            {props.post &&
            <div style={{ margin: '12px 0 4px 0' }}>
                Commenting as <u>{props.userInfo?.username}</u>
            </div>}
            <TextField
                style={{ marginTop: '8px' }}
                fullWidth
                multiline
                rows='5'
                size="small"
                onChange={(e) => {
                    setCommentText(e.target.value);
                }}
                defaultValue={props.commentText || ''}
            />
            <br />
            {!props.commentId &&
                <Button
                    style={{ margin: '16px 0' }}
                    color='primary'
                    variant='contained'
                    size='small'
                    onClick={callCreateCommentApi}
                >
                    Comment
                </Button>}
            {props.commentId && <Button variant='outlined' size='small' onClick={callUpdateCommentApi}>Save</Button>}
        </div>
    );
};

const Comment = (props) => {

    const subComments = props.comment.reply_comments && props.comment.reply_comments.map((cmt) =>
        <li key={cmt.comment_id}>
            <Comment comment={cmt} parentComment={props.comment} reloadPostFunc={props.reloadPostFunc} />
        </li>,
    );
    const onFavourChange = () => {
        props.reloadPostFunc && props.reloadPostFunc()
    }
    let [showReplyBox, setShowReplyBox] = useState(false);
    let [showEditBox, setShowEditBox] = useState(false);
    return (

        <div>
            <div>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>

                    <User user={props.comment.commenter} profile_picture={props.comment?.profile_picture} />
                    <Tooltip title={moment(props.comment.datetime_created).format('DD-MM-YYYY hh:mmA')}>
                        <div className='comment-time'><i>{timeSince(props.comment.datetime_created)} ago</i></div>
                    </Tooltip>

                </Box>
            </div>

            <div style={{ margin: '12px 0 0 12px' }}>{props.comment.content}</div>
            <Stack direction="row" spacing={1}>
                <UpVote type={'comment'} comment={props.comment} onFavourChange={onFavourChange}></UpVote>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>
                        {props.comment.fav_point}
                    </Typography>
                </Box>
                <DownVote type={'comment'} comment={props.comment} onFavourChange={onFavourChange}></DownVote>
            </Stack>
            <Button size='small' onClick={() => {
                setShowReplyBox(!showReplyBox);
                setShowEditBox(false);
            }}>Reply</Button>
            {props.comment.is_commenter && < Button size='small' onClick={() => {
                setShowEditBox(!showEditBox);
                setShowReplyBox(false);
            }}>Edit</Button>}

            {showReplyBox && <CommentBox userInfo={props.userInfo} communityName={props.comment.community_name} postId={props.comment.post_id} replyTo={props.comment.comment_id}></CommentBox>}
            {showEditBox &&
                <CommentBox
                    userInfo={props.userInfo}
                    communityName={props.comment.community_name}
                    postId={props.comment.post_id}
                    commentId={props.comment.comment_id}
                    commentText={props.comment.content}
                />}
            <ul>
                {subComments}
            </ul>
        </div>
    );
};
const Community = ({ community, reloadPostFunc }) => {

    const joined = community.joined
    const changeFollow = () => {
        updateFollow({
            communityName: community.community_name,
            isFollowing: joined ? "1" : "0"
        }).then(res => {
            reloadPostFunc()
        })
    }
    const followStatus = joined ? 'Following' : 'Follow'

    return (
        <div>

            <div style={{ backgroundColor: community.colour, height: '35px', borderRadius: '5px', paddingTop: '10px', textIndent: '16px' }}>

                <b className={'sideBoxHeader'}>About Community</b>
            </div>
            <Item>
                <div style={{ textAlign: 'left', padding: 10 }}>
                    <b>Welcome to r/{community.community_name}</b>
                    <p>{community.description}</p>
                    <Divider style={{ margin: '16px 0' }}></Divider>
                    <b>Creation Date: {moment(community.datetime_created).format('DD-MM-YYYY hh:mmA')}</b>
                    <Divider style={{ margin: '16px 0' }}></Divider>
                    <Button
                        style={{ borderRadius: '14px' }}
                        variant="contained"
                        onClick={changeFollow}
                        color={joined === true ? "primary" : "secondary"}>
                        {followStatus}
                    </Button>
                </div>
            </Item>

        </div>
    );
};

const Post = (props) => {
    const [post, setPost] = useState(null);
    const [community, setCommunity] = useState(null);
    const { community_name, postId } = useParams();

    const reloadPostFunc = () => {
        if (props.isVerifyDone) {
            retrievePostByIdAndCommunityName(postId, community_name).then((resp) => {
                setPost(resp.data);
                retrieveCommunityByName(resp.data.community_name).then((resp) => {
                    setCommunity({
                        ...resp.data,
                    });
                });
                return resp.data;
            });
        }
    }

    useEffect(() => {
        reloadPostFunc()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isVerifyDone]);


    let commentComponents = null;
    if (post && post.comments) {
        commentComponents = post.comments.map((cmt) => {
            return <Comment key={cmt.comment_id} comment={cmt} reloadPostFunc={reloadPostFunc} />;
        });
    }

    const onFavourChange = (value) => {
        modifyFavour({
            postId: post.post_id,
            favour: post.is_favour ? post.is_favour : 0,
            value: value,
            receiver: post.user_name,
            communityName: post.community_name,
        }).then(res => {
            reloadPostFunc()
        })
    }

    return (
        <Grid container spacing={6} style={{ margin: '16px 280px' }}>
            {post &&
            <Grid xs={8}>
                <Box sx={{ width: '100%' }}>
                    <Stack spacing={2} style={{ display: 'flex' }}>
                        <Item style={{ textAlign: 'left', padding: '32px 64px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
                                <Avatar
                                    sx={{ width: 64, height: 64 }}
                                    src={post.post_profile_picture ? post.post_profile_picture : `/static/user-avatar-default.png`}>
                                </Avatar>
                                <div style={{ margin: '0 16px 0 8px' }}>
                                    <a  href={`/community/${post.community_name}/posts/best`}
                                        style={{
                                            margin: 'auto',
                                            color: 'inherit',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <Button
                                            style={{ textTransform: 'none' }}
                                        >
                                            r/{post.community_name}
                                        </Button>
                                    </a>
                                </div>
                                <Avatar
                                    sx={{ width: 32, height: 32 }}
                                    src={post.post_profile_picture ? post.post_profile_picture : `/static/user-avatar-default.png`}>
                                </Avatar>
                                <div style={{ marginLeft: '8px' }}>
                                    {/* <Tooltip title={moment(post.datetime_created).format('DD-MM-YYYY hh:mmA')}> */}
                                        <a style={{ margin: 'auto', color: 'inherit', textDecoration: 'none' }} href={`/user/${post.user_name}/profile/overview`}>
                                            <Button
                                                style={{ textTransform: 'none' }}
                                            >
                                                Posted by {post.user_name} - {timeSince(post.datetime_created)}
                                            </Button>
                                        </a>
                                    {/* </Tooltip> */}
                                </div>
                            </Box>
                            <h2>{post.title}</h2>
                            <Divider style={{ margin: '8px 0' }} />
                            {post.url && !post.url.includes('digitaloceanspaces') &&
                                <div>
                                    <iframe
                                        width="560"
                                        height="315"
                                        src={post.url}
                                        title={`embedUrl`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>}
                            {post.url && post.url.includes('digitaloceanspaces') &&
                                <div>
                                    <img
                                        alt={''}
                                        width="560"
                                        height="315"
                                        src={post.url}
                                        title={`embedUrl`}
                                        frameBorder="0"
                                    />
                                </div>}
                            {!post.url &&
                            <div style={{ margin: '32px 0' }}>
                                {post.content}
                            </div>}
                            <Divider style={{ margin: '8px 0' }} />
                            <div id={'post-statusline'}>
                                <Stack direction="row" spacing={1}>
                                    <Box>
                                        <IconButton
                                            sx={{ p: '10px' }}
                                            aria-label="upfavour"
                                        >
                                            {(post.is_favour === 0 || post.is_favour === -1) &&
                                                <ForwardIcon className='upFavourStyle' onClick={() => onFavourChange(1)} />}
                                            {post.is_favour === 1 &&
                                                <ForwardIcon className='upFavourColorStyle' onClick={() => onFavourChange(0)} />}
                                        </IconButton>
                                        {post.fav_point
                                            ? post.fav_point
                                            : 0}
                                        <IconButton
                                            sx={{ p: '10px' }}
                                            aria-label="downfavour"
                                        >
                                            {(post.is_favour === 0 || post.is_favour === 1) &&
                                                <ForwardIcon className='downFavourStyle' onClick={() => onFavourChange(-1)} />}
                                            {post.is_favour === -1 &&
                                                <ForwardIcon className='downFavourColorStyle' onClick={() => onFavourChange(0)} />}
                                        </IconButton>
                                    </Box>
                                </Stack>
                                <Button style={{ color: 'black' }} disabled>{post['comment_count']} comments</Button>
                                <Button></Button>
                            </div>
                            <Divider style={{ margin: '8px 0' }} />
                            <div>
                                <CommentBox userInfo={props.userInfo} communityName={post.community_name} post={post} postId={post.post_id}></CommentBox>
                            </div>
                            <Divider style={{ margin: '8px 0 24px 0' }} />
                            <div>
                                {commentComponents}
                            </div>
                        </Item>
                    </Stack>
                </Box>
            </Grid>}
            {post &&
            <Grid xs style={{ position: 'relative' }}>
                {community && <Community community={community} reloadPostFunc={reloadPostFunc} ></Community>}
            </Grid>}
        </Grid>
    );
};


export default Post;