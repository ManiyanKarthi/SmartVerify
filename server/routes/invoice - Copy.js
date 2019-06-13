var express = require('express');
var router = express.Router();
const automl = require('@google-cloud/automl');
//const automl = require('@google-cloud/automl').v1beta1;
const vision = require('@google-cloud/vision');
const fs = require('fs');
var InvoiceModel = require('../model/invoice.js');
var _ = require('lodash');
var tesseract = require('node-tesseract');
var Tesseract = require('tesseract.js')
const { check, validationResult } = require('express-validator/check');
var base64Img = require('base64-img');
var uniqid = require('uniqid');

/* GET users listing. */
router.get('/', (req, res, next) => {
	//let DB = req.db;
	var DB = req.app.get('dbo');
	InvoiceData = {image:'flooo.jpg',type:8};
	InvoiceModel.InsertInvoice(DB,InvoiceData);
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
  check('bill_no').isLength({ min: 3 }),  
  check('bill_date').isLength({ min: 4 }),
  check('bill_amount').isLength({ min: 1 }),
  check('bill_image').isLength({ min:10 })

], (req, res) => {
	
	console.log(req.body,'req-----innnn--');
  // Finds the validation errors in this request and wraps them in an object with handy functions
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
		let storeage_path = './public/images/invoice';
		/*base64Img.img(base64Data, './public/images/', image_name, function(err, filepath) {
			console.log(filepath,'filepath');
		});*/
		var filepath = base64Img.imgSync(base64Data,storeage_path,image_name);	
			console.log(filepath,'filepath')

	  //bill_image:bill_image_data,
	 var DB = req.app.get('dbo');
	 var bill_date_convert = new Date(req.body.bill_date);
	 InvoiceData = {bill_no:req.body.bill_no,bill_amount:req.body.bill_amount,bill_date:bill_date_convert,image_name:storeage_path,created_at:new Date()};
	 InvoiceModel.InsertInvoice(DB,InvoiceData);
	 res.json({ status:200,message:'Added successfully'});
  }
	 
});

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
  
	   const projectId = 'montgomery-242210';
	   const computeRegion = 'us-central1';
	   const modelId = 'ICN5128000347661266160';
	   const filePath = './public/images/sample_petrol_bill.jpg';
	   const scoreThreshold = '0.6';
	
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
		var DB = req.app.get('dbo');
		InvoiceData = {data:result};
		var datapart = InvoiceModel.InsertInvoice(DB,InvoiceData);
		
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
	
	let img_path = './public/images/sample_petrol_bill2.jpg';
	const [result] = await client.textDetection(img_path);
	const [doc_result] = await client.documentTextDetection(img_path);
	
    const detections = result.textAnnotations;
    console.log('Text:');
	
	const fullTextAnnotation = doc_result.fullTextAnnotation;
	console.log(fullTextAnnotation.text);
	
	/** Insert part */
	var DB = req.app.get('dbo');
	InvoiceData = {text_deduction:result,document_text_deduction:doc_result};
	var datapart = await InvoiceModel.InsertInvoice(DB,InvoiceData);
		
    detections.forEach(text => console.log(text));

	res.json({status:200,data:detections});
	
});

router.get('/check_data', async (req,res,next) => {
	
	var DB = req.app.get('dbo');	
	let invoice_res = await InvoiceModel.FindInvoice(DB,'5cf922ff64c4123ef8cecd84');
	if(invoice_res){
		//console.log(invoice_res);
		//_.lowerCase(invoice_res.data.textAnnotations[0].description)
		var data_store = invoice_res.data.textAnnotations[0].description;
		let search_store = data_store.replace(/\n/g, " ");
		console.log(search_store,'search_store---->');
		var search_rate = search_store.search(/rate/i);
		var search_volume = search_store.search(/volume/i);
		var search_price = search_store.search(/rs/i);
		
		//var regex = /\d+/g; //int value
		var regex = /\d+(\.\d+)?/g; //float value
		var string = "you can enter maximum 500.50 choices";
		var matches = string.match(regex);
		console.log(matches,'matches----->');
		
		let volume_data = search_store.substr(search_volume,10);
		//let volume_data = search_store.substr(search_volume,10);
		
		console.log(search_rate,'search_rate','search_volume',search_volume,'volume_data',volume_data);
		console.log(invoice_res.data.textAnnotations[0].description);
	}
	
	res.json({status:200,data:invoice_res});
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
