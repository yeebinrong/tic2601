import React from 'react';
import { Tabs, Tab } from '@mui/material';

const PostModButton = (props) => {
    const isModAdmin = props.isModAdmin != null ? true : false;
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
                style={{ color: props.value === 'posts' && props.indicatorColor ? props.indicatorColor : 'rgba(0, 0, 0, 0.54)' }}
            />
            {isModAdmin &&
            <Tab
                label="Mod Access"
                value="mod"
                style={{ color: props.value === 'mod' && props.indicatorColor ? props.indicatorColor : 'rgba(0, 0, 0, 0.54)' }}
            />}
        </Tabs>
    );
};

export default PostModButton;