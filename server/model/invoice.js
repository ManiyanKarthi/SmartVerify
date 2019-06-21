var mongo = require('mongodb');
var db = require('../config/dbconnection');
var ObjectID = require('mongodb').ObjectID;

exports.InsertInvoice = (InvoiceData)=> {
	return new Promise( (resolve, reject) => {
		db.get().collection('invoice').insertOne(InvoiceData,(err, res)=> {
		if (err){
			console.log('err InsertInvoice',err);
			reject(err);
		}else{
			console.log("1 document inserted");			
			resolve(res.insertedId);
		}
		});
	})
};

exports.UpdateInvoice = (invoice_id,InvoiceData)=> {
	return new Promise( (resolve, reject) => {
		db.get().collection('invoice').updateOne({_id:ObjectID(invoice_id)},{$set:InvoiceData},(err, res)=> {
		if (err){
			console.log('err InsertInvoice',err);
			reject(err);
		}else{
			console.log("1 document updated");			
			resolve(res.insertedId);
		}
		});
	})
};

exports.InsertInvoiceRef = (InvoiceData)=> {
	return new Promise( (resolve, reject) => {
		db.get().collection('invoice_copy').insertOne(InvoiceData,(err, res)=> {
		if (err){
			console.log('err InsertInvoiceRef',err);
			reject(err);
		}else{
			console.log("1 document inserted");			
			resolve(res.insertedId);
		}
		});
	})
};

exports.FindInvoice = (Id)=> {
	var o_id = new mongo.ObjectID(Id);
	return new Promise( (resolve, reject) => {
		db.get().collection('invoice_copy').findOne({_id:o_id},(err, res)=> {
		if (err)
			reject(err);
		else					
			resolve(res);
		});
	})
};

exports.GetInvoices = (filter_query,getCount)=> {
	
	if(filter_query.emp_id && filter_query.emp_id > 0){
		var match_cond = {employee_no: parseInt(filter_query.emp_id) };
	}else{
		var match_cond = {employee_no: { $gt: 0 } };
	}
	
	if(filter_query.from && filter_query.from > 0){
		var from_data = filter_query.from;
	}else{
		var from_data = 0;
	}
	
	if(filter_query.limit && filter_query.limit > 0){
		var limit_data = filter_query.limit;
	}else{
		var limit_data = 10;
	}
	
	if(filter_query.month_year){		
		var month_year_arr = filter_query.month_year.split(/[./-]+/);
		var month_year_frm = new Date(`${month_year_arr[1]}-${month_year_arr[0]}-01`);
		var month_year_to = new Date(`${month_year_arr[1]}-${month_year_arr[0]}-31`);
		console.log(month_year_to,'month_year',month_year_frm);
		match_cond['bill_date'] = {$gte:month_year_frm,$lte:month_year_to};		
	}
	
	//console.log(match_cond,'match_cond');
	
	return new Promise( (resolve, reject) => {
		if(getCount==0){
					db.get().collection('invoice').aggregate([
						 { $match: match_cond },
						 { $project: { _id:0,invoice_id: "$_id",bill_no:'$bill_no',bill_amount:'$bill_amount',bill_date:{ $dateToString: { format: "%d-%m-%Y", date: "$bill_date",timezone: 'Asia/Kolkata'} },created_month:{ $dateToString: { format: "%m-%Y", date: "$created_at",timezone: 'Asia/Kolkata'} },bill_type:'$bill_type',verify_status:'$verify_status'
									   //bill_category:{ $cond: { if: { $gt: [ "$bill_type", 1 ] }, then: 'Fuel bill', else: 'Toll bill' } } 
									 } },
						 { $sort: { invoice_id: -1 } }
					     //{ $skip: parseInt(from_data) },
						 //{ $limit: parseInt(limit_data) },
					]).toArray(function(err, invoice_result) 	{							
							if(err){
								console.log(err,'err---'); //reject(err);
								resolve([]);
							}else{
								//console.log(res,'res---->');
								resolve(invoice_result);
							}
					});
		}else{			
					db.get().collection('invoice').aggregate([
						 { $match: match_cond },
						 { $group: { _id: null, count: { $sum: 1 } } }				
					]).toArray(function(err, invoice_result) 	{							
							if(err){
								console.log(err,'err---'); //reject(err);
								resolve(0);
							}else{
								console.log(invoice_result,'count res---->');
								resolve(invoice_result[0].count);
							}
					});			
		}
	})
};

