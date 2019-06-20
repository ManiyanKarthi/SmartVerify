import React from "react";

class UILabel extends React.Component {
  render() {
    return <label>{this.props.value}</label>;
  }
}

export default UILabel;
