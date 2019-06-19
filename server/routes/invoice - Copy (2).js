var express = require('express');
var router = express.Router();
const automl = require('@google-cloud/automl');
//const automl = require('@google-cloud/automl').v1beta1;
const vision = require('@google-cloud/vision');
const fs = require('fs');
var InvoiceModel = require('../model/invoice.js');
var CommonModel = require('../model/common.js');
var _ = require('lodash');
var tesseract = require('node-tesseract');
var Tesseract = require('tesseract.js')
const { check, validationResult } = require('express-validator/check');
var base64Img = require('base64-img');
var uniqid = require('uniqid');

const projectId = 'montgomery-242210';
const computeRegion = 'us-central1';
const modelId = 'ICN5128000347661266160';
const filePath = './public/images/sample_petrol_bill.jpg';
const scoreThreshold = '0.6';
const storeage_path = './public/images/invoice';

/* GET users listing. */
router.get('/', (req, res, next) => {
	//let DB = req.db;
	//var DB = req.app.get('dbo');
	InvoiceData = {image:'flooo.jpg',type:8};
	InvoiceModel.InsertInvoice(InvoiceData);
	DB.collection("invoice").findOne({}, function(err, result) {
		if (err) throw err;
		console.log(result);    
	});
  res.send('respond with a resource');
});

/* GET users listing. */
router.post('/add1', (req, res, next) => {
	//let DB = req.db;
	req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('bandwidth', 'Bandwidth is required').notEmpty();

   var errors = req.validationErrors();
   if(errors){
	   console.log(errors,'errors--->');
	   
    res.status(422).json({ errors: errors.array() });
   }else{
	   console.log('errors no----');
   }
  res.send('respond with a resource');
});

router.post('/add', [
  check('employee_no').isLength({ min: 3,max:10}),  
  check('bill_no').isLength({ min: 3,max:20 }),  
  check('bill_date').isLength({ min: 4,max:30 }),
  check('bill_amount').isLength({ min: 1,max:10 }),
  check('bill_image').isLength({ min:10}),
  check('bill_type').isLength({ min:1})
], (req, res) => {	
	//console.log(req.body,'req-----innnn--'); 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
	  //res.status(422)
     res.json({ status:422,errors: errors.array() });
  }else{
	  //console.log(req.body);
	    var base64Data = req.body.bill_image;
		/*base64Data = base64Data.replace(/^data:image\/png;base64,/, "");
		require("fs").writeFile("./public/images/out.jpg", base64Data, 'base64', function(err) {
		  console.log(err);
		});*/
		let image_name = uniqid();
		
		/*base64Img.img(base64Data, './public/images/', image_name, function(err, filepath) {
			console.log(filepath,'filepath');
		});*/
		var filepath = base64Img.imgSync(base64Data,storeage_path,image_name);
		let image_ext = filepath.split('.').pop();
		var act_image_name = image_name+'.'+image_ext;
			console.log(filepath,'filepath',image_ext)
	  
	 var bill_date_convert = new Date(req.body.bill_date);
	 InvoiceData = {employee_no:parseInt(req.body.employee_no),bill_type:parseInt(req.body.bill_type),bill_no:req.body.bill_no,bill_amount:req.body.bill_amount,bill_date:bill_date_convert,image_name:act_image_name,created_at:new Date(),verify_status:0};
	 InvoiceModel.InsertInvoice(InvoiceData);
	 res.json({ status:200,message:'Success'});
  }  
  //verify_status - 0 (submitted), 1 (smart verify success), 2 (smart verify failed), 3 (manual verify), 4 (rejected), bill type - 1 (fuel), 2 (toll)	 
});

