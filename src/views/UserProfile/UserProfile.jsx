import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import dashboardStyle from "assets/jss/material-dashboard-react/views/dashboardStyle.jsx";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import MaterialTable from 'material-table';
import TextField from "@material-ui/core/TextField"
import "../../assets/css/previewimage.css";
import { Select, MenuItem } from "@material-ui/core";
import FetchApi from '../../api/FetchAPI';
import Dialog from '@material-ui/core/Dialog';

class UserProfile extends React.Component {
 
	constructor(props){
		super(props);
		this.state = {billNO: "", billAmount:"", errorMessage:"", successMessage:"", employeeID:"", 
					showSearchContainer: false, showSuccessMessage: false, showErrorMessage: false, dialogStatus:false};
		this.state.tableColumns = [{"title":"Month","field":"name","type":"numeric"},{"title":"Bill type","field":"bill_type","type":"numeric"},{"title":"Bill No","field":"bill_no","type":"numeric"},{"title":"Date","field":"bill_date","type":"date"},{"title":"Amount","field":"bill_amount","type":"numeric"},{"title":"status","field":"status","type":"numeric"}];
		this.state.tableDetailedColumns = [{"title":"Month","field":"name","type":"numeric"},{"title":"Bill type","field":"bill_type","type":"numeric"},{"title":"Bill No","field":"bill_no","type":"numeric"},{"title":"Date","field":"bill_date","type":"date"},{"title":"Amount","field":"bill_amount","type":"numeric"},{"title":"status","field":"status","type":"numeric"}];
		this.state.billTypeList = [ "Others", "Fuel", "Toll"];
		this.state.billData = {billType:'Fuel', billDate:'17-06-2019', billAmount:'50', billStatus:'Submitted', billImage:''};
		this.state.billType = 0;
		this.state.billDate = this.getCurrentDate();
		this.state.monthData = this.generateBillMonth();
		this.state.billMonth = this.state.monthData.monthList[0].value;
		this.onRowClick = this.onRowClick.bind(this);
		this.onDetailedRowClick = this.onDetailedRowClick.bind(this);
		this.handleImageChange = this.handleImageChange.bind(this);
		this.openDialog = this.openDialog.bind(this);
		this.closeDialog = this.closeDialog.bind(this);
		this.getInvoices = this.getInvoices.bind(this);
		this.serachEmployeeDetails = this.serachEmployeeDetails.bind(this);

		this.getInvoices();
	}

	generateBillMonth(curMon){
		let dt = new Date();
		let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		let list = [];
		let m = dt.getMonth();
		let y = dt.getFullYear();
		for(var i=month.length - 1;i>=0;i--){
			var cur = (i + m + 1) % 12;
			var ye = (i + m ) < 12 ? (y - 1) : y;
			var mo = (cur + 1).toString();
			(mo.length === 1) && (mo = '0' + mo);
			var obj = {"month":month[cur], value:mo+"-"+ye, "year":ye};
			list.push(obj);
		}
		return {"curMonth": m, "monthList":list}
	}