////verify_status - 0 (submitted), 1 (smart verify success), 2 (smart verify failed), 3 (manual verify), 4 (rejected), bill type - 1 (fuel), 2 (toll)
exports.getInvoiceMonthWise = (filter_query) => {
	
	var match_cond = { bill_date:{$exists: true}};
	if(filter_query.emp_id && filter_query.emp_id > 0){
		match_cond['employee_no'] = parseInt(filter_query.emp_id);
	}	
	if(filter_query.month_year){		
		var month_year_arr = filter_query.month_year.split(/[./-]+/);
		var month_year_frm = new Date(`${month_year_arr[1]}-${month_year_arr[0]}-01`);
		var month_year_to = new Date(`${month_year_arr[1]}-${month_year_arr[0]}-31`);
		//console.log(month_year_to,'month_year',month_year_frm);
		match_cond['bill_date'] = {$gte:month_year_frm,$lte:month_year_to};		
	}
	//console.log(match_cond,'match_cond');
	
	return new Promise( (resolve, reject) => {
		db.get().collection('invoice').aggregate([
			{$match	: match_cond },
			{$project : {
				employee_no:"$employee_no",				
				month : {$month : "$bill_date"}, 
				year : {$year :  "$bill_date"},
				submitted:{$cond: { if: { $eq: [ "$verify_status",0] }, then: 1, else: 0 }},
				smart_verified_success:{$cond: { if: { $eq: [ "$verify_status",1] }, then: 1, else: 0 }},
				smart_verified_failed:{$cond: { if: { $eq: [ "$verify_status",2] }, then: 1, else: 0 }},
				manual_verified:{$cond: { if: { $eq: [ "$verify_status",3] }, then: 1, else: 0 }},
				rejected:{$cond: { if: { $eq: [ "$verify_status",4] }, then: 1, else: 0 }}               
			}}, 
			{$group : { 
					_id : {employee_no:"$employee_no", month : "$month" ,year : "$year" },
				  employee_no:{ $first: "$employee_no"},					
				  total : {$sum : 1} ,
				  submitted:{$sum:'$submitted'},
				  smart_verified_success:{$sum:'$smart_verified_success'},
				  smart_verified_failed:{$sum:'$smart_verified_failed'},
				  manual_verified:{$sum:'$manual_verified'},
				  rejected:{$sum:'$rejected'}
			}}
		]).toArray(function(err, invoice_result) 	{							
				if(err){
					console.log(err,'err---'); //reject(err);
					resolve([]);
				}else{
					//console.log(res,'res---->');
					resolve(invoice_result);
				}
		});
	});
}

exports.getEmployeeInvoice = (filter_query) => {
	
	var match_cond = { bill_date:{$exists: true}};
	if(filter_query.emp_id && filter_query.emp_id > 0){
		match_cond['employee_no'] = parseInt(filter_query.emp_id);
	}	
	if(filter_query.month_year){		
		var month_year_arr = filter_query.month_year.split(/[./-]+/);
		var month_year_frm = new Date(`${month_year_arr[1]}-${month_year_arr[0]}-01`);
		var month_year_to = new Date(`${month_year_arr[1]}-${month_year_arr[0]}-31`);
		//console.log(month_year_to,'month_year',month_year_frm);
		match_cond['bill_date'] = {$gte:month_year_frm,$lte:month_year_to};		
	}
	//console.log(match_cond,'match_cond');
	
	return new Promise( (resolve, reject) => {
		db.get().collection('invoice').aggregate([
			{$match	: match_cond },
			{$project : {
				employee_no:"$employee_no",				
				bill_amount:"$bill_amount",
				bill_no:"$bill_no",
				verify_status:"$verify_status",
				//month : {$month : "$bill_date"}, 
				//year : {$year :  "$bill_date"},
				bill_date:{ $dateToString: { format: "%d-%m-%Y", date: "$bill_date",timezone: 'Asia/Kolkata'} }				             
			}}
		]).toArray(function(err, invoice_result) 	{							
				if(err){
					console.log(err,'err---'); //reject(err);
					resolve([]);
				}else{
					//console.log(res,'res---->');
					resolve(invoice_result);
				}
		});
	});
	
}

exports.getEmployeeInvoiceDetails = (invoice_id) => {
	
	var match_cond = { _id:ObjectID(invoice_id) };
	
	//console.log(match_cond,'match_cond');	
	return new Promise( (resolve, reject) => {
		db.get().collection('invoice').aggregate([
			{$match	: match_cond },
			{$project : {
				employee_no:"$employee_no",				
				bill_amount:"$bill_amount",
				verify_status:"$verify_status",
				image_name:"$image_name",
				bill_date:{ $dateToString: { format: "%d-%m-%Y", date: "$bill_date",timezone: 'Asia/Kolkata'} }				             
			}}
		]).toArray(function(err, invoice_result) 	{							
				if(err){
					console.log(err,'err---'); //reject(err);
					resolve([]);
				}else{
					//console.log(res,'res---->');
					resolve(invoice_result);
				}
		});
	});
	
}