router.get('/getinvoices', async (req, res, next) => {	
		let emp_id = req.query.emp_id;
		let from = req.query.from;
		let limit = req.query.limit;
		let month_year = req.query.month_year;
		var filter_query = {emp_id:emp_id,from:from,limit:limit,month_year:month_year};
		let invoice_list = await InvoiceModel.GetInvoices(filter_query,0);
		let invoice_total = await InvoiceModel.GetInvoices(filter_query,1);
		
		invoice_list.forEach(function(part, index, theArray) {
			//console.log(theArray[index].bill_type,'theArray.bill_type');
			if(theArray[index].bill_type==1){
				theArray[index].bill_type = 'Fuel';
			}else if(theArray[index].bill_type==2){
				theArray[index].bill_type = 'Toll';
			}else{
				theArray[index].bill_type = 'Other';
			}
			let month_num_arr = theArray[index].created_month.split('-');
			let bill_mon = getMonthName(month_num_arr[0]);
			theArray[index].bill_month = ` ${bill_mon} - ${month_num_arr[1]}`;
		});
		//console.log('invoice_list ----',invoice_list);
		if(invoice_list.length){
			res.json({ status:200,invoice_total:invoice_total,invoices:invoice_list});
		}else{
			res.json({ status:202,message:'No data found'});
		}	   
});

function getMonthName(month_num){
	//console.log(month_num);
	let int_month_num = parseInt(month_num) - 1;
	const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
	return monthNames[int_month_num];
}

router.post('/smart-verify',[
	check('employee_no').isLength({ min: 3,max:10}), 
	check('bill_image').isLength({ min:10})  
  ], async (req, res) => {	
	//console.log(req.body,'req-----innnn--'); 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
	  //res.status(422)
     res.json({ status:422,errors: errors.array() });
  }else{
	  
	  var Orgbase64Data = req.body.bill_image;
	  var base64Data = req.body.bill_image.replace(/^data:image\/[a-z]+;base64,/, "");
	  const client = new automl.PredictionServiceClient();
	  const modelFullId = client.modelPath(projectId, computeRegion, modelId);
	  const params = {};	 
	  if (scoreThreshold) {
		params.score_threshold = scoreThreshold;
	  }
	  const payload = {};
	  payload.image = {imageBytes: base64Data};
	  const [response] = await client.predict({
		name: modelFullId,
		payload: payload,
		params: params,
	  });
	  console.log(`Prediction results:`);
	  var bill_type =1;
	  console.log('---',response.payload[0].displayName,'displayName',response.payload[0].classification.score);
	  if(response.payload[0].displayName && response.payload[0].classification.score){		  
		  if(response.payload[0].classification.score>8){			  
			  if(response.payload[0].displayName=='FuelBill'){
				  bill_type = 1;
			  }else if(response.payload[0].displayName=='TollBill'){
				  bill_type = 2;
			  }
		  }			  
	  }else{
		  bill_type = 3;
	  }
		
	/*
	  response.payload.forEach(result => {
		console.log(result);
		console.log(`Predicted class name: ${result.displayName}`);
		console.log(`Predicted class score: ${result.classification.score}`);		
	  }); */
	  
	  let image_name = uniqid();		
	  var filepath = base64Img.imgSync(Orgbase64Data,storeage_path,image_name);
	  let image_ext = filepath.split('.').pop();
	  var act_image_name = image_name+'.'+image_ext;
	  console.log(filepath,'filepath',image_ext)
	  let img_path = storeage_path+'/'+act_image_name;
	  const client_detection = new vision.ImageAnnotatorClient();
	  const [doc_result] = await client_detection.documentTextDetection(img_path);
	  const fullTextAnnotation = doc_result.fullTextAnnotation;	  
	  var bill_area = doc_result.textAnnotations[0].description;	  
	  //console.log(fullTextAnnotation.text);
	  let bill_transaforms = getTransformData(bill_type,bill_area);
	  
	  //{bill_number:bill_number,net_sales:net_sales,bill_date:bill_date};
	  var unixTimeZero = Date.parse(bill_transaforms.bill_date);
	  var billed_format_date,billed_amount;
	  let billed_disp_date='';
	  if(unixTimeZero && unixTimeZero>0){
			billed_format_date = new Date(unixTimeZero);
			billed_disp_date = UnixTimeToDate(unixTimeZero);
	  }
	
	  if(!isNaN(bill_transaforms.net_sales)){
		  billed_amount = bill_transaforms.net_sales;
	  }else{
		  billed_amount = 0;
	  }
	  //var bill_date_convert = new Date(bill_transaforms.bill_date);
	  InvoiceData = {employee_no:parseInt(req.body.employee_no),bill_type:bill_type,bill_no:bill_transaforms.bill_number,bill_amount:billed_amount,image_name:act_image_name,created_at:new Date(),verify_status:1,bill_transaforms:bill_transaforms,automl_prediction:response,vision_response:doc_result};
	  
	  if(billed_format_date){
		  InvoiceData.bill_date = billed_format_date;
	  }
	  
	  let invoice_id = await InvoiceModel.InsertInvoice(InvoiceData); 	  
	  let prediction_data = {invoice_id:invoice_id,date:billed_disp_date,billed_amount:billed_amount,bill_number:bill_transaforms.bill_number,bill_type:bill_type};	  
	  res.json({ status:200,message:'Smart verify successfully',prediction_data:prediction_data});	  
  }
  
  });
  
