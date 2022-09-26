import React from 'react';
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


const User = (props) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar className='user-avatar' src={props.user.avatar}></Avatar>
            <div>{props.user.username}</div>
        </Box>
    );
};

const Comment = (props) => {

    const subComments = props.comment.subComments && props.comment.subComments.map((cmt) =>
        <li key={cmt.id}>
            <Comment comment={cmt} />
        </li>,
    );
    return (

        <div>
            <div>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>

                    <User user={props.comment.user} />
                    <div className='comment-time'><i>- {timeSince(props.comment.created_at)} ago</i></div>

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

class Post extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            community: {
                name: 'Dog',
                member: 100,
                description: 'Welcome to the community',
                created_at: new Date(),
                joined: true,
            },
            post: {
                created_at: Date.parse('04 Sep 2022 00:12:00 GMT'),
                title: 'First Post',
                content: 'This is post',
            },
            user: {
                username: 'amber',
                avatar: '/user-avatar-default.png',
            },
            comments: [
                {
                    id: 'cmt1',
                    user: {
                        username: 'abc',
                        avatar: '/user-avatar-default.png',
                    },
                    created_at: Date.parse('04 Sep 2022 00:12:00 GMT'),
                    content: 'First comment!',
                    subComments: [
                        {
                            id: 'cmt3',
                            user: {
                                username: 'def',
                                avatar: '/user-avatar-default.png',
                            },
                            created_at: new Date(),
                            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                        },
                    ],
                },
                {
                    id: 'cmt2',
                    user: {
                        username: 'ghi',
                        avatar: '/user-avatar-default.png',
                    },
                    created_at: Date.parse('14 Sep 2022 00:12:00 GMT'),
                    content: 'Second comment!',
                },
                {
                    id: 'cmt3',
                    user: {
                        username: 'ghi',
                        avatar: '/user-avatar-default.png',
                    },
                    created_at: Date.parse('18 Sep 2022 00:12:00 GMT'),
                    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                },
            ],

        };
    }

    render() {
        const comments = this.state.comments.map((cmt) => {
            return <Comment key={cmt.id} comment={cmt} />;
        });

        return (

            <Container maxWidth='lg'>
                <Box display='grid' gridTemplateColumns='repeat(12, 1fr)' gap={2}>
                    <Box gridColumn='span 8' className='post-container'>
                        <div>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    sx={{ width: 40, height: 40 }}
                                >H</Avatar>
                                <Typography variant='caption' display='block' gutterBottom id='communityName'>
                                    <b>{this.state.community.name}</b>
                                </Typography>
                                <Typography variant='caption' display='block' gutterBottom>
                                    <div> + Posted
                                        by {this.state.user.username} {timeSince(this.state.post.created_at)}</div>
                                </Typography>
                            </Box>
                            <h2>{this.state.post.title}</h2>
                            <div>{this.state.post.content}</div>
                            <div>

                                <Button disabled>{this.state.comments.length} comments</Button>
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
                            <div>Comment as <u>{this.state.user.username}</u></div>
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
                            {comments}
                        </div>
                    </Box>
                    <Box gridColumn='span 4'>

                        <div className='community-header'></div>
                        <div className='community-box'>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar>H</Avatar>
                                <div variant='caption' display='block' gutterBottom id='communityName'>
                                    <b>{this.state.community.name}</b></div>
                            </Box>
                            <div variant='caption' display='block' gutterBottom
                                 id='communityDescruption'>{this.state.community.description}</div>
                            <br></br>
                            <div>
                                <div variant='caption' display='block' gutterBottom id='communityMember'>
                                    <b>{this.state.community.member}</b></div>
                                <div> Members</div>
                            </div>
                            <hr></hr>
                            <div variant='caption' display='block'
                                 gutterBottom>Created {this.state.community.created_at.toDateString()}</div>
                            <br></br>
                            <Button variant='outlined'
                                    className='join-button'>{this.state.community.joined ? 'Joined' : 'Not Joined'}</Button>
                        </div>
                    </Box>
                </Box>
            </Container>
        );
    }
}


export default Post;