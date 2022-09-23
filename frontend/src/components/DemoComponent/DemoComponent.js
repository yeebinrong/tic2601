import { Button, Input, TextField } from '@mui/material';
import React from 'react';
import { retrieveAllPosts, sendMessageApi } from '../../apis/app-api';
import './DemoComponent.scss';
import { MainActions } from '../../state/actions';
import { actions as MainSagaActions } from '../../state/sagas/main.saga';
import { MainSelectors } from '../../state/selectors';
import { connect } from 'react-redux';

class HomeComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            firstTextFieldValue: '',
            firstDisplayText: '',
            secondTextFieldValue: '',
            secondDisplayText: '',
            thirdTextFieldValue: '',
            posts: [],
        };
        if (props.isVerifyDone) {
            this.props.setIsLoading(true);
            retrieveAllPosts().then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.rows,
                });
            });
        }
    }

    shouldComponentUpdate (nextProps) {
        if (nextProps.isVerifyDone && !this.props.isVerifyDone) {
            this.props.setIsLoading(true);
            retrieveAllPosts().then(res => {
                this.props.setIsLoading(false);
                this.setState({
                    posts: res.data.rows,
                });
            });
        }
        return true;
    }

    render() {
        return (
            <div className={'container'}>
                <span
                    style={{ display: 'flex', flex: '1', marginBottom: '16px' }}
                >
                    Home Page
                </span>
                <span
                    style={{ display: 'flex', flex: '1', marginBottom: '16px' }}
                >
                    <TextField
                        value={this.state.textFieldValue}
                        onChange={(e) => {
                            this.setState({
                                firstTextFieldValue: e.target.value,
                            });
                        }}
                        label="First Textbox"
                        variant="outlined"
                    />
                    <Button
                        onClick={() => {
                            this.setState((prevState) => {
                                return {
                                    ...prevState,
                                    firstDisplayText:
                                        prevState.firstTextFieldValue,
                                };
                            });
                        }}
                        style={{ margin: '8px' }}
                        variant="outlined"
                    >
                        {' '}
                        Set value on the right locally
                    </Button>
                    <Input disabled value={this.state.firstDisplayText} />
                </span>
                <span
                    style={{ display: 'flex', flex: '1', marginBottom: '16px' }}
                >
                    <TextField
                        value={this.state.secondTextFieldValue}
                        onChange={(e) => {
                            this.setState({
                                secondTextFieldValue: e.target.value,
                            });
                        }}
                        label="Second Textbox"
                        variant="outlined"
                    />
                    <Button
                        onClick={() => {
                            sendMessageApi(
                                this.state.secondTextFieldValue,
                            ).then((resp) => {
                                if (!resp.error) {
                                    this.setState({
                                        secondDisplayText: resp.data.value,
                                    });
                                }
                            });
                        }}
                        style={{ margin: '8px' }}
                        variant="outlined"
                    >
                        {' '}
                        Send a message to backend and wait for response
                    </Button>
                    <Input
                        style={{ width: '400px' }}
                        disabled
                        value={this.state.secondDisplayText}
                    />
                </span>
                <span
                    style={{ display: 'flex', flex: '1', marginBottom: '16px' }}
                >
                    <TextField
                        value={this.state.thirdTextFieldValue}
                        onChange={(e) => {
                            this.setState({
                                thirdTextFieldValue: e.target.value,
                            });
                        }}
                        label="Third Textbox"
                        variant="outlined"
                    />
                    <Button
                        onClick={() => {
                            // store value into redux store
                            this.props.setValue(this.state.thirdTextFieldValue);
                        }}
                        style={{ margin: '8px' }}
                        variant="outlined"
                    >
                        {' '}
                        {/* Values stored in redux store persist even if you navigate to other page, it will disappear if you refresh */}
                        {/* Values stored in redux store can be read in different pages */}
                        Store value into redux store (something like cache)
                    </Button>
                    <Input
                        style={{ width: '400px' }}
                        disabled
                        // retrieve value from redux store
                        value={this.props.value}
                    />
                </span>
                <span
                    style={{ display: 'flex', flex: '1', marginBottom: '16px' }}
                >
                    <Button
                        onClick={() => {
                            this.props.getValueFromBackend();
                        }}
                        style={{ margin: '8px' }}
                        variant="outlined"
                    >
                        {' '}
                        {/* Values stored in redux store persist even if you navigate to other page, it will disappear if you refresh */}
                        {/* Values stored in redux store can be read in different pages */}
                        Retrieve random number from backend using saga and store
                        in redux
                    </Button>
                    <Input
                        style={{ width: '400px' }}
                        disabled
                        // retrieve value from redux store
                        value={this.props.valueFromBackend}
                    />
                </span>
                <div>
                    {this.state.posts.map(post => {
                        return (
                            <div>
                                <span>{post.title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isVerifyDone: MainSelectors.getIsVerifyDone(state),
    isLoading: MainSelectors.getIsLoading(state),
    value: MainSelectors.getValue(state),
    valueFromBackend: MainSelectors.getValueFromBackend(state),
});

const mapDispatchToProps = {
    setIsLoading: MainActions.setIsLoading,
    setValue: MainActions.setValue,
    getValueFromBackend: MainSagaActions.getBackEndValue,
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeComponent);
