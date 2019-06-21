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
import Fab from '@material-ui/core/Fab';
import BackIcon from '@material-ui/icons/ArrowLeft';

class UserProfile extends React.Component {
 
	constructor(props){
		super(props);
		this.state = {billNO: "", billAmount:"", errorMessage:"", successMessage:"", employeeID:"", enableDetails: false, zoomImageFlag: false,
					showSuccessMessage: false, showErrorMessage: false, homePageShowFlag: true};
		this.state.tableColumns = [{"title":"Employee ID","field":"employee_no","type":"numeric"}, {"title":"Month","field":"bill_month","type":"numeric"},{"title":"Bill Submitted","field":"submitted","type":"numeric"},{"title":"Bill Rejected","field":"rejected","type":"numeric"},{"title":"Select","field":"select","type":"date"}];
		this.state.tableDetailedColumns = [{"title":"Bill No","field":"employee_no","type":"numeric"},{"title":"Date","field":"bill_date","type":"date"},{"title":"Amount","field":"bill_amount","type":"numeric"},{"title":"status","field":"verify_status","type":"numeric"}];
		this.state.billData = {billType:'', billDate:'', billAmount:'', billStatus:'', automlPrediction:'', manualPrediction:'', billImage:''};
		this.state.billTypeList = [ "Others", "Fuel", "Toll"];
		this.state.billType = 0;
		this.state.billDate = this.getCurrentDate();
		this.state.monthData = this.generateBillMonth();
		this.state.billMonth = this.state.monthData.monthList[0].value;
		this.onRowClick = this.onRowClick.bind(this);
		this.onDetailedRowClick = this.onDetailedRowClick.bind(this);
		this.handleImageChange = this.handleImageChange.bind(this);
		this.showNextPage = this.showNextPage.bind(this);
		this.showHomePage = this.showHomePage.bind(this);
		this.getInvoices = this.getInvoices.bind(this);
		this.serachEmployeeDetails = this.serachEmployeeDetails.bind(this);
		this.zoomImage = this.zoomImage.bind(this);
		this.smartVerify = this.smartVerify.bind(this);
		this.manualVerify = this.manualVerify.bind(this);
		this.rejectForm = this.rejectForm.bind(this);

		this.getInvoices();
	}

	generateBillMonth(){
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
		let data = {emp_id: this.state.employeeID, bill_month: this.state.billMonth};
		this.getInvoices(data);
	}

	getInvoices(param){
		let _this = this;
		new FetchApi().getEmployeeForVerification({body: param, success: function(res){
			_this.setState({"tableData": res.invoice_list, "showSearchContainer": true}, function () {
				_this.forceUpdate();
			});
		}});
	}
	
	smartVerify(){

		let _this = this;
		let paramObj = { 
			bill_image:this.state.imagePreviewUrl
		};

		new FetchApi().smartVerifyBill(paramObj, function(data){
			if(data.message === "Success"){
				_this.setState({showSuccessMessage: true, showErrorMessage: false, errorMessage:'', successMessage: 'Bill added successfully'});
			}
		});
	}
	
	manualVerify(){

		let _this = this;
		let paramObj = { 
			bill_image:this.state.imagePreviewUrl
		};

		new FetchApi().smartVerifyBill(paramObj, function(data){
			if(data.message === "Success"){
				_this.setState({showSuccessMessage: true, showErrorMessage: false, errorMessage:'', successMessage: 'Bill added successfully'});
			}
		});
	}
	
	rejectForm(){

		let _this = this;
		let paramObj = { 
			bill_image:this.state.imagePreviewUrl
		};

		new FetchApi().smartVerifyBill(paramObj, function(data){
			if(data.message === "Success"){
				_this.setState({showSuccessMessage: true, showErrorMessage: false, errorMessage:'', successMessage: 'Bill added successfully'});
			}
		});
	}

	showNextPage(){
		this.setState({"homePageShowFlag": false}, function(){
			this.forceUpdate();
		});
	}

	showHomePage(){
		this.setState({"homePageShowFlag": true}, function(){
			this.forceUpdate();
		});
	}

	onRowClick(event, data){
		let _this = this;
		let paramObj = {emp_id: data.employee_no, bill_month: data.bill_month};
		new FetchApi().getEmployeeForVerificationInvoiceDetails({body: paramObj, success: function(res){
			_this.setState({"homePageShowFlag": false, "clickedEmployeeID": data.employee_no, 
				"tableDetailedData": res.invoice_list, "showSearchContainer": true}, 
				function () {
					if(_this.state.tableDetailedData && _this.state.tableDetailedData.length > 0){
						_this.onDetailedRowClick({}, _this.state.tableDetailedData[0]);
					}
				});
		}});
	}

