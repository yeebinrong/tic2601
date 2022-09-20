import { Button, Modal, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';



class CreateCommunityComponent extends React.Component {
    


    render() {
        return (
            <div> select<Button>Open modal</Button>
            <Modal
              open 
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Text in a modal
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                </Typography>
              </Box>
            </Modal></div>
        );
    }
}


export default CreateCommunityComponent;
