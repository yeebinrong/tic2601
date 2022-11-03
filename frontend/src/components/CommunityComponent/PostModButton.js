import React from 'react';
import { Tabs, Tab } from '@mui/material';

const PostModButton = (props) => {
    const isModAdmin = props.isModAdmin != null ? true : false;
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
            {isModAdmin && <Tab
                label="Mod Access"
                value="mod"
            />}
        </Tabs> 
    );
};

export default PostModButton;