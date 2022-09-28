import { Button } from '@mui/material';
import React from 'react';
import BasePage from './base-page';

class ErrorPage extends React.Component {
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                component={(props) => {
                    return (
                        <div className={'app-error-container'}>
                            <img
                                draggable={false}
                                src="/static/404_1.png"
                                className={'app-error'}
                                alt="error 404"
                            />
                            <Button
                                className={'app-error-button'}
                                onClick={() => {
                                    this.props.navigate('/home');
                                }}
                                variant="outlined"
                            >
                                Go Home Page
                            </Button>
                        </div>
                    );
                }}
            />
        );
    }
}

export default ErrorPage;
