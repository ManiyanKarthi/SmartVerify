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

exports.GetInvoices = ()=> {
	
	return new Promise( (resolve, reject) => {
		var invoice_result = db.get().collection('invoice').aggregate([
						 //{ $match: {bill_date: {$eq: {$type: 9} } } },
						 { $project: { invoice_id: "$_id",bill_no:'$bill_no',bill_amount:'$bill_amount',bill_date:{ $dateToString: { format: "%Y-%m-%d", date: "$bill_date" } } } },
						 { $sort: { _id: -1 } }
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