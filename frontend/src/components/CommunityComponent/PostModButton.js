import React from 'react';
import { Tabs, Tab } from '@mui/material';

const PostModButton = () => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Tabs
            value={value ? value : 'posts'}
            onChange={handleChange}
            aria-label="Mode Change"
        >
            <Tab
                label="Posts"
                value="posts"                
            />
            <Tab
                label="Mod Access"
                value="Mod"
            />
        </Tabs>
    );
};

export default PostModButton;