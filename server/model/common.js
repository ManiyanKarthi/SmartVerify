var mongo = require('mongodb');
var db = require('../config/dbconnection');

exports.BillType = (bill_response)=> {	
	return new Promise( (resolve, reject) => {
		var response = bill_response;
		//console.log(bill_response,'bill_response',response,'response');
		var bill_type=0;
		if(response.payload.length > 0 && response.payload[0].displayName && response.payload[0].classification.score){		
		  if(response.payload[0].classification.score >= 0.8){			  
			  if(response.payload[0].displayName=='FuelBill'){
				  bill_type = 1;
				  console.log(1,'BillType');				  
			  }else if(response.payload[0].displayName=='TollBill'){
				  bill_type = 2;
				  console.log(2,'BillType');				 
			  }else{ bill_type = 3; }
		  }else{
			bill_type = 3;	
		  }			  
		}else{
			bill_type = 3;
			console.log(3,'BillType');			
		}
		//console.log(bill_type,'BillType');
		resolve(bill_type);
	})	
}

exports.getTransformData = (bill_type,bill_area)=> {
	return new Promise( (resolve, reject) => {
		
		var data_store = bill_area;
		console.log(bill_type,'bill_type---->');
		if(bill_type==1){			
			//console.log(bill_area,'data_store--->getTransformData',bill_type);
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
			let search_total = data_store.search(/total/i);					
			
			var invoice_text_value,bill_text_value,receipt_text_value;
			if(search_invoice_no > 0){
				var invoice_text_length = data_store.substr(search_invoice_no,20);
				let search_invoice_line = invoice_text_length.search('\n');			
				if(search_invoice_line){
					//console.log(search_invoice_line,'search_invoice_line---')
					invoice_text_length = data_store.substr(search_invoice_no,search_invoice_line);
				}
				let invoice_number = invoice_text_length.replace(/invoice no/ig, '');
				invoice_text_value = invoice_number.replace(/[:.]/g, "");			
				console.log(invoice_text_value,'<----invoice_text_value----->\n');			
			}
			
			//console.log(search_bill_no,'search_bill_no---')
			if(search_bill_no  > 0){
				var bill_text_length = data_store.substr(search_bill_no,25);
				let search_bill_line = bill_text_length.search('\n');	
				//console.log(bill_text_length,'bill_text_length---')				
				if(search_bill_line){
					console.log(search_bill_line,'search_bill_line---')
					bill_text_length = data_store.substr(search_bill_no,search_bill_line);
				}
				let bill_number = bill_text_length.replace(/bill no/ig, '');
				bill_text_value = bill_number.replace(/[:.]/g, "");
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
				//receipt_text_value = receipt_number.replace(':', "");
				receipt_text_value = receipt_number.replace(/[:.]/g, "");			
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
			
			var fuel_sales=0,fuel_amount =0,fuel_total=0;
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
			
			console.log('search_amount++++++',search_amount);
			if(search_amount && search_amount>0){
				var invoice_amount_text = data_store.substr(search_amount,20);
				console.log('invoice_amount_text---',invoice_amount_text,'<------>>>>\n');
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
				}else{
					var invoice_amount_search = data_store.substr(search_amount+6,50);
					let search_amount_next = invoice_amount_search.search(/amount/i);
					if(search_amount_next){
						var invoice_amount_text = invoice_amount_search.substr(search_amount_next,20);
						var amount_matches_next = invoice_amount_search.match(sale_regex);
						console.log(amount_matches_next,'amount_matches----else case->');
						if(amount_matches_next && amount_matches_next.length){
							var fuel_amount = amount_matches_next[0];
							console.log(amount_matches_next,'amount_matches_next---else--part');
						}
					}
				}
			}

			if(search_total){
				var invoice_total_text = data_store.substr(search_total,30);
				console.log('invoice_total_text---',invoice_total_text,'-----\n');
				let search_total_line = invoice_total_text.search('\n');
				if(search_total_line){				
					invoice_total_text = data_store.substr(search_sale,search_total_line);
					//console.log(invoice_sale_text,'invoice_sale_text---');
				}			
				//invoice_sale_text = invoice_sale_text.replace(/rs./ig, '');
				var sale_regex = /\d+(\.\d+)?/g; //float value			
				var total_matches = invoice_total_text.match(sale_regex);
				console.log(total_matches,'<---total_matches----->\n');
				if(total_matches && total_matches.length){
					var fuel_total = total_matches[0];
					console.log(fuel_total,'fuel_total');
				}
			}
			
			var net_sales='0';
			if(fuel_amount > fuel_sales){			
				net_sales = fuel_amount;
			}else if(fuel_sales>0){
				net_sales = fuel_sales;
			}else if(fuel_total>0){
				net_sales = fuel_total;
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
			var reconization_data = {bill_number:bill_number.trim(),net_sales:net_sales.trim(),bill_date:bill_date.trim()};
			console.log(reconization_data,'bill data---');
			resolve(reconization_data);
			
		}else if(bill_type==2){
		
			//console.log(invoice_res);
			//_.lowerCase(invoice_res.data.textAnnotations[0].description)
			//var data_store = 'National Highway Authority Of India\nSU TOLL ROAD LTD\nGST-33AAKCS7150GIZC\nSAC-996749\nToll Plaza Name : Nathakkarai\n| KM 73-760 NH-79\nSection\nKM45+765 To KM91+217\nTicket No : 1646231\nBooth & Operator: L7 rdinesh\nDate & Time 04/06/2019 05:37:00 PM\nVehicle No. TNO1AW8316\nType of Vehicle : Car/Jeep\nType of Journey : Single Journey\nFee\n: Rs.50.00\nOnly for overloaded vehicle\nStandard wt. of vehicle : 7875 kg.\nActual wt. of vehicle : 830 kg,\nOverloaded vehicle Fees : Rs.0.00\nHave a nice journey\nEmergency number: 9344779100\nScanned with\nCamScanner\n';//invoice_res.document_text_deduction.textAnnotations[0].description;
			//var data_store = invoice_res.data.textAnnotations[0].description;
			var data_store = bill_area;
			let search_store = data_store.replace(/\n/g, " ");
			//console.log(search_store,'search_store---->');
			let search_rate = search_store.search(/rate/i);
			let search_volume = search_store.search(/volume/i);
			let search_price = search_store.search(/rs/i);	
			
			let search_bill_no = data_store.search(/bill no/i);
			let search_ticket_no = data_store.search(/ticket no/i);
			let search_ticketid_no = data_store.search(/ticket id/i);
			let search_invoice_no = data_store.search(/invoice no/i);
			let search_receipt_no = data_store.search(/receipt no/i);
			let search_receipt_number = data_store.search(/receipt number/i);
			let search_sale = data_store.search(/sale/i);
			let search_amount = data_store.search(/amount/i);
			let search_fee = data_store.search(/fee/i);		
			
			var invoice_text_value,bill_text_value,receipt_text_value,ticket_text_value,ticketid_text_value,receiptno_text_value;
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
				console.log(bill_text_value,'<....bill_text_length......>\n');
			}
			
			if(search_ticket_no  > 0){
				var ticket_text_length = data_store.substr(search_ticket_no,30);
				let search_ticket_line = ticket_text_length.search('\n');			
				if(search_ticket_line){
					console.log(search_ticket_line,'search_ticket_line---')
					ticket_text_length = data_store.substr(search_ticket_no,search_ticket_line);
				}
				let ticket_number = ticket_text_length.replace(/ticket no/ig, '');
				ticket_text_value = ticket_number.replace(':', "");			
				console.log(ticket_text_value,'<....ticket_text_length......>\n');
			}
			
			if(search_ticketid_no  > 0){
				var ticketid_text_length = data_store.substr(search_ticketid_no,20);
				let search_ticketid_line = ticketid_text_length.search('\n');			
				if(search_ticketid_line){
					console.log(search_ticketid_line,'search_ticketid_line---')
					ticketid_text_length = data_store.substr(search_ticketid_no,search_ticketid_line);
				}
				let ticketid_number = ticketid_text_length.replace(/ticket id/ig, '');
				ticketid_text_value = ticketid_number.replace(':', "");				
				console.log(ticketid_text_value,'<....ticketid_text_value......>\n');
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
			
			if(search_receipt_number  > 0){
				var receipt_number_text_length = data_store.substr(search_receipt_number,20);
				let receipt_number_text_length_line = receipt_number_text_length.search('\n');			
				if(receipt_number_text_length_line){
					console.log(receipt_number_text_length_line,'receipt_number_text_length_line---')
					receipt_number_text_length = data_store.substr(search_receipt_number,receipt_number_text_length_line);
				}
				let receipt_number_data = receipt_number_text_length.replace(/receipt number/ig, '');
				receiptno_text_value = receipt_number_data.replace(':', "");			
				console.log(receipt_number_data,'<....receipt_number_data......>\n');
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
			}else if(ticket_text_value){
				console.log(ticket_text_value,'ticket_text_value');
				bill_number = ticket_text_value;
			}else if(ticketid_text_value){
				console.log(ticketid_text_value,'ticketid_text_value');
				bill_number = ticketid_text_value.trim();
			}else if(receiptno_text_value){
				console.log(receiptno_text_value,'receiptno_text_value');
				bill_number = receiptno_text_value;
			}
			
			//ticket_text_value,ticketid_text_value,receiptno_text_value
			
			var toll_sales=0 , toll_amount =0 , fee_amount =0, toll_rate =0;
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
					toll_sales = sale_matches[0];
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
					toll_amount = amount_matches[0];
					console.log(amount_matches,'amount_matches');
				}
			}
			
			if(search_fee){
				var invoice_fee_text = data_store.substr(search_fee,20);
				console.log('invoice_fee_text---',invoice_fee_text,'-----\n');
				let search_fee_line = invoice_fee_text.search('\n');
				if(search_fee_line){				
					search_fee_line = data_store.substr(search_fee,search_fee_line);
					console.log(search_fee_line,'search_fee_line---');
				}			
				//invoice_sale_text = invoice_sale_text.replace(/rs./ig, '');
				var sale_regex = /\d+(\.\d+)?/g; //float value			
				var fee_matches = invoice_fee_text.match(sale_regex);
				console.log(fee_matches,'fee_matches----->');
				if(fee_matches && fee_matches.length){
					//fuel_amount = parseFloat(amount_matches[0]);
					fee_amount = fee_matches[0];
					console.log(fee_amount,'fee_amount');
				}
			}

			if(search_rate){
				var invoice_rate_text = data_store.substr(search_rate,20);
				console.log('invoice_rate_text---',invoice_rate_text,'-----\n');				
				var sale_regex = /\d+(\.\d+)?/g; //float value			
				var rate_matches = invoice_rate_text.match(sale_regex);
				console.log(rate_matches,'fee_matches----->');
				if(rate_matches && rate_matches.length){
					//fuel_amount = parseFloat(amount_matches[0]);
					toll_rate = rate_matches[0];
					console.log(toll_rate,'toll_rate');
				}
			}
			
			console.log(fee_amount,'fee_amount >');	
			
			var net_sales='0';
			if(fee_amount > 0){
				net_sales=fee_amount;
			}else if(toll_amount > 0){
				net_sales=toll_amount;
			}else if(toll_sales > 0){
				net_sales=fee_amount;
			}else if(toll_rate > 0){
				net_sales=toll_rate;
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
			
			var reconization_data = {bill_number:bill_number.trim(),net_sales:net_sales.trim(),bill_date:bill_date.trim()};
			console.log(reconization_data,'bill data---');
			
			//*** Primary key factor in Fuel bills **/
			let search_nozzle_no = search_store.search(/nozzle no/i);
			let search_fuel = search_store.search(/fuel/i);
			let search_petrol = search_store.search(/petrol/i);
			let search_diesel = search_store.search(/diesel/i);			
			
			console.log(data_store);			
			resolve(reconization_data);			
		}else{
			resolve(0);
		}
	})
};

