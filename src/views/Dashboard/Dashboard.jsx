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
import Dialog from '@material-ui/core/Dialog';

class Dashboard extends React.Component {
 
	constructor(props){
		super(props);
		this.state = {billNO: "", billAmount:"", errorMessage:"", successMessage:"", employeeID:"", 
					showSearchContainer: false, showSuccessMessage: false, showErrorMessage: false, dialogStatus:false};
		this.state.tableColumns = [{"title":"Month","field":"bill_month","type":"numeric"},{"title":"Bill type","field":"bill_type","type":"numeric"},{"title":"Bill No","field":"bill_no","type":"numeric"},{"title":"Date","field":"bill_date","type":"date"},{"title":"Amount","field":"bill_amount","type":"numeric"},{"title":"status","field":"status","type":"numeric"}];
		this.state.billTypeList = [ "Others", "Fuel", "Toll"];
		this.state.billType = 0;
		this.state.billDate = this.getCurrentDate();
		this.state.monthData = this.generateBillMonth();
		this.state.billMonth = this.state.monthData.monthList[0].value;
		this.addNewBill = this.addNewBill.bind(this);
		this.handleImageChange = this.handleImageChange.bind(this);
		this.openDialog = this.openDialog.bind(this);
		this.closeDialog = this.closeDialog.bind(this);
		this.getInvoices = this.getInvoices.bind(this);
		this.serachEmployeeDetails = this.serachEmployeeDetails.bind(this);
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

	addNewBill(e) {
		let _this = this;
		let paramObj = { 
			employee_no: this.state.employeeID,
			bill_month: this.state.billMonth,
			bill_type: this.state.billType,
			bill_no:this.state.billNO,
			bill_date:this.state.billDate,
			bill_amount:this.state.billAmount,
			bill_image:this.state.imagePreviewUrl
		};
		new FetchApi().addNewBill(paramObj, function(data){
			if(data.message === "Success"){
				_this.setState({showSuccessMessage: true, showErrorMessage: false, errorMessage:'', successMessage: 'Bill added successfully'});
				_this.serachEmployeeDetails();
			}
			else {
				var msg = "";
				var errors = data.errors;
				if(errors && errors.length > 0){
					for(var i=0;i<errors.length;i++){
						msg = msg + "" + errors[i].msg + "(" + errors[i].param + ")" + (i >= errors.length - 1 ? "" : ",") + " ";
					}
				}
				_this.setState({showSuccessMessage: false, showErrorMessage: true, errorMessage: msg, successMessage: ''});
			}
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

	serachEmployeeDetails(){
		let data = {emp_id: this.state.employeeID, bill_month: this.state.billMonth, from: 0, limit: 10};
		this.getInvoices(data);
	}

	getInvoices(param){
		let _this = this;
		new FetchApi().serachEmployeeDetails(param, function(res){
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
			employee_no: this.state.employeeID,
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
							<MaterialTableDemo columns={this.state.tableColumns} data={this.state.tableData}/>
						</Grid>
						<Grid item container xs={12} justify="center" style={{"padding":"15px"}}>
							<Button variant="contained" color="primary"  onClick={this.openDialog} >
								Add new bill
							</Button>
						</Grid>
						<Grid item xs={12}>
							<div>
								<Dialog onClose={this.closeDialog} aria-labelledby="customized-dialog-title" open={this.state.dialogStatus}>
									<Grid container justify="center" className="UI_Form_Container" style={{"padding":"20px"}}>
										<Grid item xs={6} style={{"textAlign":"center", padding:"15px"}}>
											<label style={{"marginLeft":"-10px"}}>Bill Type:</label>&nbsp;&nbsp;&nbsp;
											<Select style={{"padding":"8px"}}
												value={this.state.billType} onChange={(e)=> {this.setState({"billType":e.target.value})}}>
												{
													this.state.billTypeList.map((item, index) => {
														return (
															<MenuItem value={index} key={index}>
																<em>{item}</em>
															</MenuItem>
														);
													})
												}
											</Select>
										</Grid>
										<Grid item xs={6} style={{"textAlign":"center", padding:"15px"}}>
											<TextField label= {"Bill No"} type="number" value={this.state.billNO} onChange={(e) => {this.setState({"billNO": e.currentTarget.value})}}/>
										</Grid>
										<Grid item xs={6} style={{"textAlign":"center", padding:"15px"}}>
											<TextField label= {"Bill Date"} value={this.state.billDate} type={"date"} onChange={(e) => {this.setState({"billDate": e.currentTarget.value})}}/>
										</Grid>
										<Grid item xs={6} style={{"textAlign":"center", padding:"15px"}}>
											<TextField label= {"Bill Amount"} type="number" value={this.state.billAmount} onChange={(e) => {this.setState({"billAmount": e.currentTarget.value})}}/>
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
										<Grid item xs={12}>
											<div style={{"textAlign":"center", "padding":"10px 5px 0px 5px"}}>
											{
												this.state.showSuccessMessage ? <span style={{"color":"green", "fontFamily":"monospace"}}>{this.state.successMessage}</span>
												: (this.state.showErrorMessage ? 
													<span style={{"color":"red", "fontFamily":"monospace"}}>
														{
															this.state.errorMessage
														}
													</span>
												: null)
											}
											</div>
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

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(Dashboard);
