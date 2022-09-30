import React, { useState, useEffect } from 'react';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import { timeSince } from '../../utils/time';
import './Post.scss';
import { retrieveCommunityByName, retrievePostById } from '../../apis/app-api';
import { useParams } from 'react-router-dom';


const UpVote = (props) => {
    let callUpVoteAPI = () => {
        if (props.type == 'post') {
            console.log(`upvote post ${props.postId}`);
        } else {
            console.log(`upvote comment ${props.commentId}`);
        }
    };
    return (
        <ArrowUpwardIcon onClick={callUpVoteAPI} />
    );
};
const DownVote = (props) => {
    let callDownVoteAPI = () => {
        if (props.type == 'post') {
            console.log(`downvote post ${props.postId}`);
        } else {
            console.log(`downvote comment ${props.commentId}`);
        }
    };
    return (
        <ArrowDownwardIcon onClick={callDownVoteAPI} />
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

    let callCommentApi = () => {
        if (!commentText) {
            return;
        }
        console.log(`new comment ${commentText} replyTo ${props.replyTo}`);

    };
    return (
        <div>
            {props.post && <div>Comment as <u>{props.post.user_name}</u></div>}
            <TextareaAutosize
                maxRows={4}
                aria-label='maximum height'
                placeholder='Add your comment here'
                defaultValue={commentText}
                style={{ width: '100%', height: 70 }}
                onChange={(e) => {
                    setCommentText(e.target.value);
                }}
            />
            <br />
            <Button variant='outlined' size='small' onClick={callCommentApi}>Comment</Button>
        </div>
    );
};

const Comment = (props) => {

    const subComments = props.comment.reply_comments && props.comment.reply_comments.map((cmt) =>
        <li key={cmt.comment_id}>
            <Comment comment={cmt} parentComment={props.comment} />
        </li>,
    );
    let [showReplyBox, setShowReplyBox] = useState(false);
    let parentCommentId = props.parentComment?.comment_id || '';
    return (

        <div>
            <div>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>

                    <User user={props.comment.commenter} />
                    <div className='comment-time'><i>- {timeSince(props.comment.datetime_created)} ago</i></div>

                </Box>
            </div>

            <div>{props.comment.content}</div>
            <UpVote type={'comment'} commentId={props.comment.comment_id}></UpVote>
            <DownVote type={'comment'} commentId={props.comment.comment_id}></DownVote>
            <Button size='small' onClick={() => {
                setShowReplyBox(!showReplyBox);
            }}>Reply</Button>
            {showReplyBox && <CommentBox replyTo={parentCommentId}></CommentBox>}

            <ul>
                {subComments}
            </ul>
        </div>
    );
};
const Community = (props) => {

    return (
        <div>
            <div className='community-header'></div>
            <div className='community-box'>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar>H</Avatar>
                    <div variant='caption' display='block' gutterBottom id='communityName'>
                        <b>{props.community.name}</b></div>
                </Box>
                <div variant='caption' display='block' gutterBottom
                    id='communityDescruption'>{props.community.description}</div>
                <br></br>
                <div>
                    <div variant='caption' display='block' gutterBottom id='communityMember'>
                        <b>{props.community.member_count}</b></div>
                    <div> Members</div>
                </div>
                <hr></hr>
                <div variant='caption' display='block'
                    gutterBottom>Created {props.community.datetime_created?.toLocaleString()}</div>
                <br></br>
                <Button variant='outlined'
                    className='join-button'>{props.community.joined ? 'Joined' : 'Join'}</Button>
            </div>
        </div>
    );
};

const Post = (props) => {
    const [post, setPost] = useState();
    const [community, setCommunity] = useState();
    let { postId } = useParams();

    useEffect(() => {
        console.log(postId);
        if (postId && postId !== undefined) {
            retrievePostById(postId).then((resp) => {
                setPost(resp.data);
                console.log(resp.data);

                retrieveCommunityByName(resp.data.community_name).then((resp) => {
                    setCommunity({
                        ...resp.data,
                        joined: true,
                    });
                });
                return resp.data;
            });
        }
    }, []);


    let commentComponents = null;
    if (post && post.comments) {
        commentComponents = post.comments.map((cmt) => {
            return <Comment key={cmt.comment_id} comment={cmt} />;
        });
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
                                    by {post.user_name} {timeSince(post.date_created)}</div>
                            </Typography>
                        </Box>
                        <h2>{post.title}</h2>
                        <div>{post.content}</div>
                        <div id={'post-statusline'}>
                            <Button disabled>{post.comments?.length} comments</Button>
                            <UpVote type={'post'} postId={post.post_id}></UpVote>
                            <DownVote type={'post'} postId={post.post_id}></DownVote>
                            {/*<IconButton color='primary' component='label' id='iconbutton'>*/}
                            {/*    <div id='upvote'>⬆</div>*/}
                            {/*</IconButton>*/}
                            {/*<IconButton color='primary' component='label' id='iconbutton'>*/}
                            {/*    <div id='downvote'>⬇</div>*/}
                            {/*</IconButton>*/}
                            <IconButton component='label' size='large' id='iconbutton'>
                                <MoveToInboxOutlinedIcon id='Archive'></MoveToInboxOutlinedIcon></IconButton>
                            <Button></Button>

                        </div>
                    </div>

                    <hr />
                    <div>
                        <CommentBox post={post}></CommentBox>
                    </div>

                    <hr />
                    <br></br>
                    <div>
                        {commentComponents}
                    </div>
                </Box>
                <Box gridColumn='span 4'>
                    {community && <Community community={community}></Community>}

                </Box>
            </Box>
            }
        </Container>
    );
};


export default Post;