//verify_status - 0 (submitted), 1 (smart verify success), 2 (smart verify failed), 3 (manual verify), 4 (rejected), bill type - 1 (fuel), 2 (toll)	
exports.BillStatus = (bill_status)=> {	
		var status_res;
		switch (bill_status) {
		  case 0:
			status_res = "Submitted";
			break;
		  case 1:
			status_res = "Auto verified";
			break;
		  case 2:
			status_res = "Auto verify failed";
			break;
		  case 3:
			status_res = "Manual verified";
			break;
		  case 4:
			status_res = "Rejected";
			break;
		  default:
			status_res="No status";
		}
		return status_res;	
}

exports.GetBillType = (bill_type)=> {	
		var status_res;
		switch (bill_type) {		  
		  case 1:
			status_res = "Fuel";
			break;
		  case 2:
			status_res = "Toll";
			break;		 
		  default:
			status_res="Other";
		}
		return status_res;	
}

exports.GetBillID = (bill_type)=> {	
		var status_res;
		switch (bill_type) {		  
		  case "FuelBill":
			status_res = 1;
			break;
		  case "TollBill":
			status_res = 2;
			break;		 
		  default:
			status_res=3;
		}
		return status_res;	
}

exports.GetPredictionScore = (bill_response)=> {	
	return new Promise( (resolve, reject) => {
		var response = bill_response;
		//console.log(bill_response,'bill_response',response,'response');		
		if(response && response.payload.length > 0 && response.payload[0].displayName && response.payload[0].classification.score){	
			//console.log(response.payload[0].classification.score,'response.payload[0].classification.score');
			resolve(parseFloat(response.payload[0].classification.score).toFixed(3));
		}else{
			//console.log(bill_type,'BillType');
			resolve(0);
		}
	})	
}

