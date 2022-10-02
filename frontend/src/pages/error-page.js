import { Button } from '@mui/material';
import React from 'react';
import { Item } from '../components/HomePageComponent/HomePageComponent';
import BasePage from './base-page';
import Grid from '@mui/material/Unstable_Grid2';

class ErrorPage extends React.Component {
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                component={(props) => {
                    return (
                        <div style={{ fontSize: '30px', margin: '32px 184px 0px 184px' }}>
                            <Grid xs style={{ position: 'relative' }}>
                                <Item style={{ padding: '16px' }}>
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
                                </Item>
                            </Grid>
                        </div>

                    );
                }}
            />
        );
    }
}

export default ErrorPage;
