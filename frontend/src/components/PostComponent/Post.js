import React, { useState, useEffect } from 'react';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import { timeSince } from '../../utils/time';
import './Post.scss';
import { retrieveCommunityByName, retrievePostById } from '../../apis/app-api';
import { useParams } from 'react-router-dom';

const User = (props) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar className='user-avatar'>{props.user[0].toUpperCase()}</Avatar>
            <div>{props.user}</div>
        </Box>
    );
};

const Comment = (props) => {

    const subComments = props.comment.reply_comments && props.comment.reply_comments.map((cmt) =>
        <li key={cmt.comment_id}>
            <Comment comment={cmt} />
        </li>,
    );
    return (

        <div>
            <div>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>

                    <User user={props.comment.commenter} />
                    <div className='comment-time'><i>- {timeSince(props.comment.datetime_created)} ago</i></div>

                </Box>
            </div>

            <div>{props.comment.content}</div>
            <Button size='small'>Upvote</Button>
            <Button size='small'>Downvote</Button>
            <Button size='small'>Reply</Button>
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
                     gutterBottom>Created {props.community.datetime_created.toLocaleString()}</div>
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
    }, []);


    let commentComponents = null;
    if (post) {
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
                        <div>

                            <Button disabled>{post.comments.length} comments</Button>
                            <IconButton color='primary' component='label' id='iconbutton'>
                                <div id='upvote'>⬆</div>
                            </IconButton>
                            <IconButton color='primary' component='label' id='iconbutton'>
                                <div id='downvote'>⬇</div>
                            </IconButton>
                            <IconButton component='label' size='large' id='iconbutton'>
                                <MoveToInboxOutlinedIcon id='Archive'></MoveToInboxOutlinedIcon></IconButton>
                            <Button></Button>

                        </div>
                    </div>

                    <hr />
                    <div>
                        <div>Comment as <u>{post.user_name}</u></div>
                        <TextareaAutosize
                            maxRows={4}
                            aria-label='maximum height'
                            placeholder='Maximum 4 rows'
                            defaultValue='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                        ut labore et dolore magna aliqua.'
                            style={{ width: '100%', height: 200 }}
                        />
                        <br />
                        <Button variant='outlined' size='small'>Comment</Button>
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