import React from "react";

class UITextArea extends React.Component {
  render() {
    return (
      <textarea
        className={"form-control"}
        style={{ borderColor: this.props.validateflag ? "#b94a48" : "#aaa" }}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}

export default UITextArea;
