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
	
	  
    return (<div style={{"paddingTop":"20px"}} >
      <MaterialTable
      title=""
      columns={this.state.columns}
      data={this.state.data}
      editable={this.state.editable} onRowClick={this.props.onRowClick} 
    /></div>
    );
  }
}

/*
{
  onRowAdd: newData =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve();
        const data = [...this.state.data];
        data.push(newData);
        this.setState({ ...this.state, data });
      }, 600);
    }),
  onRowUpdate: (newData, oldData) =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve();
        const data = [...this.state.data];
        data[data.indexOf(oldData)] = newData;
        this.setState({ ...this.state, data });
      }, 600);
    }),
  onRowDelete: oldData =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve();
        const data = [...this.state.data];
        data.splice(data.indexOf(oldData), 1);
        this.setState({ ...this.state, data });
      }, 600);
    }),
*/

export default MaterialTableDemo;