	onDetailedRowClick(event, data){
		let _this = this;
		let url = "/invoice/get-invoice-details/"+data["_id"];
		new FetchApi().getInvoiceDetails({body: {}, url: url, success: function(res){
			let invoiceData = res.invoice_list[0];
			_this.setState({"enableDetails":true, "billData":{billType: invoiceData.bill_type, billDate: invoiceData.bill_date, billAmount: invoiceData.bill_amount, billStatus: invoiceData.verify_status, 
			automlPrediction: invoiceData.prediction, manualPrediction: invoiceData.manualprediction, billImage: new FetchApi().appendURL("/"+invoiceData.invoice_image_loc)}}, function(){
				_this.forceUpdate();
			});
		}});
	}

	zoomImage(){
		let _this = this;
		this.setState({"zoomImageFlag":true}, function () {
			_this.forceUpdate();
		})
	}

	render() {

		return (
			<Grid container>
				{
					this.state.homePageShowFlag ? 
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
						<Grid item xs={12}>
							<div style={{"paddingTop":"20px","width":"100%"}} >
								<MaterialTable
								title=""
								columns={this.state.tableColumns}
								data={this.state.tableData}
								onRowClick={this.onRowClick} />
							</div>
						</Grid>
					</Grid>
					:
					<Grid item container xs={12}>
						<Grid container style={{"textAlign":"center"}} direction={"row"}>
							<Grid item> 
								<Fab aria-label="Add" onClick={()=>{this.setState({"homePageShowFlag":true})}} >
									<BackIcon />
								</Fab>
							</Grid>
							<Grid item style={{"padding":"18px 30px", "fontSize":"20px"}}>
								<span style={{"fontWeight":"bold"}}>Employee ID: </span><span>{this.state.clickedEmployeeID}</span>
							</Grid>
						</Grid>
						<Grid container spacing={2} style={{"padding":"20px"}}>
							<Grid item xs={4}>
								<Grid item xs={12} className={"gridSpaceContainer"}>
									<MaterialTable title="" search = {false}
										columns={this.state.tableDetailedColumns}
										data={this.state.tableDetailedData}
										onRowClick={this.onDetailedRowClick} />
								</Grid>
							</Grid>
							<Grid container item xs={4}>
								<Grid item xs={12} className={"gridSpaceContainer"}>
									<Grid container className={"gridSpaceForm"}>
										<Grid item xs={8}>
											<label className="popupLabelText">Bill Type:</label>
										</Grid>
										<Grid item xs={4}>
											<label className="popupLabelValue">{this.state.billData.billType}</label>
										</Grid>
									</Grid>
									<Grid container className={"gridSpaceForm"}>
										<Grid item xs={8}>
											<label className="popupLabelText">Date:</label>
										</Grid>
										<Grid item xs={4}>
											<label className="popupLabelValue">{this.state.billData.billDate}</label>
										</Grid>
									</Grid>
									<Grid container className={"gridSpaceForm"}>
										<Grid item xs={8}>
											<label className="popupLabelText">Amount:</label>
										</Grid>
										<Grid item xs={4}>
											<label className="popupLabelValue">{this.state.billData.billAmount}</label>
										</Grid>
									</Grid>
									<Grid container className={"gridSpaceForm"}>
										<Grid item xs={8}>
											<label className="popupLabelText">Status:</label>
										</Grid>
										<Grid item xs={4}>
											<label className="popupLabelValue">{this.state.billData.billStatus}</label>
										</Grid>
									</Grid> 
									<Grid container className={"gridSpaceForm"} style={{"marginTop":"15px"}}>
										<Grid item xs={8}>
											<label className="popupLabelText">AutoML Prediction:</label>
										</Grid>
										<Grid item xs={4}>
											<label className="popupLabelValue">{this.state.billData.automlPrediction}</label>
										</Grid>
									</Grid>
									<Grid container className={"gridSpaceForm"}>
										<Grid item xs={8}>
											<label className="popupLabelText">Vision Text Prediction:</label>
										</Grid>
										<Grid item xs={4}>
											<label className="popupLabelValue">{this.state.billData.manualPrediction}</label>
										</Grid>
									</Grid>
								</Grid>
							</Grid>
							<Grid item xs={4}>
								<Grid item xs={12} className={"gridSpaceContainer"} style={{"textAlign":"center"}}>
									<img style={{"maxWidth":"100%", "maxHeight":"400px"}} src={this.state.billData.billImage} alt="Bill"/>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={12} style={{"textAlign":"center"}}>
							<Button variant="contained" color="primary" onClick={(e)=>this.smartVerify(e)} >
								Smart Verify
							</Button>&nbsp;&nbsp;
							<Button variant="contained" color="primary" onClick={(e)=>this.manualVerify(e)} >
								Manual Verify
							</Button>&nbsp;&nbsp;
							<Button variant="contained" color="default" onClick={(e)=>this.rejectForm(e)} >
								Reject
							</Button>
						</Grid>
					</Grid>	
				}
			</Grid>
		);
	}
}

UserProfile.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(UserProfile);
