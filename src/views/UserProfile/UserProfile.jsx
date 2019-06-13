import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import dashboardStyle from "assets/jss/material-dashboard-react/views/dashboardStyle.jsx";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import UIFieldsGeneral from "../../components/uicomponent/UIFieldsGeneral"
import MaterialTableDemo from "../../components/Table/MaterialTable.jsx";

class UserProfile extends React.Component {
 
	constructor(props){
		super(props);
		this.state = {
			columns: [
			  { title: 'Emplyee Id', field: 'name' , type: 'numeric'},
			  { title: 'Month', field: 'month' , type: 'numeric'},
			  { title: 'Bill Submitted', field: 'billSubmitted', type: 'numeric' },
			  { title: 'Bill', field: 'bill', type: 'numeric' },
			  { title: 'Bill Rejected', field: 'billRejected', type: 'numeric' },
			],
			data: [
			  { name: '688458', month: 'May-19', billNo: 1987, billSubmitted: "2",bill:"1",billRejected:"2" },
			  { name: '688455', month: 'May-19', billNo: 1987, billSubmitted: "2",bill:"1",billRejected:"2" },
			],
		  };
	}

	onRowClick = (event) => {

	}
	
  render() {
	

  
  var uiMap = [{
		fields:[{ 
			field:true,
			label:"Employee Id",
			validateflag:false,
			required:false,
			type:"text",
			value:this.state.empId,
			onChange:(ths)=> {
				this.setState({
					empId:ths.currentTarget.value
					});
			}
		},{  
			field:true,
			label:"Month",
			type:"text",
			validateflag:false,
			required:false,
			value:this.state.Month,
			onChange:(ths)=> {
				this.setState({
					Month:ths.currentTarget.value
					});
			}
		}]
	}];

  /*const tileData = [
          {
            img: "image",
            title: 'Image',
            author: 'author',
            cols: 2,
          }
  ];*/
      

  
    return (


	 <Grid spacing={6} alignItems="center" justify="center" >

			<UIFieldsGeneral mapList={uiMap} />
		
		
			<div style={{"paddingTop":"20px","textAlign":"center"}} >
				<Button variant="contained" color="primary" >
					Search
				</Button>
				</div>

			<MaterialTableDemo columns={this.state.columns} data={this.state.data} editable={false} onRowClick={this.onRowClick}  />
		

      </Grid>

    );
  }
}

UserProfile.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(UserProfile);