function UnixTimeToDate(timelist){	
	var today = new Date(timelist);
	var dd = today.getDate();
	var mm = today.getMonth() + 1; //January is 0!
	var yyyy = today.getFullYear();
	if (dd < 10) {
	  dd = '0' + dd;
	} 
	if (mm < 10) {
	  mm = '0' + mm;
	} 
	var exact_date = dd + '-' + mm + '-' + yyyy;
	return exact_date;	
}  

function getTransformData(bill_type,bill_area){
	
		var data_store = bill_area;	
		var search_store = data_store.replace(/\n/g, " ");
		//console.log(search_store,'search_store---->');
		let search_rate = search_store.search(/rate/i);
		let search_volume = search_store.search(/volume/i);
		let search_price = search_store.search(/rs/i);		
		let search_bill_no = data_store.search(/bill no/i);
		let search_invoice_no = data_store.search(/invoice no/i);
		let search_receipt_no = data_store.search(/receipt no/i);
		let search_sale = data_store.search(/sale/i);
		let search_amount = data_store.search(/amount/i);		
		
		var invoice_text_value,bill_text_value,receipt_text_value;
		if(search_invoice_no > 0){
			var invoice_text_length = data_store.substr(search_invoice_no,20);
			let search_invoice_line = invoice_text_length.search('\n');			
			if(search_invoice_line){
				//console.log(search_invoice_line,'search_invoice_line---')
				invoice_text_length = data_store.substr(search_invoice_no,search_invoice_line);
			}
			let invoice_number = invoice_text_length.replace(/invoice no/ig, '');
			invoice_text_value = invoice_number.replace(':', "");			
			console.log(invoice_text_value,'<----invoice_text_value----->\n');			
		}
		
		if(search_bill_no  > 0){
			var bill_text_length = data_store.substr(search_bill_no,20);
			let search_bill_line = bill_text_length.search('\n');			
			if(search_bill_line){
				//console.log(search_bill_line,'search_bill_line---')
				bill_text_length = data_store.substr(search_bill_no,search_bill_line);
			}
			let bill_number = bill_text_length.replace(/bill no/ig, '');
			bill_text_value = bill_number.replace(':', "");
			//var invoice_text = data_store.substr(10,20);
			//var invoice_text = data_store.slice(search_invoice_no, 5)
			//var rest = invoice_text.substring(0, invoice_text.lastIndexOf("\n"));
			console.log(bill_text_value,'<....bill_text_length......>\n');
		}
		
		if(search_receipt_no > 0){
			var receipt_text_length = data_store.substr(search_receipt_no,20);
			let search_receipt_line = receipt_text_length.search('\n');			
			if(search_receipt_line){
				//console.log(search_invoice_line,'search_invoice_line---')
				receipt_text_length = data_store.substr(search_receipt_no,search_receipt_line);
			}
			let receipt_number = receipt_text_length.replace(/receipt no/ig, '');
			receipt_text_value = receipt_number.replace(':', "");			
			console.log(receipt_text_value,'<----invoice_text_value----->\n');			
		}
		
		var bill_number ='';
		if(invoice_text_value){
			console.log(invoice_text_value,'invoice_text_value');
			bill_number = invoice_text_value;
		}else if(bill_text_value){
			console.log(bill_text_value,'bill_text_value');
			bill_number = bill_text_value;
		}else if(receipt_text_value){
			console.log(receipt_text_value,'receipt_text_value');
			bill_number = receipt_text_value;
		}
		
		var fuel_sales=0,fuel_amount =0;
		if(search_sale){
			var invoice_sale_text = data_store.substr(search_sale,20);
			console.log('invoice_sale_text---',invoice_sale_text,'-----\n');
			let search_sale_line = invoice_sale_text.search('\n');
			if(search_sale_line){				
				invoice_sale_text = data_store.substr(search_sale,search_sale_line);
				//console.log(invoice_sale_text,'invoice_sale_text---');
			}			
			//invoice_sale_text = invoice_sale_text.replace(/rs./ig, '');
			var sale_regex = /\d+(\.\d+)?/g; //float value			
			var sale_matches = invoice_sale_text.match(sale_regex);
			console.log(sale_matches,'<---sale_matches----->\n');
			if(sale_matches && sale_matches.length){
				var fuel_sales = sale_matches[0];
				console.log(fuel_sales,'fuel_sales');
			}
		}
		
		if(search_amount){
			var invoice_amount_text = data_store.substr(search_amount,20);
			console.log('invoice_amount_text---',invoice_amount_text,'-----\n');
			let search_amount_line = invoice_amount_text.search('\n');
			if(search_amount_line){				
				invoice_amount_text = data_store.substr(search_amount,search_amount_line);
				//console.log(invoice_amount_text,'invoice_amount_text---');
			}			
			//invoice_sale_text = invoice_sale_text.replace(/rs./ig, '');
			var sale_regex = /\d+(\.\d+)?/g; //float value			
			var amount_matches = invoice_amount_text.match(sale_regex);
			console.log(amount_matches,'amount_matches----->');
			if(amount_matches && amount_matches.length){
				var fuel_amount = amount_matches[0];
				console.log(amount_matches,'amount_matches');
			}
		}
		
		var net_sales=0;
		if(fuel_amount > fuel_sales){			
			net_sales = fuel_amount;
		}else if(fuel_sales>0){
			net_sales = fuel_sales;
		}		
		
		//var str="some text 2012-01-01 some more text here 01-01-20 01-Mar-2020"; 
		var pattern=/[0-9][0-9][0-9][0-9][./-][0-9][0-9][./-][0-9][0-9]/gi; //2012-01-01
		var pattern2=/[0-9][0-9][./-][0-9][0-9][./-][0-9][0-9][0-9][0-9]/gi; //01-01-2012
		var pattern3=/[0-9][0-9][./-][a-zA-Z][a-zA-Z][a-zA-Z][./-][0-9][0-9][0-9][0-9]/gi; //01-Mar-2020
		var pattern4=/[0-9][0-9][./-][0-9][0-9][./-][0-9][0-9]/gi; //01-01-20
		//console.log(data_store.match(pattern2));
		var date_match = data_store.match(pattern2);
		var date_match2 = data_store.match(pattern3);
		
		var bill_date = '';
		if(date_match && date_match.length>0){
			bill_date = date_match[0];
			var date_str = bill_date;
			console.log(date_str,'date_str');
			var date_arr = date_str.split(/[./-]+/);
			bill_date = date_arr[2]+'-'+date_arr[1]+'-'+date_arr[0];
		}else if(date_match2 && date_match2.length>0){
			bill_date = date_match2[0];	
			var date_arr = bill_date.split(/[./-]+/);
			var date_obj = new Date(bill_date);
			console.log(date_obj);
			let month_date = (date_obj.getMonth() + 1);
			bill_date = date_arr[2]+'-'+month_date+'-'+date_arr[0];						
		}else{
			var date_match3 = data_store.match(pattern);
			var date_match4 = data_store.match(pattern4);
			if(date_match3 && date_match3.length >0 ){
				bill_date = date_match3[0];
			}else if(date_match4 && date_match4.length >0){
				bill_date = date_match4[0];
				var date_str = bill_date;
				var date_arr = date_str.split(/[./-]+/);
				bill_date = '20'+date_arr[2]+'-'+date_arr[1]+'-'+date_arr[0];
			}
		}		
		var reconization_data = {bill_number:bill_number,net_sales:net_sales,bill_date:bill_date};
		console.log(reconization_data,'bill data---');
		return reconization_data;	
}
   

