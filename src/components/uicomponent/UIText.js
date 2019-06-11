import React from 'react';


class UIText extends React.Component {
    render() {

        return (<input className="form-control" style={{ borderColor: this.props.validateflag ? "#b94a48" : "#aaa"}} value={this.props.value} onChange={this.props.onChange} />
        )
    }

}

export default UIText; 