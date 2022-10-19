import React from 'react';
import { Tabs, Tab } from '@mui/material';

const PostModButton = (props) => {
    //const [value, setValue] = React.useState('posts');
    //console.log(props.params.community_name);
    // const handleChange = (event, newValue) => {
    //     setValue(newValue);
    //     if(newValue === "posts"){
    //         props.navigate({
    //             pathname: `/community/${props.params.community_name}/${newValue}/best`,
    //             replace: true,
    //         });
    //     }
    //     else{
    //         props.navigate({
    //             pathname: `/community/${props.params.community_name}/${newValue}`,
    //             replace: true,
    //         });
    //     }
    // };


    return (
        <Tabs
            value={props.value}
            onChange={props.handleChange}
            aria-label="Mode Change"
        >
            <Tab
                label="Posts"
                value="posts"              
            />
            <Tab
                label="Mod Access"
                value="mod"
            />
        </Tabs>
    );
};

export default PostModButton;