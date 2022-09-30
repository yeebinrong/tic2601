import React from 'react';
import { Tabs, Tab } from '@mui/material';
import RocketSharpIcon from '@mui/icons-material/RocketSharp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccessTimeFilledSharpIcon from '@mui/icons-material/AccessTimeFilledSharp';

const TabButton = () => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Tabs
            value={value ? value : 'best'}
            onChange={handleChange}
            aria-label="sort post"
        >
            <Tab
                icon={<RocketSharpIcon />}
                iconPosition="start"
                label="best"
                value="best"
            />
            <Tab
                icon={<LocalFireDepartmentIcon />}
                iconPosition="start"
                label="hot"
                value="hot"
            />
            <Tab
                icon={<AccessTimeFilledSharpIcon />}
                iconPosition="start"
                label="new"
                value="new"
            />
        </Tabs>
    );
};

export default TabButton;