router.get('/verify-invoice', async (req, res, next) => {
	
	  const client = new automl.PredictionServiceClient();
	  
	  /**
	   * TODO(developer): Uncomment the following line before running the sample.
	   */
	  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
	  // const computeRegion = `region-name, e.g. "us-central1"`;
	  // const modelId = `id of the model, e.g. “ICN723541179344731436”`;
	  // const filePath = `local text file path of content to be classified, e.g. "./resources/flower.png"`;
	  // const scoreThreshold = `value between 0.0 and 1.0, e.g. "0.5"`;   
	
	  const modelFullId = client.modelPath(projectId, computeRegion, modelId);
 
	  // Read the file content for prediction.
	  const content = fs.readFileSync(filePath, 'base64');
	  
	  //console.log(content); return false;
	 
	  const params = {};
	 
	  if (scoreThreshold) {
		params.score_threshold = scoreThreshold;
	  }
	 
	  // Set the payload by giving the content and type of the file.
	  const payload = {};
	  payload.image = {imageBytes: content};
	 
	  // params is additional domain-specific parameters.
	  // currently there is no additional parameters supported.
	  const [response] = await client.predict({
		name: modelFullId,
		payload: payload,
		params: params,
	  });
	  console.log(`Prediction results:`);
	  response.payload.forEach(result => {
		  console.log(result);
		console.log(`Predicted class name: ${result.displayName}`);
		console.log(`Predicted class score: ${result.classification.score}`);
		
		/** Insert part */
		//var DB = req.app.get('dbo');
		InvoiceData = {data:result};
		var datapart = InvoiceModel.InsertInvoice(InvoiceData);
		
		res.json({status:200,data:result});
	  });
  
  //res.send('respond with a resource');
});

