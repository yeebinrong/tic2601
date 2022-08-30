import { AppBar, Button, Toolbar } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

class BasePage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <AppBar
                    className={'app-bar'}
                    position="static"
                    open
                    variant="dense"
                >
                    <Toolbar>
                        <img
                            src="/static/readit_logo.png"
                            className={'app-bar-logo'}
                            alt="readit logo"
                        />
                        <Button color="inherit" style={{ marginLeft: 'auto' }}>
                            PLACEHOLDER
                        </Button>
                    </Toolbar>
                </AppBar>
                {this.props.component}
            </>
        );
    }
}

BasePage.propTypes = {
    component: PropTypes.object,
};

export default BasePage;
