import { Button, IconButton, Modal, TextField } from '@mui/material';
import React from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import { createCommunityApi } from '../../apis/app-api';
import { snackBarProps } from '../../constants/constants';
import { withSnackbar } from 'notistack';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '500px',
  backgroundColor: 'white',
  borderRadius: '5px',
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
            <Modal
              open={this.props.open}
            >
              <div style={style}>
                <div style={{ color: 'white', display: 'flex', backgroundColor: 'rgb(0, 178, 210)', height: '35px', borderRadius: '5px', padding: '12px', textIndent: '16px' }}>
                    <div className='dialog-flex' style={{ width: '100%' }}>
                      <span style={{ marginTop: '6px' }}>
                        <b>Create Community</b>
                      </span>
                      <span style={{ marginLeft:'auto' }}>
                        <IconButton
                          onClick={() => {
                            this.setState({
                              communityName: '',
                            });
                            this.props.onClose();
                          }}
                          disableRipple
                        >
                          <CancelIcon sx={{ color:'white' }} />
                        </IconButton>
                      </span>
                    </div>
                </div>
                <div
                  style={{ padding: '8px 16px' }}
                >
                  <div className='margin-top' style={{ marginLeft: '16px', paddingTop: '16px' }}>Community Name</div>
                  <div style={{fontSize:'10px', marginLeft: '16px' }}>Community names including capitalisation cannot be changed.</div>
                  <div className='margin-top' style={{ marginLeft: '16px', paddingBottom: '16px' }}>
                    <TextField
                    size="small"
                      onChange={(e) => {
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
                      onClick={() => {
                        this.setState({
                          communityName: '',
                        });
                        this.props.onClose();
                      }}
                      style={{ margin: '8px 8px 8px auto',borderRadius:'14px'}}
                      variant="outlined"
                    >
                    Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        createCommunityApi(this.state.communityName)
                          .then(res => {
                            if (!res.error) {
                              this.setState({
                                communityName: '',
                              });
                              this.props.onClose();
                              this.props.enqueueSnackbar(
                                  `Successfully created a community [${res.data.communityName}]!`,
                                  snackBarProps('success'),
                              );
                              this.props.navigate(`/community/${res.data.communityName}/posts/best`);
                            } else {
                              this.props.enqueueSnackbar(
                                  res.data.message,
                                  snackBarProps('error'),
                              );
                            }
                          })
                      }}
                      style={{ margin: '8px', borderRadius:'14px', backgroundColor: 'rgb(0, 178, 210)' }}
                      variant="contained"
                    >
                      Create Community
                    </Button>
                  </div>
                </div>
              </div>
            </Modal>
        );
    }
}


export default withSnackbar(CreateCommunityComponent);
