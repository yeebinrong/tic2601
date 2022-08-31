import { AppBar, Button, Toolbar } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';
import { SnackbarProvider } from 'notistack';

class BasePage extends React.Component {
    render() {
        return (
            <>
                {!this.props.isLogin &&
                <AppBar
                    className={'app-bar'}
                    position="static"
                    open
                    variant="dense"
                >
                    <Toolbar>
                        <img
                            draggable={false}
                            src="/static/readit_logo.png"
                            className={'app-bar-logo'}
                            alt="readit logo"
                        />
                        <Button color="inherit" style={{ marginLeft: 'auto' }}>
                            PLACEHOLDER
                        </Button>
                    </Toolbar>
                </AppBar>}
                <SnackbarProvider maxSnack={3} autoHideDuration={5000}>
                    {this.props.component}
                </SnackbarProvider>
            </>
        );
    }
}

BasePage.propTypes = {
    component: PropTypes.object,
    isLogin: PropTypes.bool,
};

export default BasePage;
