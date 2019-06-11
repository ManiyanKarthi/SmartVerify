import React from 'react';

import TextField from '@material-ui/core/TextField';

class UIMaterialText extends React.Component {
	
	const inputProps = {
		  step: 300,
		};


    render() {

        return (<TextField  inputProps={inputProps}  value={this.props.value} onChange={this.props.onChange}  /> )
    }

}

export default UIMaterialText; 