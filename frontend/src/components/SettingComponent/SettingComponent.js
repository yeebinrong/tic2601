import { Button, Input, TextField } from "@mui/material";
import React from "react";
import { connect } from "react-redux";
import { MainActions } from "../../state/actions";
import { MainSelectors } from "../../state/selectors";

class SettingComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
    };
  }

  render() {
    return (
      <div className={"container"}>
        <span style={{ display: "flex", flex: "1", marginBottom: "16px" }}>
          Values stored in redux store can be read in different pages, the value
          in home page and this page is the same
        </span>
        <span style={{ display: "flex", flex: "1", marginBottom: "16px" }}>
          <TextField
            value={this.state.value}
            onChange={(e) => {
              this.setState({
                value: e.target.value,
              });
            }}
            label="Third Textbox"
            variant="outlined"
          />
          <Button
            onClick={() => {
              // store value into redux store
              this.props.setValue(this.state.value);
            }}
            style={{ margin: "8px" }}
            variant="outlined"
          >
            {" "}
            {/* Values stored in redux store persist even if you navigate to other page, it will disappear if you refresh */}
            {/* Values stored in redux store can be read in different pages */}
            Store value into redux store (something like cache)
          </Button>
          <Input
            style={{ width: "400px" }}
            disabled
            // retrieve value from redux store
            value={this.props.value}
          />
        </span>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  value: MainSelectors.getValue(state),
});

const mapDispatchToProps = {
  setValue: MainActions.setValue,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingComponent);
