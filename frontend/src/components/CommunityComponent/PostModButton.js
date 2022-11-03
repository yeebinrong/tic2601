import React from 'react';
import { Tabs, Tab } from '@mui/material';

const PostModButton = (props) => {
    return (
        <Tabs
            value={props.value}
            onChange={props.handleChange}
            aria-label="Mode Change"
            TabIndicatorProps={{
                style: {
                    backgroundColor: props.indicatorColor ? props.indicatorColor : 'rgb(0, 178, 210)'
                }
            }}
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