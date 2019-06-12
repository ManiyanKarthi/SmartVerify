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


class Dashboard extends React.Component {
 
	constructor(props){
        super(props);
		this._handleImageChange = this._handleImageChange.bind(this);
	}
	/*
  state = {
     columns: [
      { title: 'Month', field: 'name' },
      { title: 'Bill type', field: 'surname' },
      { title: 'Bill No', field: 'birthYear', type: 'numeric' },
	  { title: 'Date', field: 'birthYear', type: 'numeric' },
	  { title: 'Amount', field: 'birthYear', type: 'numeric' },
	  { title: 'Status', field: 'birthYear', type: 'numeric' },
    ],
    data: [
                ["May-19", "Petrol Bill", "1233", "22-06-2019", "1000","Submited"],
                ["May-19", "Petrol Bill", "1233", "22-06-2019", "1000","Submited"],
				["May-19", "Petrol Bill", "1233", "22-06-2019", "1000","Submited"],
				["May-19", "Petrol Bill", "1233", "22-06-2019", "1000","Submited"],
				["May-19", "Petrol Bill", "1233", "22-06-2019", "1000","Submited"],
				["May-19", "Petrol Bill", "1233", "22-06-2019", "1000","Submited"],
				["May-19", "Petrol Bill", "1233", "22-06-2019", "1000","Submited"],
              ]
  }
*/
  state = {
	billDate:formatAMPM(new Date()),
    columns: [
      { title: 'Month', field: 'name' , type: 'numeric'},
      { title: 'Bill type', field: 'surname' , type: 'numeric'},
      { title: 'Bill No', field: 'billNo', type: 'numeric' },
	  { title: 'Date', field: 'Date', type: 'date' },
	  { title: 'Amount', field: 'Amount', type: 'numeric' },
	  { title: 'status', field: 'status', type: 'numeric' },
    ],
    data: [
      { name: 'Mehmet', surname: 'Baran', billNo: 1987, Date: "26-09-1993",Amount:"",status:"Submitted" },
      { name: 'Mehmet', surname: 'Baran', billNo: 1987, Date: "26-09-1993",Amount:"",status:"Submitted" },
    ],
  }


_handleSubmit(e) {
	e.preventDefault();

	let fetchurl = "http://10.165.7.169:3000/invoice/add" ;


	fetchApi(fetchurl,JSON.stringify({employee_no:this.state.empId,bill_no:this.state.billNO,bill_date:this.state.billDate,bill_amount:this.state.billAmount,bill_image:this.state.imagePreviewUrl})).then(data =>{
				console.log(data);                            
		});
		
    // TODO: do something with -> this.state.file
    console.log('handle uploading-', this.state.file);
  }

  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

	

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file)
  }

  
  render() {
	

  

	var uiMap1 = [{
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
			label:"Bill No",
			type:"text",
			validateflag:false,
			required:false,
			value:this.state.billNO,
			onChange:(ths)=> {
				this.setState({
					billNO:ths.currentTarget.value
					});
			}
		},{  
			field:true,
			label:"Bill Amount",
			type:"text",
			validateflag:false,
			required:false,
			value:this.state.billAmount,
			onChange:(ths)=> {
				this.setState({
					billAmount:ths.currentTarget.value
					});
			}
		}]
	},{
		fields:[{ 
			field:true,
			label:"Bill Month",
			validateflag:false,
			required:false,
			type:"text",
			value:this.state.billMonth,
			onChange:(ths)=> {
				this.setState({
					billMonth:ths.currentTarget.value
					});
			}
		},{ 
			field:true,
			label:"Bill Date",
			validateflag:false,
			required:false,
			type:"date",
			value:this.state.billDate,
			onChange:(ths) =>{
				this.setState({
					billDate:ths.currentTarget.value
					});

			}
		},{  
			field:false
		}]
	}];

	let {imagePreviewUrl} = this.state;
	let $imagePreview = null;
	console.log(imagePreviewUrl)
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} />);
	}
	
  
    return (


	 <Grid spacing={6} alignItems="center" justify="center" >

		

			<UIFieldsGeneral mapList={uiMap1} />
			
			<div style={{"paddingTop":"20px","textAlign":"center"}}>
				<label>Bill Image </label>
				<input className="fileInput" 
					type="file" 
					onChange={(e)=>this._handleImageChange(e)} />
				
					
			</div>
			<div style={{"paddingTop":"20px","textAlign":"center"}}>
			<Container>
					<div className="imgPreview">
						{$imagePreview}
						</div>

					</Container>
			</div>

			<div style={{"paddingTop":"20px","textAlign":"center"}}>
				<Button variant="contained" color="primary" onClick={(e)=>this._handleSubmit(e)} >
					Add New Bill
				</Button>
			</div>

			<MaterialTableDemo columns={this.state.columns} data={this.state.data} editable={false}  />
			
      </Grid>

    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(Dashboard);
