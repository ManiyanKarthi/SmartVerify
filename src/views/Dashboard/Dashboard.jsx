import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import dashboardStyle from "assets/jss/material-dashboard-react/views/dashboardStyle.jsx";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import MaterialTableDemo from "../../components/Table/MaterialTable.jsx";
import TextField from "@material-ui/core/TextField"
import "../../assets/css/previewimage.css";
import { Select, MenuItem } from "@material-ui/core";
import FetchApi from '../../api/FetchAPI';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';

class Dashboard extends React.Component {
 
	constructor(props){
		super(props);
		this.state = {billMonth:'', billNO: '', billDate:'', billAmount:''};
		this.state.dialogStatus = false;
		this.state.tableColumns = [{"title":"Month","field":"name","type":"numeric"},{"title":"Bill type","field":"surname","type":"numeric"},{"title":"Bill No","field":"billNo","type":"numeric"},{"title":"Date","field":"Date","type":"date"},{"title":"Amount","field":"Amount","type":"numeric"},{"title":"status","field":"status","type":"numeric"}];
		this.state.tableData = [{"name":"Mehmet","surname":"Baran","billNo":1987,"Date":"26-09-1993","Amount":"","status":"Submitted"},{"name":"Mehmet","surname":"Baran","billNo":1987,"Date":"26-09-1993","Amount":"","status":"Submitted"}];
		this.state.monthData = this.generateBillMonth();
		this.addNewBill = this.addNewBill.bind(this);
		this.handleImageChange = this.handleImageChange.bind(this);
		this.openDialog = this.openDialog.bind(this);
		this.closeDialog = this.closeDialog.bind(this);
		this.serachEmployeeDetails = this.serachEmployeeDetails.bind(this);
		this.textUpdate = this.textUpdate.bind(this);
	}

	generateBillMonth(curMon){
		let dt = new Date();
		let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		let list = [];
		let m = dt.getMonth();
		let y = dt.getFullYear();
		let currentMonth = month.splice(m);
		let previousLoop = month.splice(0,m);
		for(let i=0;i<currentMonth.length;i++){
			list.push({"month":currentMonth[i], "year":y});
		}
		for(let i=0;i<previousLoop.length;i++){
			list.push({"month":previousLoop[i], "year":y-1});
		}
		return {"curMonth": m, "monthList":list}
	}

	addNewBill(e) {
		let paramObj = { 
			bill_no:this.state.billNO,
			bill_date:this.state.billDate,
			bill_amount:this.state.billAmount,
			bill_image:this.state.imagePreviewUrl
		};
		new FetchApi().addNewBill(JSON.stringify(paramObj), function(data){
			console.log(data);
		})
	}

	handleImageChange(e) {
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

	serachEmployeeDetails(e){
		let _this = this;
		let data = {};
		new FetchApi().serachEmployeeDetails(data, function(data){
			console.log(data);
			_this.setState("tableData", data);
		});
	}
	
	clearForm(e){

	}
	
	smartVerify(e){

	}

	textUpdate(key, value){
		let obj = {};
		obj[key] = value;
		this.setState(obj);
	}
  
	openDialog(){
		this.setState({"dialogStatus":true});
	}

	closeDialog(){
		this.setState({"dialogStatus": false});
	}

	render() {

		// <UIFieldsGeneral mapList={uiMap1}/>
		return (
			<Grid container>
				<Grid xs={12} container item direction="row" spacing={2} style={{"padding":"0px 30px"}}>
					<Grid item>
						<TextField label= {"Employee ID"} value={this.state.employeeID} onChange={(e) => {this.setState({"employeeID": e.currentTarget.value})}}/>
					</Grid>
					<Grid item>
						<Select style={{"padding":"8px"}}
							value={this.state.monthData.monthList[0].month+"-"+this.state.monthData.monthList[0].year}>
							{
								this.state.monthData.monthList.map((item, index) => {
									return (
										<MenuItem value={item.month+"-"+item.year} key={index}>
											<em>{item.month+"-"+item.year}</em>
										</MenuItem>
									);
								})
							}
						</Select>
					</Grid>
					<Grid item style={{"padding":"20px"}}>
						<Button variant="contained" color="primary" onClick={(e)=>this.serachEmployeeDetails(e)} >
							Search
						</Button>
					</Grid>
				</Grid>
				<Grid item container xs={12}>
					<MaterialTableDemo columns={this.state.tableColumns} data={this.state.tableData}/>
				</Grid>
				<Grid item xs={12}>
					<div style={{"position":"fixed","right":"30px", "bottom":"30px"}}>
						<Fab color="primary" aria-label="Add">
							<AddIcon onClick={this.openDialog}/>
						</Fab>
					</div>
					<div>
						<Dialog onClose={this.closeDialog} aria-labelledby="customized-dialog-title" open={this.state.dialogStatus}>
							<Grid container justify="center" className="UI_Form_Container" style={{"padding":"20px"}}>
								<Grid item xs={6} style={{"textAlign":"center", padding:"15px"}}>
									<TextField label= {"Bill Type"} value={this.state.billType} onChange={(e) => {this.setState({"billType": e.currentTarget.value})}}/>
								</Grid>
								<Grid item xs={6} style={{"textAlign":"center", padding:"15px"}}>
									<TextField label= {"Bill No"} value={this.state.billNO} onChange={(e) => {this.setState({"billNO": e.currentTarget.value})}}/>
								</Grid>
								<Grid item xs={6} style={{"textAlign":"center", padding:"15px"}}>
									<TextField label= {"Bill Date"} value={this.state.billDate} onChange={(e) => {this.setState({"billDate": e.currentTarget.value})}}/>
								</Grid>
								<Grid item xs={6} style={{"textAlign":"center", padding:"15px"}}>
									<TextField label= {"Bill Amount"} value={this.state.billAmount} onChange={(e) => {this.setState({"billAmount": e.currentTarget.value})}}/>
								</Grid>
								<Grid item xs={12} style={{"textAlign":"center"}}>
									<label>Bill Image </label>
									<input className="fileInput" type="file" onChange={(e)=>this.handleImageChange(e)} />
								</Grid>
								<Grid item xs={12} style={{"textAlign":"center"}}>
									<Button variant="contained" color="primary" onClick={(e)=>this.addNewBill(e)} >
										Add New Bill
									</Button>&nbsp;&nbsp;
									<Button variant="contained" color="default" onClick={(e)=>this.smartVerify(e)} >
										Smart Verify
									</Button>&nbsp;&nbsp;
									<Button variant="contained" color="default" onClick={(e)=>this.clearForm(e)} >
										Clear
									</Button>
								</Grid>
							</Grid>
						</Dialog>
					</div>
				</Grid>
			</Grid>
		);
	}
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(Dashboard);
