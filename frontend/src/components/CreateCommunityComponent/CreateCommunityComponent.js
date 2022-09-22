import { Button, IconButton, Modal, TextField } from '@mui/material';
import React from 'react';
import CancelIcon from '@mui/icons-material/Cancel';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: 'white',
  padding: '10px',
};

class CreateCommunityComponent extends React.Component {
    
  constructor(props) {
    super(props);

    this.state = {
        communityName:'',
    };
  }

    render() {
        return (
            <div> select<Button>Open modal</Button>
            <Modal
              open 
            >
              <div style={style}>
                <div className='dialog-flex'>
                  <span>Create Community</span>
                  <span style={{ marginLeft:'auto'}}>
                    <IconButton
                      disableRipple
                  >
                    <CancelIcon />
                  </IconButton>
                </span>
                </div>
                <div className='margin-top'>Community Name</div>
                <div style={{fontSize:'10px'}}>Community names including capitalisation cannot be changed.</div>
                <div className='margin-top'>
                  <TextField
                   size="small"
                    onChange={(e) =>  {
                      if (e.target.value.length<22) {
                        this.setState({communityName:e.target.value})
                      }
                    }}
                    value={this.state.communityName}
                    helperText={
                        `${21-this.state.communityName.length} characters remaining`
                    }
              />
             </div>
             <div className='margin-top dialog-flex'>
                <Button
                  style={{ margin: '8px 8px 8px auto',borderRadius:'14px'}}
                  variant="outlined"
                >Cancel</Button>
                <Button
                  style={{ margin: '8px', borderRadius:'14px'}}
                  variant="contained"
                >Create Community</Button>
             </div>
              </div>
            </Modal></div>
        );
    }
}


export default CreateCommunityComponent;
