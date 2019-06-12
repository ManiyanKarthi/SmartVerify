import React from "react";
import PropTypes from "prop-types";
// react plugin for creating charts
// @material-ui/core
import withStyles from "@material-ui/core/styles/withStyles";


import dashboardStyle from "assets/jss/material-dashboard-react/views/dashboardStyle.jsx";
import CSS from "../../assets/css/previewimage.css";

import TextField from '@material-ui/core/TextField';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from "@material-ui/core/InputLabel";
import Grid from '@material-ui/core/Grid';
//import Paper from '@material-ui/core/Paper';
import FormLabel from '@material-ui/core/FormLabel';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';

import ButtonBase from '@material-ui/core/ButtonBase';
import SimpleTable from "../../components/Table/SimpleTable";
import EnhancedTable from "../../components/Table/EnhancedTable";
import UIFieldsGeneral from "../../components/uicomponent/UIFieldsGeneral"
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTableDemo from "../../components/Table/MaterialTable.jsx";
import Upload from 'material-ui-upload/Upload';
import fetchApi from "../../api/Api";
import {formatAMPM} from "../../components/functional/common"
import GridListObject from "../../components/Grid/GridList"
class UserProfile extends React.Component {
 
	constructor(props){
        super(props);
	}

  state = {
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
		},{  
      field:false
    }]
	}];

  const tileData = [
          {
            img: "image",
            title: 'Image',
            author: 'author',
            cols: 2,
          }
        ];
      

  
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
