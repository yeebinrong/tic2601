import React, { useState, useEffect } from 'react';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import {
    Paper,
    Divider,
    Stack,
    Box,
    IconButton,
} from '@mui/material';
import ForwardIcon from '@mui/icons-material/Forward';
import { timeSince } from '../../utils/time';
import './Post.scss';
import { createComment, modifyFavour, retrieveCommunityByName, retrievePostByIdAndCommunityName, updateComment, updateCommentFavour, updateFollow } from '../../apis/app-api';
import { useParams } from 'react-router-dom';
import moment from 'moment';

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
                >
                    {(comment.is_favour === 0 || comment.is_favour === -1) &&
                        <ForwardIcon className='upFavourStyle' onClick={() => { callUpVoteAPI() }} />}
                    {comment.is_favour === 1 &&
                        <ForwardIcon className='upFavourColorStyle' onClick={() => { callUpVoteAPI() }} />}
                </IconButton>
                // <ArrowUpwardIcon onClick={callUpVoteAPI} />
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
            <Avatar className='user-avatar'>{props.user[0].toUpperCase()}</Avatar>
            <div>{props.user}</div>
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
            {props.post && <div>Comment as <u>{props.userInfo?.username}</u></div>}
            <TextareaAutosize
                maxRows={4}
                aria-label='maximum height'
                placeholder='Add your comment here'
                defaultValue={props.commentText || ''}
                style={{ width: '100%', height: 70 }}
                onChange={(e) => {
                    setCommentText(e.target.value);
                }}
            />
            <br />
            {!props.commentId &&
                <Button variant='outlined' size='small' onClick={callCreateCommentApi}>Comment</Button>}
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

                    <User user={props.comment.commenter} />
                    <div className='comment-time'><i>- {timeSince(props.comment.datetime_created)} ago</i></div>

                </Box>
            </div>

            <div>{props.comment.content}</div>
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        reloadPostFunc()
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
        <Container maxWidth='lg'>
            {post && <Box display='grid' gridTemplateColumns='repeat(12, 1fr)' gap={2}>
                <Box gridColumn='span 8' className='post-container'>
                    <div>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                                sx={{ width: 40, height: 40 }}
                            >H</Avatar>
                            <Typography variant='caption' display='block' gutterBottom id='communityName'>
                                <b>{post.community_name}</b>
                            </Typography>
                            <Typography variant='caption' display='block' gutterBottom>
                                <div> + Posted
                                    by {post.user_name} {timeSince(post.datetime_created)}</div>
                            </Typography>
                        </Box>
                        <h2>{post.title}</h2>
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
                            <div>{post.content}</div>}
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

                            <Button disabled>{post['comment_count']} comments</Button>
                            <Button></Button>

                        </div>
                    </div>

                    <hr />
                    <div>
                        <CommentBox userInfo={props.userInfo} communityName={post.community_name} post={post} postId={post.post_id}></CommentBox>
                    </div>

                    <hr />
                    <br></br>
                    <div>
                        {commentComponents}
                    </div>
                </Box>
                <Box gridColumn='span 4'>
                    {community && <Community community={community} reloadPostFunc={reloadPostFunc} ></Community>}


                </Box>
            </Box>
            }
        </Container>
    );
};


export default Post;