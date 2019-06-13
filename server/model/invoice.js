var mongo = require('mongodb');
var db = require('../config/dbconnection');

exports.InsertInvoice = (InvoiceData)=> {
	return new Promise( (resolve, reject) => {
		db.get().collection('invoice').insertOne(InvoiceData,(err, res)=> {
		if (err)
			reject(err);
		else
			console.log("1 document inserted");			
			resolve(res);
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

exports.GetInvoices = (filter_query)=> {
	
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
	
	return new Promise( (resolve, reject) => {
		var invoice_result = db.get().collection('invoice').aggregate([
						 { $match: match_cond },
						 { $project: { invoice_id: "$_id",bill_no:'$bill_no',bill_amount:'$bill_amount',bill_date:{ $dateToString: { format: "%d-%m-%Y", date: "$bill_date" } },bill_type:'$bill_type'
									   //bill_category:{ $cond: { if: { $gt: [ "$bill_type", 1 ] }, then: 'Fuel bill', else: 'Toll bill' } } 
									 } },
						 { $sort: { _id: -1 } },
					     { $skip: parseInt(from_data) },
						 { $limit: parseInt(limit_data) },
					   ]).toArray(function(err, invoice_result) 	{							
							if(err){
								console.log(err,'err---'); //reject(err);
								resolve([]);
							}else{
								//console.log(res,'res---->');
								resolve(invoice_result);
							}
					   });		
	})
};