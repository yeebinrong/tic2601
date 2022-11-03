import React from 'react';
import { Tabs, Tab } from '@mui/material';
import RocketSharpIcon from '@mui/icons-material/RocketSharp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccessTimeFilledSharpIcon from '@mui/icons-material/AccessTimeFilledSharp';

const TabButton = (props) => {
    return (
        <Tabs
            aria-label="sort post"
            defaultValue="best"
            value={props.value}
            onChange={props.handleChange}
            TabIndicatorProps={{
                style: {
                    backgroundColor: props.indicatorColor ? props.indicatorColor : 'rgb(0, 178, 210)'
                }
            }}
        >
            <Tab
                icon={<RocketSharpIcon />}
                iconPosition="start"
                label="best"
                value="best"
                style={{ color: props.value === 'best' && props.indicatorColor ? props.indicatorColor : 'rgba(0, 0, 0, 0.54)' }}
            />
            <Tab
                icon={<LocalFireDepartmentIcon />}
                iconPosition="start"
                label="hot"
                value="hot"
                style={{ color: props.value === 'hot' && props.indicatorColor ? props.indicatorColor : 'rgba(0, 0, 0, 0.54)' }}
            />
            <Tab
                icon={<AccessTimeFilledSharpIcon />}
                iconPosition="start"
                label="new"
                value="new"
                style={{ color: props.value === 'new' && props.indicatorColor ? props.indicatorColor : 'rgba(0, 0, 0, 0.54)' }}
            />
        </Tabs>
    );
};

export default TabButton;