exports.GetPredictionType = (bill_response)=> {	
	return new Promise( (resolve, reject) => {
		var response = bill_response;
		//console.log(bill_response,'bill_response',response,'response');		
		if(response && response.payload.length > 0 && response.payload[0].displayName){	
			//console.log(response.payload[0].classification.score,'response.payload[0].classification.score');
			resolve(response.payload[0].displayName);
		}else{
			//console.log(bill_type,'BillType');
			resolve(0);
		}
	})	
}

exports.CheckBillInformation = (old_bill_info,new_bill_info) => {
	console.log(old_bill_info,'old_bill_info------>new_bill_info',new_bill_info,'-----');
	return new Promise( (resolve, reject) => {
		
		if(old_bill_info.bill_no == new_bill_info.bill_no && old_bill_info.bill_amount == new_bill_info.bill_amount && old_bill_info.bill_date == new_bill_info.bill_date){
			resolve(1);
		}else{			
			if(new_bill_info.bill_no =='' || new_bill_info.bill_amount==0 || new_bill_info.bill_number==''){
				resolve({status:403,message:'Smart verify data missing'});
			}else if(old_bill_info.bill_no != new_bill_info.bill_no ){
				resolve({status:403,message:'Bill number not match'});
			}else if(old_bill_info.bill_date != new_bill_info.bill_date){
				resolve({status:403,message:'Bill date not match'});
			}else if(old_bill_info.bill_amount != new_bill_info.bill_amount){
				let bill_diff = parseFloat(new_bill_info.bill_amount) - parseFloat(old_bill_info.bill_amount);
				if(bill_diff > 2 || bill_diff < -2 ){
					resolve({status:403,message:'Bill amount difference'});
				}else{
					resolve(1);
				}

				/*if (new_bill_info.bill_amount < old_bill_info.bill_amount) {
					let bill_diff = parseFloat(old_bill_info.bill_amount) - parseFloat(new_bill_info.bill_amount);
					if(bill_diff>3){
						resolve({status:403,message:'Bill amount difference'});
					}else{
						resolve(1);
					}				    
				}else{
					let bill_diff = parseFloat(new_bill_info.bill_amount) - parseFloat(old_bill_info.bill_amount);
					if(bill_diff>3){
						resolve({status:403,message:'Bill amount difference'});
					}else{
						resolve(1);
					}
				}*/				
			}else{
				resolve({status:403,message:'Bill data not match'});
			}		
		}
	})
	
}