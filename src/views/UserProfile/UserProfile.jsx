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
import BackIcon from '@material-ui/icons/ArrowBack';
import InfoIcon from '@material-ui/icons/Info';
import {ToastsContainer, ToastsStore} from 'react-toasts';
import LoaderImg from 'assets/img/Loader.svg'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Dialog from '@material-ui/core/Dialog';

class UserProfile extends React.Component {
 
	constructor(props){
		super(props);
		this.state = {billNo: "", billAmount:"", errorMessage:"", successMessage:"", employeeID:"", enableDetails: false, showLoaderImage: false, dialogStatus: false,
					predictionData: {},
					showSuccessMessage: false, showErrorMessage: false, homePageShowFlag: true, invoiceDataStatus: 10, autoMLStatus: {}, tableDetailedData: [],
					billType: 0 , billDate:'', billStatus:'', automlPrediction:0, billImage:''};
		this.state.tableColumns = [{"title":"Employee ID","field":"employee_no","type":"numeric"}, {"title":"Month","field":"bill_month","type":"numeric"},{"title":"Bill Submitted","field":"submitted","type":"numeric"},{"title":"Bill Rejected","field":"rejected","type":"numeric"},
									{"title":"Manual verified","field":"manual_verified","type":"numeric"}, {"title":"Smart verify success","field":"smart_verified_success","type":"numeric"}, {"title":"Smart verify failed","field":"smart_verified_failed","type":"numeric"}];
		this.state.billTypeList = [ "Others", "Fuel", "Toll"];
		this.state.monthData = this.generateBillMonth();
		this.state.billMonth = this.state.monthData.monthList[0].value;
		this.onRowClick = this.onRowClick.bind(this);
		this.onDetailedRowClick = this.onDetailedRowClick.bind(this);
		this.handleImageChange = this.handleImageChange.bind(this);
		this.showNextPage = this.showNextPage.bind(this);
		this.showHomePage = this.showHomePage.bind(this);
		this.getInvoices = this.getInvoices.bind(this);
		this.serachEmployeeDetails = this.serachEmployeeDetails.bind(this);
		this.updateDetailTable = this.updateDetailTable.bind(this);
		this.smartVerify = this.smartVerify.bind(this);
		this.manualVerify = this.manualVerify.bind(this);
		this.rejectForm = this.rejectForm.bind(this);
		this.zoomInImage = this.zoomInImage.bind(this);
		this.zoomOutImage = this.zoomOutImage.bind(this);
		this.openModal = this.openModal.bind(this);
		this.closeDialog = this.closeDialog.bind(this);
		this.zoomTimeout = undefined;

		//verify_status - 0 (submitted), 1 (smart verify success), 2 (smart verify failed), 3 (manual verify), 4 (rejected), bill type - 1 (fuel), 2 (toll)	 
		this.serachEmployeeDetails();
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
		if(file){
			reader.readAsDataURL(file);
		}
	}

	serachEmployeeDetails(){
		let data = {emp_id: this.state.employeeID, month_year: this.state.billMonth};
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
		let url = "/invoice/smart-verify/" + this.state.billID;
		this.setState({"showLoaderImage": true, "autoMLStatus":{}});
		new FetchApi().smartVerifyStoredBill({body: {}, url:url, success: function(data){
			if(data.status === 200){
				_this.onDetailedRowClick(_this.billDetailedClickedData, _this.updateDetailTable);
				_this.setState({"autoMLStatus":{"showMessage": true, "state":"success", "message": data.message}});
			}
			else {
				_this.onDetailedRowClick(_this.billDetailedClickedData, _this.updateDetailTable);
				_this.setState({"autoMLStatus":{"showMessage": true, "state":"error", "message": data.message}});
			}
			_this.setState({"showLoaderImage": false});
		}, error: function(message){
			_this.setState({"autoMLStatus":{"showMessage": true, "state":"error", "message": "Smart verify failed: " + message}});
		},
		onTimeout: function(){
			ToastsStore.error("Smart verified failed due to timeout");
			_this.setState({"showLoaderImage": false});
		}});
	}

	updateDetailTable(data){
		let dt = this.state.tableDetailedData;
		for(var i=0;i<dt.length;i++){
			if(dt[i]["_id"] === data["_id"]){
				dt[i] = data;
			}
		}
		this.setState({"tableDetailedData":dt});
	}
	
