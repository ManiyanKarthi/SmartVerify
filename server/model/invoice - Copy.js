var mongo = require('mongodb');

exports.InsertInvoice = (db,InvoiceData)=> {
	return new Promise( (resolve, reject) => {
		db.collection('invoice').insertOne(InvoiceData,(err, res)=> {
		if (err)
			reject(err);
		else
			console.log("1 document inserted");			
			resolve(res);
		});
	})
};

exports.FindInvoice = (db,Id)=> {
	var o_id = new mongo.ObjectID(Id);
	return new Promise( (resolve, reject) => {
		db.collection('invoice').findOne({_id:o_id},(err, res)=> {
		if (err)
			reject(err);
		else					
			resolve(res);
		});
	})
};