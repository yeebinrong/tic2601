import { Button, Input, TextField } from "@mui/material";
import React from "react";
import { sendMessage } from "../../apis/app-api";
import "./HomeComponent.scss";

class HomeComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            firstTextFieldValue: '',
            firstDisplayText: '',
            secondTextFieldValue: '',
            secondDisplayText: '',
        };
    }

    render() {
        return (
            <div className={'container'}>
                <span style={{ display: 'flex', flex: '1', marginBottom: '16px' }}>
                    Home Page
                </span>
                <span style={{ display: 'flex', flex: '1', marginBottom: '16px' }}>
                    <TextField
                        value={this.state.textFieldValue}
                        onChange={e => {
                            this.setState({
                                firstTextFieldValue: e.target.value,
                            })
                        }}
                        id="outlined-basic"
                        label="Input Text"
                        variant="outlined"
                    />
                    <Button onClick={() => {
                        this.setState(prevState => {
                            return {
                                ...prevState,
                                firstDisplayText: prevState.firstTextFieldValue,
                            };
                        });
                    }} style={{ margin: '8px' }} variant="outlined"> Set value on the right locally</Button>
                    <Input disabled value={this.state.firstDisplayText} />
                </span>
                <span style={{ display: 'flex', flex: '1', marginBottom: '16px' }}>
                    <TextField
                        value={this.state.secondTextFieldValue}
                        onChange={e => {
                            this.setState({
                                secondTextFieldValue: e.target.value,
                            })
                        }}
                        id="outlined-basic"
                        label="Input Text"
                        variant="outlined"
                    />
                    <Button onClick={() => {
                        sendMessage(this.state.secondTextFieldValue)
                            .then(resp => {
                                if (!resp.error) {
                                    console.log(resp);
                                    this.setState({
                                        secondDisplayText: resp.data.value,
                                    });
                                }
                            })
                    }} style={{ margin: '8px' }} variant="outlined"> Send a message to backend and wait for response</Button>
                    <Input style={{ width: '400px' }} disabled value={this.state.secondDisplayText} />
                </span>
            </div>
        )
    }
}

export default HomeComponent;