	getCurrentDate(){
		let dt = new Date();
		var y = dt.getFullYear().toString();
		var m = (dt.getMonth() + 1).toString();
		var d = dt.getDate().toString();
		(d.length === 1) && (d = '0' + d);
		(m.length === 1) && (m = '0' + m);
		var date_formatted = y + "-" + m + "-" + d;
		return date_formatted;
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

	serachEmployeeDetails(){
		let data = {emp_id: this.state.employeeID, bill_month: this.state.billMonth, from: 0, limit: 10};
		this.getInvoices(data);
	}

	getInvoices(param){
		let _this = this;
		new FetchApi().getEmployeeForVerification(param, function(res){
			_this.setState({"tableData": res.invoices, "showSearchContainer": true}, function () {
				_this.forceUpdate();
			});
		});
	}
	
	clearForm(e){
		document.getElementsByClassName("fileInput")[0].value = "";
		this.setState({"showSuccessMessage":false, "showErrorMessage":false, "errorMessage":'', "billDate":this.getCurrentDate(), "billType": 0, "billNO":'', "billAmount":'', "imagePreviewUrl":null});
	}
	
	smartVerify(e){

		let _this = this;
		let paramObj = { 
			bill_image:this.state.imagePreviewUrl
		};

		new FetchApi().smartVerifyBill(paramObj, function(data){
			if(data.message === "success"){
				_this.setState({showSuccessMessage: true, showErrorMessage: false, errorMessage:'', successMessage: 'Bill added successfully'});
			}
		});
	}

	openDialog(){
		this.setState({"dialogStatus":true}, function(){
			this.forceUpdate();
		});
	}

	closeDialog(){
		this.setState({"dialogStatus": false}, function(){
			this.forceUpdate();
		});
	}

	onRowClick(event, data){
		// console.log(event, data);
		let _this = this;
		this.setState({"dialogStatus":true}, function(){
			let paramObj = {emp_id: data.employeeID, bill_month: data.billMonth, from: 0, limit: 10};
			new FetchApi().serachEmployeeDetails(paramObj, function(res){
				_this.setState({"tableDetailedData": res.invoices, "showSearchContainer": true}, function () {
					_this.forceUpdate();
				});
			});
		});
	}

	onDetailedRowClick(event, data){
		console.log(event, data);

	}

	render() {

		return (
			<Grid container>
				<Grid xs={12} container item direction="row" spacing={2} style={{"padding":"0px 30px"}}>
					<Grid item>
						<TextField label= {"Employee ID"} value={this.state.employeeID} onChange={(e) => {this.setState({"employeeID": e.currentTarget.value})}}/>
					</Grid>
					<Grid item>
						<Select style={{"padding":"8px"}}
							value={this.state.billMonth} onChange={(e)=> {this.setState({"billMonth":e.target.value})}}>
							{
								this.state.monthData.monthList.map((item, index) => {
									return (
										<MenuItem value={item.value} key={index}>
											<em>{item.month+"-"+item.year}</em>
										</MenuItem>
									);
								})
							}
						</Select>
					</Grid>
					<Grid item style={{"padding":"20px"}}>
						<Button variant="contained" color="primary" onClick={this.serachEmployeeDetails} >
							Search
						</Button>
					</Grid>
				</Grid>
				{
					this.state.showSearchContainer ? 
					<Grid item xs={12} >
						<Grid item container xs={12}>
							<div style={{"paddingTop":"20px","width":"100%"}} >
								<MaterialTable
								title=""
								columns={this.state.tableColumns}
								data={this.state.tableData}
								onRowClick={this.onRowClick} />
							</div>
						</Grid>
						<Grid item xs={12}>
							<div>
								<Dialog onClose={this.closeDialog} maxWidth={"xl"}
									aria-labelledby="customized-dialog-title" open={this.state.dialogStatus}>
									<Grid container style={{"padding":"20px"}}>
										<Grid item xs={12} style={{padding:"15px"}}>
											<MaterialTable
												title=""
												columns={this.state.tableDetailedColumns}
												data={this.state.tableDetailedData}
												onRowClick={this.onDetailedRowClick} />
										</Grid>
									</Grid>
									<Grid container style={{"padding":"20px"}}>
										<Grid item xs={12}>
											<Grid item xs={6} style={{padding:"15px", "textAlign":"left"}}>
												<Grid item xs={12} style={{"textAlign":"left"}}>
													<label>Bill Type:</label>
													<label>{this.state.billData.billType}</label>
												</Grid>
												<Grid item xs={12} style={{"textAlign":"left"}}>
													<label>Date:</label>
													<label>{this.state.billData.billDate}</label>
												</Grid>
												<Grid item xs={12} style={{"textAlign":"left"}}>
													<label>Amount:</label>
													<label>{this.state.billData.billAmount}</label>
												</Grid>
												<Grid item xs={12} style={{"textAlign":"left"}}>
													<label>Status:</label>
													<label>{this.state.billData.billStatus}</label>
												</Grid>
											</Grid>
											<Grid item xs={6} style={{padding:"15px", "textAlign":"left"}}>
												<Grid xs={12}>
													
												</Grid>
											</Grid>
										</Grid>
										<Grid item xs={12} style={{"textAlign":"center"}}>
											<Button variant="contained" color="primary" onClick={(e)=>this.smartVerify(e)} >
												Smart Verify
											</Button>&nbsp;&nbsp;
											<Button variant="contained" color="primary" onClick={(e)=>this.smartVerify(e)} >
												Manual Verify
											</Button>&nbsp;&nbsp;
											<Button variant="contained" color="default" onClick={(e)=>this.clearForm(e)} >
												Reject
											</Button>
										</Grid>
									</Grid>
								</Dialog>
							</div>
						</Grid>
					</Grid>
					: null 
				}
			</Grid>
		);
	}
}

UserProfile.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(UserProfile);
