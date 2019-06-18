import React from 'react';
import MaterialTable from 'material-table';


class MaterialTableDemo extends React.Component {

  constructor(props){
    super(props);
      this.state={
        columns:props.columns,
        data:props.data,
        editable:props.editable
      }
    }

    componentWillReceiveProps() {
      this.setState({
        data:this.props.data
      })
  }
  
  render() {	
    return (
      <div style={{"paddingTop":"20px","width":"100%"}} >
          <MaterialTable
          title=""
          columns={this.state.columns}
          data={this.state.data}
          editable={this.state.editable} onRowClick={this.props.onRowClick} />
      </div>
    );
  }
}

export default MaterialTableDemo;
