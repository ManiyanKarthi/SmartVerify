import React from 'react';
import TextField from "@material-ui/core/TextField"
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

class UIFields extends React.Component {


    renderSwitch(label,param,value,validateflag,onChange,selectList,onClick) {
        switch(param) {
           
            case 'select':
            return <TextField label= {label}  validateflag={validateflag} value={value}   onChange={onChange} selectList={selectList} />;
            case 'textArea':
            return <TextField label= {label}  validateflag={validateflag} value={value}   onChange={onChange}  />;
             case 'date':
            return <TextField label= {label}  type="date" validateflag={validateflag} value={value}   onChange={onChange}  />;
            case 'button':
            return <Button variant="contained" color="primary" onChange={onChange}  onClick={onClick} >{label}</Button> ;
             case 'text':
            return <TextField label= {label}  validateflag={validateflag} value={value}   onChange={onChange}  />;
            default:
            return <TextField label= {label}  value={value}   onChange={onChange}  />;
        }
}

    render() {

        return (
            <Grid container spacing={6} alignItems="center" justify="center" >
                  <Grid item xs={4}  >
                        {this.props.f1field ?
                        this.renderSwitch(this.props.f1label,this.props.f1type,this.props.f1value,this.props.f1validateflag,this.props.f1onChange,this.props.f1selectList,this.props.f1onClick)
                        :null}
                    </Grid>
                    <Grid item xs={4}>
                        {this.props.f2field ?
                                        this.renderSwitch(this.props.f2label,this.props.f2type,this.props.f2value,this.props.f2validateflag,this.props.f2onChange,this.props.f2selectList,this.props.f2onClick)
                            :null}
                    </Grid>
                    <Grid item xs={4}>
                        {this.props.f3field ?
                                        this.renderSwitch(this.props.f3label,this.props.f3type,this.props.f3value,this.props.f3validateflag,this.props.f3onChange,this.props.f3selectList,this.props.f3onClick)
                            :null}
                    </Grid>
            
            </Grid>
        )
    }

}


export default UIFields; 