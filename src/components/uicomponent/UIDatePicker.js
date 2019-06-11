import React from 'react';
import DatePicker from 'react-datetime-picker';

class UIDatePicker extends React.Component {
    render() {

    return (<DatePicker  style={{ borderColor: this.props.validateflag ? "#b94a48" : "#aaa"}} value={this.props.value} onChange={this.props.onChange} />)       
    }

}

export default UIDatePicker; 