import { Button, FormControl, FormGroup, FormHelperText, Input, InputLabel, TextField, Typography } from "@mui/material";
import React from "react";
import { sendMessageApi } from "../../apis/app-api";
import "./LoginComponent.scss";
import { MainActions } from "../../state/actions";
import { actions as MainSagaActions } from "../../state/sagas/main.saga";
import { MainSelectors } from "../../state/selectors";
import { connect } from "react-redux";

class LoginComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      firstTextFieldValue: "",
    };
  }

  handleSubmit = () => {

  };

  render() {
    return (
      <div className={"login-container"}>
        <img src="/static/readit_logo.png" className={'main-logo'} alt="readit logo" />
        <div className={"login-panel"}>
          <Typography className={'login-panel-main-title'}>
            Login with Readit
          </Typography>
          <form onSubmit={this.handleSubmit} className={'full-width-class'}>
            <FormControl className={'full-width-class'}>
              <TextField
                className={'login-panel-text-field'}
                size="small"
                // error
                label="Username"
                // helperText="Enter your username."
              />
              <TextField
                // error
                size="small"
                className={'login-panel-text-field'}
                label="Password"
                // helperText="Enter your username."
              />
              <div>
                <Button
                  disableRipple
                  style={{ backgroundColor: 'transparent' }}
                >
                  Need an account?
                </Button>
                <Button
                  type="submit"
                  className={"login-panel-main-button"}
                  variant="contained"
                >
                  Login
                </Button>
              </div>
            </FormControl>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  value: MainSelectors.getValue(state),
  valueFromBackend: MainSelectors.getValueFromBackend(state),
});

const mapDispatchToProps = {
  setValue: MainActions.setValue,
  getValueFromBackend: MainSagaActions.getBackEndValue,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginComponent);