router.get('/detect-document',async (req, res, next) => {
	
	const client = new vision.ImageAnnotatorClient();
	
	//const [result] = await client.labelDetection('./public/images/sample_petrol_bill.jpg');
	//const labels = result.labelAnnotations;
	//console.log('Labels:');
	//labels.forEach(label => console.log(label.description));
	
	let img_path = './public/images/toll2.jpg';
	//const [result] = await client.textDetection(img_path);
	const [doc_result] = await client.documentTextDetection(img_path);
	
    //const detections = result.textAnnotations;
    //console.log('Text:');
	
	const fullTextAnnotation = doc_result.fullTextAnnotation;
	console.log(fullTextAnnotation.text);
	
	/** Insert part */
	//var DB = req.app.get('dbo');text_deduction:result,
	InvoiceData = {document_text_deduction:doc_result};
	var datapart = await InvoiceModel.InsertInvoiceRef(InvoiceData);
		
    //detections.forEach(text => console.log(text));

	res.json({status:200,data:fullTextAnnotation});
	
});

router.get('/check_data', async (req,res,next) => {
	
	//var DB = req.app.get('dbo');	
	let invoice_res = await InvoiceModel.FindInvoice('5cfa7653c4b9013078189ce6');
	if(invoice_res){
		//console.log(invoice_res);
		//_.lowerCase(invoice_res.data.textAnnotations[0].description)
		var data_store = 'HP AUTO CARE CENTRE\nHPCL,S.NO:76/1, IPCOT\nUSERI,EGATTUR VILLAGE\nRUPORUR TALUK,KANCHI\nORIGINAL\n20-FEB-2019 10:43:16\nTXN NO : 9022017327\nINVOICE NO: 76017\nVEHICLE NO : NOT ENTERED\n**\n** ******\nNOZZLE NO : 2\nPRODUCT: POWER\nDENSITY: 748.7 kg/m3\nRATE : 76.81 INR/Ltr\nVOLUME: 4.50 Ltr\nAMOUNT: 345.64 INR\nThank You! Visit Again\n';//invoice_res.document_text_deduction.textAnnotations[0].description;
		//var data_store = invoice_res.data.textAnnotations[0].description;
		let search_store = data_store.replace(/\n/g, " ");
		//console.log(search_store,'search_store---->');
		let search_rate = search_store.search(/rate/i);
		let search_volume = search_store.search(/volume/i);
		let search_price = search_store.search(/rs/i);	
		
		let search_bill_no = data_store.search(/bill no/i);
		let search_invoice_no = data_store.search(/invoice no/i);
		let search_receipt_no = data_store.search(/receipt no/i);
		let search_sale = data_store.search(/sale/i);
		let search_amount = data_store.search(/amount/i);		
		
		var invoice_text_value,bill_text_value,receipt_text_value;
		if(search_invoice_no > 0){
			var invoice_text_length = data_store.substr(search_invoice_no,20);
			let search_invoice_line = invoice_text_length.search('\n');			
			if(search_invoice_line){
				//console.log(search_invoice_line,'search_invoice_line---')
				invoice_text_length = data_store.substr(search_invoice_no,search_invoice_line);
			}
			let invoice_number = invoice_text_length.replace(/invoice no/ig, '');
			invoice_text_value = invoice_number.replace(':', "");			
			console.log(invoice_text_value,'<----invoice_text_value----->\n');			
		}
		
		if(search_bill_no  > 0){
			var bill_text_length = data_store.substr(search_bill_no,20);
			let search_bill_line = bill_text_length.search('\n');			
			if(search_bill_line){
				//console.log(search_bill_line,'search_bill_line---')
				bill_text_length = data_store.substr(search_bill_no,search_bill_line);
			}
			let bill_number = bill_text_length.replace(/bill no/ig, '');
			bill_text_value = bill_number.replace(':', "");
			//var invoice_text = data_store.substr(10,20);
			//var invoice_text = data_store.slice(search_invoice_no, 5)
			//var rest = invoice_text.substring(0, invoice_text.lastIndexOf("\n"));
			console.log(bill_text_value,'<....bill_text_length......>\n');
		}
		
		if(search_receipt_no > 0){
			var receipt_text_length = data_store.substr(search_receipt_no,20);
			let search_receipt_line = receipt_text_length.search('\n');			
			if(search_receipt_line){
				//console.log(search_invoice_line,'search_invoice_line---')
				receipt_text_length = data_store.substr(search_receipt_no,search_receipt_line);
			}
			let receipt_number = receipt_text_length.replace(/receipt no/ig, '');
			receipt_text_value = receipt_number.replace(':', "");			
			console.log(receipt_text_value,'<----invoice_text_value----->\n');			
		}
		
		var bill_number ='';
		if(invoice_text_value){
			console.log(invoice_text_value,'invoice_text_value');
			bill_number = invoice_text_value;
		}else if(bill_text_value){
			console.log(bill_text_value,'bill_text_value');
			bill_number = bill_text_value;
		}else if(receipt_text_value){
			console.log(receipt_text_value,'receipt_text_value');
			bill_number = receipt_text_value;
		}
		
		var fuel_sales=0 , fuel_amount =0;
		if(search_sale){
			var invoice_sale_text = data_store.substr(search_sale,20);
			console.log('invoice_sale_text---',invoice_sale_text,'-----\n');
			let search_sale_line = invoice_sale_text.search('\n');
			if(search_sale_line){				
				invoice_sale_text = data_store.substr(search_sale,search_sale_line);
				//console.log(invoice_sale_text,'invoice_sale_text---');
			}			
			//invoice_sale_text = invoice_sale_text.replace(/rs./ig, '');
			var sale_regex = /\d+(\.\d+)?/g; //float value			
			var sale_matches = invoice_sale_text.match(sale_regex);
			console.log(sale_matches,'<---sale_matches----->\n');
			if(sale_matches && sale_matches.length){
				fuel_sales = sale_matches[0];
				console.log(fuel_sales,'fuel_sales');
			}
		}
		//console.log(search_amount,'search_amount');
		if(search_amount){
			var invoice_amount_text = data_store.substr(search_amount,20);
			console.log('invoice_amount_text---',invoice_amount_text,'-----\n');
			let search_amount_line = invoice_amount_text.search('\n');
			if(search_amount_line){				
				invoice_amount_text = data_store.substr(search_amount,search_amount_line);
				console.log(invoice_amount_text,'invoice_amount_text---');
			}			
			//invoice_sale_text = invoice_sale_text.replace(/rs./ig, '');
			var sale_regex = /\d+(\.\d+)?/g; //float value			
			var amount_matches = invoice_amount_text.match(sale_regex);
			console.log(amount_matches,'amount_matches----->');
			if(amount_matches && amount_matches.length){
				//fuel_amount = parseFloat(amount_matches[0]);
				fuel_amount = amount_matches[0];
				console.log(amount_matches,'amount_matches');
			}
		}
		console.log(fuel_amount,'fuel_amount >',fuel_sales,'fuel_sales > ');	
		
		var net_sales=0;
		if(fuel_amount > fuel_sales){
				
			net_sales = fuel_amount;
		}else if(fuel_sales>0){
			net_sales = fuel_sales;
		}		
		
		//var str="some text 2012-01-01 some more text here 01-01-20 01-Mar-2020"; 
		var pattern=/[0-9][0-9][0-9][0-9][./-][0-9][0-9][./-][0-9][0-9]/gi; //2012-01-01
		var pattern2=/[0-9][0-9][./-][0-9][0-9][./-][0-9][0-9][0-9][0-9]/gi; //01-01-2012
		var pattern3=/[0-9][0-9][./-][a-zA-Z][a-zA-Z][a-zA-Z][./-][0-9][0-9][0-9][0-9]/gi; //01-Mar-2020
		var pattern4=/[0-9][0-9][./-][0-9][0-9][./-][0-9][0-9]/gi; //01-01-20
		//console.log(data_store.match(pattern2));
		var date_match = data_store.match(pattern2);
		var date_match2 = data_store.match(pattern3);
		
		var bill_date = '';
		if(date_match && date_match.length>0){
			bill_date = date_match[0];
		}else if(date_match2 && date_match2.length>0){
			bill_date = date_match2[0];			
		}else{
			var date_match3 = data_store.match(pattern);
			var date_match4 = data_store.match(pattern4);
			if(date_match3 && date_match3.length >0 ){
				bill_date = date_match3[0];
			}else if(date_match4 && date_match4.length >0){
				bill_date = date_match4[0];
			}
		}
		
		var reconization_data = {bill_number:bill_number,net_sales:net_sales,bill_date:bill_date};
		console.log(reconization_data,'bill data---');
		
		//*** Primary key factor in Fuel bills **/
		let search_nozzle_no = search_store.search(/nozzle no/i);
		let search_fuel = search_store.search(/fuel/i);
		let search_petrol = search_store.search(/petrol/i);
		let search_diesel = search_store.search(/diesel/i);
		
		//var regex = /\d+/g; //int value
		/*var regex = /\d+(\.\d+)?/g; //float value
		var string = "you can enter maximum 500.50 choices 30.5 ";
		var matches = string.match(regex);
		console.log(matches,'matches----->');
		var dateReg = /^\d{2}[./-]\d{2}[./-]\d{4}$/;
		var dateReg2 = /^\d{2}-\d{2}-\d{4}$/;
		var dateReg3 = /^(\d{4}([.\-/ ])\d{2}\2\d{2}|\d{2}([.\-/ ])\d{2}\3\d{4})$/;		
		var dateReg4 = /\d{2}([.\-/ ])\d{2}\1\d{4}/;
		var dateReg5 = /\d{2}([.\-/ ])\d{2}\1\d{2}/;		
		var dateReg6 = /\d{2}-\[a-zA-Z]{3}-\d{4}/;		
		var date_string = 'This is test date on 12/05/20 test 12-MAR-2018';	
		var bill_date = date_string.match(dateReg6);
		console.log(bill_date,'<----------bill_date---\n');*/
		
		/*var search_volume_data,search_rate_data,search_price_data,search_amount_data,search_bill_no_data='';		
		if(search_volume)
			var search_volume_data = search_store.substr(search_volume,20);
		if(search_rate)
			var search_rate_data = search_store.substr(search_rate,20);
		if(search_price)
			var search_price_data = search_store.substr(search_price,20);
		if(search_amount)
			var search_amount_data = search_store.substr(search_amount,20);
		if(search_bill_no)
			var search_bill_no_data = search_store.substr(search_bill_no,20);
		
		console.log('search_volume_data--',search_volume_data,'search_rate_data--',search_rate_data,'search_price_data--',search_price_data,'search_amount_data--',search_amount_data,'search_bill_no_data---',search_bill_no_data);
		
		console.log(search_rate,'search_rate','search_volume',search_volume,'volume_data',search_volume);*/
		console.log(data_store);
	}
	
	res.json({status:200,data:invoice_res});
})