	manualVerify(){

		let _this = this;
		let paramObj = {
			bill_no: this.state.billNo,
			bill_date: this.state.billDate,
			bill_amount: this.state.billAmount,
			bill_type: this.state.billType
		};
		let url = "/invoice/manual-verify-invoice/" + this.state.billID;
		this.setState({"showLoaderImage": true, "autoMLStatus":{}});
		new FetchApi().manualVerify({body: paramObj, url:url, success: function(data){
			if(data.status === 200){
				ToastsStore.success("Manual verified successfully");
				_this.onDetailedRowClick(_this.billDetailedClickedData, _this.updateDetailTable);
			}
			else {
				var msg = "";
				var errors = data.errors;
				if(errors && errors.length > 0){
					for(var i=0;i<errors.length;i++){
						msg = msg + "" + errors[i].msg + "(" + errors[i].param + ")" + (i >= errors.length - 1 ? "" : ",") + " ";
					}
				}
				ToastsStore.error("Manual verified failed: " + msg);
			}
			_this.setState({"showLoaderImage": false});
		}});
	}
	
	rejectForm(){

		let _this = this;
		let url ="/invoice/reject-invoice/"+this.state.billID;
		this.setState({"showLoaderImage": true});
		new FetchApi().rejectBill({body: {}, url: url, success: function(data){
			if(data.message === "Success"){
				ToastsStore.success("Bill rejected");
				_this.onDetailedRowClick(_this.billDetailedClickedData, _this.updateDetailTable);
			}
			_this.setState({"showLoaderImage": false});
		}});
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
		let paramObj = {emp_id: data.employee_no, month_year: this.state.billMonth};
		new FetchApi().getEmployeeForVerificationInvoiceDetails({body: paramObj, success: function(res){
			_this.setState({"homePageShowFlag": false, "clickedEmployeeID": data.employee_no, "clickedBillMonth": data.bill_month,
				"tableDetailedData": res.invoice_list, "showSearchContainer": true}, 
				function () {
					if(_this.state.tableDetailedData && _this.state.tableDetailedData.length > 0){
						_this.onDetailedRowClick(_this.state.tableDetailedData[0]);
					}
				});
		}});
	}

	onDetailedRowClick(data, callback){
		let _this = this;
		let url = "/invoice/get-invoice-details/"+data["_id"];
		this.billDetailedClickedData = data;
		this.setState({"autoMLStatus":{}});
		new FetchApi().getInvoiceDetails({body: {}, url: url, success: function(res){
			let invoiceData = res.invoice_list[0];
			let predictionData = {};
			if(invoiceData.bill_transaforms){
				predictionData.billNo = invoiceData.bill_transaforms.bill_number;
				predictionData.billDate = invoiceData.bill_transaforms.bill_date;
				predictionData.billAmount = invoiceData.bill_transaforms.net_sales;
				if(typeof invoiceData.bill_transaforms.bill_type === "number"){
					predictionData.billType = _this.state.billTypeList[invoiceData.bill_transaforms.bill_type];
				}
			}
			_this.setState({"enableDetails":true, billType: invoiceData.bill_type, billDate: invoiceData.bill_date, billAmount: invoiceData.bill_amount, billStatus: invoiceData.bill_status, 
			automlPrediction: invoiceData.automl_prediction_percentage, invoiceDataStatus: invoiceData.verify_status, billID: invoiceData["_id"], 
			predictionData: predictionData, billNo: invoiceData.bill_no, billImage: new FetchApi().appendURL("/"+invoiceData.invoice_image_loc)}, function(){
				_this.forceUpdate();
			});
			if(callback){
				callback(invoiceData);
			}
		}});
	}

	openModal(){
		let _this = this;
		this.setState({"dialogStatus": true});
		new FetchApi().getAutoMLJSON({body: {}, url: "/invoice/get-automl-json/"+ this.state.billID, success: function(res){
			_this.setState({"predictionJSONObject": res.invoice[0]});
		}});
	}

	closeDialog(){
		this.setState({"dialogStatus": false});
	}

	zoomInImage(event){
		var element = document.getElementById("overlay");
		clearTimeout(this.zoomTimeout);
		this.zoomTimeout = setTimeout(function(){
			element.style.display = "inline-block";
		}, 2000);
		var img = document.getElementById("overlayOriginalImage");
		var posX = event.nativeEvent.offsetX ? (event.nativeEvent.offsetX) : event.nativeEvent.pageX - img.offsetLeft;
		var posY = event.nativeEvent.offsetY ? (event.nativeEvent.offsetY) : event.nativeEvent.pageY - img.offsetTop;
		element.style.backgroundPosition = (-posX * (img.naturalWidth / img.width) + (element.offsetWidth / 2)) + "px " + (-posY * (img.naturalHeight / img.height) + (element.offsetHeight / 2)) + "px";
	}

	zoomOutImage() {
		clearTimeout(this.zoomTimeout);
		var element = document.getElementById("overlay");
		element.style.display = "none";
	}

