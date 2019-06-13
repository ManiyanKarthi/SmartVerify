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

class Dashboard extends React.Component {
 
	constructor(props){
		super(props);
		this.state = {billMonth:'', billNO: '', billDate:'', billAmount:''};
		this.state.tableColumns = [{"title":"Month","field":"name","type":"numeric"},{"title":"Bill type","field":"surname","type":"numeric"},{"title":"Bill No","field":"billNo","type":"numeric"},{"title":"Date","field":"Date","type":"date"},{"title":"Amount","field":"Amount","type":"numeric"},{"title":"status","field":"status","type":"numeric"}];
		this.state.tableData = [{"name":"Mehmet","surname":"Baran","billNo":1987,"Date":"26-09-1993","Amount":"","status":"Submitted"},{"name":"Mehmet","surname":"Baran","billNo":1987,"Date":"26-09-1993","Amount":"","status":"Submitted"}];
		this.state.monthData = this.generateBillMonth();

		this._handleImageChange = this._handleImageChange.bind(this);
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

	_handleSubmit(e) {

		e.preventDefault();
		let fetchurl = "http://10.165.7.169:3000/invoice/add" ;
		let paramObj = { 
			bill_no:this.state.billNO,
			bill_date:this.state.billDate,
			bill_amount:this.state.billAmount,
			bill_image:this.state.imagePreviewUrl
		};

		fetch(fetchurl, {
			method: 'POST',
			headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'//application/x-www-form-urlencoded
			},
			body: JSON.stringify(paramObj)
		}).then(data =>{
			console.log(data);
		});
		this.state.table.data.push({billNo: paramObj.bill_no, Date: paramObj.bill_date, Amount: paramObj.bill_amount});
		this.setState({"table":this.state.table});
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

	serachEmployeeDetails(e){
		let _this = this;
		let data = {};
		new FetchApi().serachEmployeeDetails(data, function(data){
			console.log(data);
			_this.setState("tableData", data);
		});
	}

	textUpdate(key, value){
		let obj = {};
		obj[key] = value;
		this.setState(obj);
	}
  
	render() {

		let imagePreviewUrl = this.state.imagePreviewUrl;
		let imagePreview = null;
		if (imagePreviewUrl) {
			imagePreview = (<div className="imgPreview"><img src={imagePreviewUrl} alt={"Select input"}/></div>);
		}

		// <UIFieldsGeneral mapList={uiMap1}/>
		return (
			<Grid container xs={12}>
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
					<MaterialTableDemo columns={this.state.tableColumns} data={this.state.tableData} editable={false}/>
				</Grid>
				<Grid item container xs={6} justify="center" className="UI_Form_Container" style={{"padding":"20px","marginLeft":"25%"}}>
					<Grid item xs={6} style={{"textAlign":"center", padding:"15px"}}>
						<TextField label= {"Bill Month"} value={this.state.billMonth} onChange={(e) => {this.setState({"billMonth": e.currentTarget.value})}}/>
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
						<input className="fileInput" type="file" onChange={(e)=>this._handleImageChange(e)} />
					</Grid>
					<Grid item xs={12} style={{"textAlign":"center"}}>
						{imagePreview}
					</Grid>
					<Grid item xs={12} style={{"textAlign":"center"}}>
						<Button variant="contained" color="primary" onClick={(e)=>this._handleSubmit(e)} >
							Add New Bill
						</Button>
					</Grid>
				</Grid>
			</Grid>
		);
	}
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(Dashboard);