router.get('/check_toll_data', async (req,res,next) => {
	
	//var DB = req.app.get('dbo');	
	let invoice_res = await InvoiceModel.FindInvoice('5cfa7653c4b9013078189ce6');
	//if(invoice_res){
		//console.log(invoice_res);
		//_.lowerCase(invoice_res.data.textAnnotations[0].description)
		var data_store = 'National Highway Authority Of India\nSU TOLL ROAD LTD\nGST-33AAKCS7150GIZC\nSAC-996749\nToll Plaza Name : Nathakkarai\n| KM 73-760 NH-79\nSection\nKM45+765 To KM91+217\nTicket No : 1646231\nBooth & Operator: L7 rdinesh\nDate & Time 04/06/2019 05:37:00 PM\nVehicle No. TNO1AW8316\nType of Vehicle : Car/Jeep\nType of Journey : Single Journey\nFee\n: Rs.50.00\nOnly for overloaded vehicle\nStandard wt. of vehicle : 7875 kg.\nActual wt. of vehicle : 830 kg,\nOverloaded vehicle Fees : Rs.0.00\nHave a nice journey\nEmergency number: 9344779100\nScanned with\nCamScanner\n';//invoice_res.document_text_deduction.textAnnotations[0].description;
		//var data_store = invoice_res.data.textAnnotations[0].description;
		
		let toll_transform_bill = await CommonModel.DetectTollBill(data_store);
	//}
	
	res.json({status:200,data:toll_transform_bill});
})
 

router.get('/tesseract_bill_reconization', async (req,res,next) => {
	
	/*tesseract.process('./public/images/sample_petrol_bill.jpg',function(err, text) {
		if(err) {
			console.error(err);
		} else {
			console.log(text);
		}
	});*/
	
	let myImage = './public/images/sample_petrol_bill.jpg';
	Tesseract.recognize(myImage)
       .progress(function  (p) { console.log('progress', p)    })
       .then(function (result) { console.log('result', result) })
	   
	res.json({status:200,data:'ressss'});
})


module.exports = router;