	render() {

		let disableEdit = this.state.invoiceDataStatus > 2 ? true : false;

		return (
			<Grid container>
				<Grid xs={12} container item className={"tableContainerGridBox"} direction="row" spacing={2} style={{"display":(this.state.homePageShowFlag ? "" : "none")}}>
					<Grid item>
						<TextField label= {"Employee ID"} value={this.state.employeeID} type={"number"}
							onChange={(e) => {this.setState({"employeeID": e.currentTarget.value})}}
							onKeyPress={(e) => { if(e.key === "Enter") { this.serachEmployeeDetails(); }}}/>
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
							{
								(
									this.state.tableData ? 
									<MaterialTable title="" columns={this.state.tableColumns} data={this.state.tableData} onRowClick={this.onRowClick} />
									: null
								)
							}
						</div>
					</Grid>
				</Grid>
				<Grid item container xs={12} style={{"display":(this.state.homePageShowFlag ? "none" : "")}}>
					<Grid container style={{"textAlign":"center"}} direction={"row"}>
						<Grid item> 
							<Fab aria-label="Add" onClick={()=>{this.setState({"homePageShowFlag":true}); this.serachEmployeeDetails();}} >
								<BackIcon style={{fontSize: "32px"}}/>
							</Fab>
						</Grid>
						<Grid item style={{"padding":"18px 30px", "fontSize":"20px"}}>
							<span style={{"fontWeight":"bold"}}>Employee ID: </span><span>{this.state.clickedEmployeeID}</span>
						</Grid>
						<Grid item style={{"padding":"18px 30px", "fontSize":"20px"}}>
							<span style={{"fontWeight":"bold"}}>Bill Month: </span><span>{this.state.clickedBillMonth}</span>
						</Grid>
					</Grid>
					<Grid container spacing={2} style={{"padding":"20px", "overflow":"auto"}}>
						<Grid item xs={12} md={4} className={"gridSpaceContainer"}>
							<Grid item xs={12}>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell align="center">Bill No</TableCell>
											<TableCell align="center">Date</TableCell>
											<TableCell align="center">Amount</TableCell>
											<TableCell align="center">Status</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{
											this.state.tableDetailedData.map(row => (
											<TableRow key={row["_id"]} onClick={() => {this.onDetailedRowClick(row)}}
												style={{"cursor":"pointer", "backgroundColor":(this.state.billID === row["_id"] ? "#e8e8e8" : "")}}>
												<TableCell align="right">{row.employee_no}</TableCell>
												<TableCell align="right">{row.bill_date}</TableCell>
												<TableCell align="right">{row.bill_amount}</TableCell>
												<TableCell align="right">{row.bill_status}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Grid>
						</Grid>
						<Grid container item xs={12} md={4} className={"gridSpaceContainer"}>
							<Grid item xs={12}>
								<Grid container className={"gridSpaceForm"}>
									<Grid item xs={7}>
										<label className="popupLabelText">Bill Type:</label>
									</Grid>
									<Grid item xs={5}>
										<Select style={{"padding":"8px"}} disabled={disableEdit}
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
										</Select><br />
										{
											this.state.predictionData.billType ? 
											<label className={"predictionDataLabel"}>
												({this.state.predictionData.billType})
											</label>
											: null
										}
									</Grid>
								</Grid>
								<Grid container className={"gridSpaceForm"}>
									<Grid item xs={7}>
										<label className="popupLabelText">Bill No:</label>
									</Grid>
									<Grid item xs={5}>
										<TextField value={this.state.billNo} disabled={disableEdit}
											onChange={(e) => {this.setState({"billNo": e.currentTarget.value})}}/>
										{
											this.state.predictionData.billNo ? 
											<label className={"predictionDataLabel"}>
												({this.state.predictionData.billNo})
											</label>
											: null
										}
									</Grid>
								</Grid>
								<Grid container className={"gridSpaceForm"}>
									<Grid item xs={7}>
										<label className="popupLabelText">Date:</label>
									</Grid>
									<Grid item xs={5}>
										<TextField value={this.state.billDate} type={"date"} disabled={disableEdit}
											onChange={(e) => {this.setState({"billDate": e.currentTarget.value})}}/>
										{
											this.state.predictionData.billDate ? 
											<label className={"predictionDataLabel"}>
												({this.state.predictionData.billDate})
											</label>
											: null
										}
									</Grid>
								</Grid>
								<Grid container className={"gridSpaceForm"}>
									<Grid item xs={7}>
										<label className="popupLabelText">Amount:</label>
									</Grid>
									<Grid item xs={5}>
										<TextField type="number" value={this.state.billAmount} disabled={disableEdit}
											onChange={(e) => {this.setState({"billAmount": e.currentTarget.value})}}/>
										{
											this.state.predictionData.billAmount ? 
											<label className={"predictionDataLabel"}>
												({this.state.predictionData.billAmount})
											</label>
											: null
										}
									</Grid>
								</Grid>
								<Grid container className={"gridSpaceForm"}>
									<Grid item xs={7}>
										<label className="popupLabelText">Status:</label>
									</Grid>
									<Grid item xs={5}>
										<label className="popupLabelValue">{this.state.billStatus}</label>&nbsp;
									</Grid>
								</Grid> 
								<Grid container className={"gridSpaceForm"} style={{"marginTop":"15px"}}>
									<Grid item xs={7}>
										<label className="popupLabelText">Smart Prediction:</label>
									</Grid>
									<Grid item xs={5}>
										<label>
											{this.state.automlPrediction}
										</label>&nbsp;&nbsp;
										{
											this.state.predictionData.billType ? 
											<label>&nbsp;-&nbsp;
												({this.state.predictionData.billType})
											</label>
											: null
											
										}
										{
											this.state.invoiceDataStatus > 0 ?
											<span onClick={this.openModal} style={{"cursor":"pointer"}}>
												<InfoIcon style={{fill:"#1818c3", "verticalAlign":"text-bottom"}}/>
											</span>
											: null
										}
									</Grid>
								</Grid>
								<Grid container className={"gridSpaceForm"} style={{"marginTop":"25px", "textAlign": "center", "display":(this.state.autoMLStatus.showMessage ? "inline-block" : "none")}}>
									<span style={{"color":(this.state.autoMLStatus.state === "success" ? "green" : "red")}}>
										{this.state.autoMLStatus.message}
									</span>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={12} md={4} className={"gridSpaceContainer"}>
							<Grid item xs={12} style={{"textAlign":"center", "position":"relative", "overflow":"visible"}}>
								<div id="overlay" style={{"display":"none", "backgroundImage":`url(${this.state.billImage})`}} 
									className={"overlayImageView"} onMouseMove={this.zoomInImage}></div>
								<img id="overlayOriginalImage" style={{"maxWidth":"100%", "maxHeight":"500px"}}  onMouseMove={this.zoomInImage} onMouseOut={this.zoomOutImage}
									src={this.state.billImage} alt="Bill"/>
							</Grid>
						</Grid>
					</Grid>
					<Grid item xs={12} style={{"textAlign":"center", "minHeight":"36px"}}>
						<Button variant="contained" color="primary" disabled={this.state.showLoaderImage}
							onClick={(e)=>this.smartVerify(e)} style={{"display":((this.state.invoiceDataStatus === 0) ? "":"none")}}>
							Smart Verify
						</Button>&nbsp;&nbsp;
						<Button variant="contained" color="primary" disabled={this.state.showLoaderImage}
							onClick={(e)=>this.manualVerify(e)} style={{"display":(this.state.invoiceDataStatus > 2 || this.state.invoiceDataStatus === 1 ? "none":"")}}>
							Manual Verify
						</Button>&nbsp;&nbsp;
						<Button variant="contained" color="default" disabled={this.state.showLoaderImage}
							onClick={(e)=>this.rejectForm(e)} style={{"display":(this.state.invoiceDataStatus > 2 || this.state.invoiceDataStatus === 1 ? "none":"")}}>
							Reject
						</Button>&nbsp;&nbsp;
						<button style={{"width":"100px", "height":"36px", "backgroundColor":"transparent", "border":"none", "verticalAlign":"middle"}}>
							<img src={LoaderImg} style={{"width":"25px", "display":(this.state.showLoaderImage ? "" : "none")}} alt={"Loader"}/>
						</button>
					</Grid>
				</Grid>	
				<ToastsContainer store={ToastsStore}/>
				<Dialog onClose={this.closeDialog} aria-labelledby="customized-dialog-title" open={this.state.dialogStatus}>
					<div style={{"position":"absolute", "top":"0px", "right":"0px", "padding":"5px 10px", "cursor":"pointer"}} onClick={this.closeDialog}>
						<span>X</span>
					</div>
					<Grid container style={{"padding":"20px"}}>
						{
							this.state.predictionJSONObject ? 
							<Grid item>
								<div className={"predictionDataHeader"}>AutoML - Clasification</div>
								<div className={"predictionDataValue"}>
									{
										this.state.predictionJSONObject.automl_prediction.payload.map(function(value, index){
											return (<div key={index}>
														<div>
															<label>Name: </label>
															<label>{value.displayName}</label>
														</div>
														<div>
															<label>Score: </label>
															<label>{value.classification.score}</label>
														</div>
													</div>)
										})
									}
								</div>
								<div className={"predictionDataHeader"}>AutoML - Validation</div>
								<div className={"predictionDataValue"}>
									<label>Message: </label>
									<label>{this.state.predictionJSONObject.bill_transaforms.message}</label>
								</div>
								<div className={"predictionDataHeader"}>Vision API Extract</div>
								<div className={"predictionDataValue"}>
									<pre>
										{this.state.predictionJSONObject.vision_response}
									</pre>
								</div>
							</Grid>
							: null
						}
					</Grid>
				</Dialog>
			</Grid>
		);
	}
}

UserProfile.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(UserProfile);
