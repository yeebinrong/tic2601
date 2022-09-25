import { Button, FormControlLabel, IconButton, Modal, Radio, RadioGroup } from '@mui/material';
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

const rules = [
  { ruleId: 1, ruleTitle: 'rule 1 abc' },
  { ruleId: 2, ruleTitle: 'rule 2 abc' },
];

class ReportComponent extends React.Component {



    render() {
        return (
          <div> select<Button>Open modal</Button>
          <Modal
            open 
          >
            <div style={style}>
              <div className='dialog-flex'>
                
                <span>Submit a report</span>
                <span style={{ marginLeft:'auto'}}>
                  <IconButton
                    disableRipple
                >
                  <CancelIcon />
                </IconButton>
              </span>
              </div>
              <div className='margin-top'>Which community rule does this violate?</div>   
            <div> 
             <RadioGroup
                //  name="controlled-radio-buttons-group"
                  // value={value}
                  // onChange={handleChange}
                >
                  {rules.map((rule)=>{
                    return (
                      <FormControlLabel
                        value={rule.ruleId}
                        control={<Radio style={{marginLeft:'auto'}}/>}
                        label= {rule.ruleTitle}
                        labelPlacement="start"
                      />
                    );
                  })}
                </RadioGroup>
            </div>

           <div className='margin-top dialog-flex'>                     
              <Button        
                style={{ margin: '8px 8px 8px auto',borderRadius:'14px'}}
                variant="outlined"
              >Submit</Button> 
           </div>
            </div>
          </Modal></div>
        );
    }
}


export default ReportComponent;
