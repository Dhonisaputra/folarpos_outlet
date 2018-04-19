import { Component, ViewChild, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { DbLocalProvider } from '../../providers/db-local/db-local';
import { HelperProvider } from '../../providers/helper/helper'; 
import { BillProvider } from '../../providers/bill/bill';
import { ProductPage } from '../product/product';
import { SendReceiptPage } from '../send-receipt/send-receipt';

import * as $ from "jquery"

/**
 * Generated class for the PaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {
	bill:any = {payment_total:0, returnMoney: 0, payment_nominal:'', payment_rest:0}
	outlet: number;
	payment_method:number= 1;
	users_outlet:number=1;
	bank_id:number=1;
	latest_bill_id:number;
	state:string = 'payment';
	numpad_type:string='numpad';
	method_payment:any=[];
	card_method_payment:any=[];
  constructor(public navCtrl: NavController, public navParams: NavParams, private dbLocalProvider: DbLocalProvider, private events: Events, private helper: HelperProvider, private billProvider: BillProvider) {
  	
  	this.numpad_type = 'numpad';

  	this.method_payment = this.helper.local.get_params(this.helper.config.variable.credential).outlet.payment_method;
  	this.card_method_payment = this.method_payment.filter((res)=>{
  		return res.method_type == 2;
  	})


  }

  ionViewDidEnter()
    {

		console.log(this.navParams.data)
    	if(this.navParams.data.event)
    	{

	        switch (this.navParams.data.event) {
	            case "transaction.edit":
	                // code...
					this.edit_payment_method(this.navParams.data.bill)
	                break;
	            
	            default:
					this.get_temporary_data();
	                break;
	        }
    	}else
    	{
			this.get_temporary_data();		
    	}

    }

  sumReturn(isInput:boolean=false)
  {
  	let payment_nominal = this.helper.IDRtoInt(this.bill.payment_nominal)
  	payment_nominal = isNaN(payment_nominal)? 0 : payment_nominal;
  	let payment_total = this.helper.IDRtoInt(this.billProvider.get_bill_component('payment_total'))

  	let payment_rest =  payment_nominal < payment_total? 0 : payment_nominal - payment_total 

  	let paid_with_bank_nominal = payment_total - payment_nominal;
  	
  	this.bill.paid_with_bank_nominal = this.helper.intToIDR(paid_with_bank_nominal);
  	this.bill.payment_rest = this.helper.intToIDR(payment_rest)
  	this.bill.payment_nominal = this.helper.intToIDR(payment_nominal)

  	console.log(this.bill)
  	if(!isInput)
  	{
  		// $('#payment_nominal').focus();	
  	}
  	
  }

  is_not_enough_money()
  {
  	let payment_nominal = this.helper.IDRtoInt(this.bill.payment_nominal);
  	let paid_with_bank = this.helper.IDRtoInt( this.bill.paid_with_bank_nominal);

  	payment_nominal =  this.payment_method == 3 || this.payment_method == 2? paid_with_bank + payment_nominal : payment_nominal;

  	let total = this.helper.IDRtoInt(this.bill.payment_total)
  	
  	return payment_nominal < total
  }

  payBill()
  {
  	if(this.is_not_enough_money())
  	{
  		if(this.billProvider.bill.member_id && this.helper.local.get_params(this.helper.config.variable.settings).choose_table_first)
  		{
  			this.helper.alertCtrl.create({
	  			title: "Uang tidak cukup",
	  			"message": "Apakah anda ingin menambahkan hutang kepada pelanggan ini?",
	  			buttons: [{
	  				text: "Ya, Tambahkan hutang",
					handler: ()=>{
						this.addPaymentToDebt()
					}
	  			}, "Batal"]
	  		}).present();
  		}else
  		{

	  		this.helper.alertCtrl.create({
	  			title: "Kesalahan",
	  			"message": "Uang tidak cukup untuk melakukan pembayaran.",
	  			buttons: ["OK"]
	  		}).present();
	  		return false;
  		}
  	}else
  	{

  	

	  	this.billProvider.save({
			users_outlet 				: this.users_outlet,
			outlet						: this.outlet,
			bank_id						: this.bank_id,
			event 						: 'make_a_payment',
			payment_nominal				: this.helper.IDRtoInt( this.bill.payment_nominal),
			payment_rest				: this.helper.IDRtoInt( this.bill.payment_rest),
			paid_with_bank_nominal		: (this.payment_method == 3 || this.payment_method == 2) && this.helper.IDRtoInt( this.bill.paid_with_bank_nominal) > 0  ? this.helper.IDRtoInt( this.bill.paid_with_bank_nominal) : 0,
			payment_bank_charge_nominal	: (this.payment_method == 3 || this.payment_method == 2) && this.helper.IDRtoInt( this.bill.payment_bank_charge_nominal) > 0  ? this.helper.IDRtoInt( this.bill.payment_bank_charge_nominal) : 0,
			payment_bank_charge_percent	: (this.payment_method == 3 || this.payment_method == 2) && this.helper.IDRtoInt( this.bill.payment_bank_charge_percent) > 0  ? this.helper.IDRtoInt( this.bill.payment_bank_charge_percent) : 0,
			payment_method 				: this.bill.outlet_payment_method_id,
		})
		.then((res:any)=>{
			res = !this.helper.isJSON(res)? res : JSON.parse(res);
			if(res.code == 200)
			{

				this.latest_bill_id = res.data.pay_id;
				this.navCtrl.setRoot(SendReceiptPage, {data: this.latest_bill_id})
				// this.state = 'afterPayment';
			}else
			{
				console.error('Error when saving the bill')	
			}

		})
  	}
  }

  print_nota()
  {
  	let loadingPrint = this.helper.loadingCtrl.create({
		content: "Mencetak nota",
	})
	loadingPrint.present()
	this.process_print_nota(this.latest_bill_id)
	.then(()=>{
		loadingPrint.dismiss()
	}, ()=>{
		loadingPrint.dismiss()
	})
  }

  back_to_cashier()
  {
  	this.bill = {}
	this.navCtrl.setRoot(ProductPage, {
		previous: 'payment-page',
		event: 'payment.cashier',
		trigger_event: "order.new",
		message: "Nota telah dibayarkan"
	})
  }

  email_panel()
  {
  	let bill = Object.assign({}, this.bill);
	this.navCtrl.push('SendReceiptPage', {bill:bill})
	this.bill = {}
  }

  	process_print_nota(nota:any=null)
	{
		let printer = this.helper.local.get_params(this.helper.config.variable.credential).outlet.printer;
		let printer_rule = this.helper.local.get_params(this.helper.config.variable.credential).outlet.printer_rule;
  		let nota_printer = printer_rule.filter((res)=>{
  			return res.printer_page_id == 5; //--> 5 is constanta from database;
  		})

		return new Promise((resolve, reject) => {


			/*if( !this.helper.printer.isAvailable() )
			{
				this.helper.alertCtrl.create({
					title: "Kesalahan",
					message: "Layanan printer tidak tersedia untuk perangkat ini",
					buttons:["OK"]
				}).present();
				reject();
				return false;
			}*/
			
			let group_printer = nota_printer[0].group_outlet_printer_id.split(',');




		  		this.helper.$.each(group_printer, (i, val)=>{
			  		let printer_filter = printer.filter((res)=>{
			  			return res.outlet_printer_id == val;
			  		})

					// var t = this.billProvider.print_bill_wifi(printer_filter[0],'');

			  		if(printer_filter.length > 0)
			  		{
			  			switch (printer_filter[0].outlet_printer_connect_with) {
			  				case "wifi":
								var t = this.billProvider.print_bill_wifi(printer_filter[0],'');
			  					this.helper.printer.connectWifi(printer_filter[0].outlet_printer_address)
			  					this.helper.printer.printWifi(t);
			  					this.helper.printer.cutpaper();
								resolve()

			  					break;
			  				case "bluetooth":

								var t = this.billProvider.print_bill('', printer_filter[0]);
			  					this.helper.printer.connect(printer_filter[0].outlet_printer_address)
						  		.then(()=>{
									let el = this.helper.$('.receipt');
									setTimeout( ()=>{

										// let t = this.billProvider.print_bill(printer_filter[0]);
										this.helper.printer.printText(t)
										.then(()=>{
											this.helper.printer.disconnect();
											resolve();
										}, ()=>{
											this.helper.printer.disconnect();
											reject();
										})
									}, 2000 ) // set timeout
						  		}, (err)=>{
										this.helper.printer.disconnect();
										reject()
						  		})
								resolve()
			  					break;

			  				default:
			  					// code...
								reject();
			  					break;
			  			}
			  		}else
			  		{		
						reject();
			  		}

			  		/*this.helper.printer.connect(device.address)
			  		.then(()=>{

						let el = this.helper.$('.receipt');
						console.log(this.billProvider)
						setTimeout( ()=>{
							let t = this.billProvider.print_bill();
							this.helper.printer.printText(t)
							.then(()=>{
								resolve()
							}, ()=>{
								reject();
							})
						}, 2000 ) // set timeout
			  		}, (err)=>{
							reject()
			  		})*/

		  		})

			/*this.helper.local.opendb('printer_connected')
		  	.then((device)=>{
		  		console.log(device)
		  		if(!device || !device.address)
		  		{
		  			this.helper.alertCtrl.create({
		  				title: "Printer tidak ditemukan",
		  				message: "Silahkan menuju settings dan pilih menu printer.",
		  				buttons: ["OK"]
		  			}).present();

		  			return false;
		  		}
		  		this.helper.printer.connect(device.address)
		  		.then(()=>{

					setTimeout( ()=>{
						let t = this.billProvider.print_nota(nota);
						this.helper.printer.printText(t)
						.then(()=>{
							resolve()
						}, ()=>{
							reject();
						})
					}, 2000 ) // set timeout
		  		})
		  	})*/

		}) // end of promise
	}

  addPaymentToDebt()
  {
  	this.billProvider.save({
		users_outlet 				: this.users_outlet,
		outlet						: this.outlet,
		bank_id						: this.bank_id,
		event 						: 'make_a_payment',
		payment_nominal				: this.helper.IDRtoInt( this.bill.payment_nominal),
		payment_rest				: this.helper.IDRtoInt( this.bill.payment_rest),
		paid_with_bank_nominal		: (this.payment_method == 3 || this.payment_method == 2) && this.helper.IDRtoInt( this.bill.paid_with_bank_nominal) > 0  ? this.helper.IDRtoInt( this.bill.paid_with_bank_nominal) : 0,
		payment_bank_charge_nominal	: (this.payment_method == 3 || this.payment_method == 2) && this.helper.IDRtoInt( this.bill.payment_bank_charge_nominal) > 0  ? this.helper.IDRtoInt( this.bill.payment_bank_charge_nominal) : 0,
		payment_bank_charge_percent	: (this.payment_method == 3 || this.payment_method == 2) && this.helper.IDRtoInt( this.bill.payment_bank_charge_percent) > 0  ? this.helper.IDRtoInt( this.bill.payment_bank_charge_percent) : 0,
		payment_method 				: this.payment_method,
	})
	.then((res:any)=>{
		res = !this.helper.isJSON(res)? res : JSON.parse(res);
		console.log(res)
		if(res.code == 200)
		{

			this.bill = {}
			this.helper.loading_countdown({
				data:{
					member_id: this.billProvider.bill.member_id,
					debt_date: this.helper.moment().format('YYYY-MM-DD HH:mm:ss'),
					debt_in: this.billProvider.bill.payment_total,
					debt_out: 0,
					pay_id: res.data.pay_id
				},
				type: "POST",
				url: this.helper.config.base_url('admin/outlet/debt/save')
			})
			.then((res:any)=>{
				this.helper.alertCtrl.create({
					title: "Proses sukses",
					message: "Hutang telah ditambahkan",
					buttons: [{
						text: "OK",
						handler: ()=>{
							this.navCtrl.setRoot(ProductPage, {
				  				previous: 'payment-page',
				  				event: 'payment.cashier',
				  				trigger_event: "order.new",
				  				message: "Nota telah dibayarkan"
				  			})
						}
					}]
				}).present();
			})
		}else
		{
			console.error('Error when saving the bill')	
		}

	})
  }
  ionViewDidLoad() {
	this.outlet = this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id;
	this.users_outlet = this.helper.local.get_params(this.helper.config.variable.credential).data.users_outlet_id;
    /*this.dbLocalProvider.opendb('outlet')
	.then((val)=>{
		
	})*/
  }

  ionViewWillEnter()
  {
  	// screenshot the bills
  	this.helper.html2canvas($('.receipt-product')[0])
	.then((canvas) => {
	  	var img = canvas.toDataURL()
	  	// img = this.helper.html_encode(img);
	  	img = img.split(',')[1];
		this.billProvider.set_bill_component('nota_screenshot', img);
	})
	.catch(err => {
	  console.log("error canvas", err);
	});
  }

  resetBillCounted()
  {
  	this.bill = {}
	this.get_temporary_data();
	this.bill.paid_with_bank_nominal = this.helper.IDRtoInt( this.bill.payment_total )


  }
  priceToRupiah(number:any) 
	{ 
		let idr = this.helper.intToIDR(number)
		return idr;
	}

	calculate(event, type:string, value:any) 
	{
		let payment_nominal = !this.bill.payment_nominal? this.billProvider.get_bill_component('payment_nominal') : this.helper.IDRtoInt(this.bill.payment_nominal) ;
		payment_nominal = payment_nominal.toString();
		switch (type) {
			case "numeric":
				value = parseInt(value).toString();
				
				payment_nominal += value
				this.bill.payment_nominal = this.helper.intToIDR(parseInt(payment_nominal));
				this.sumReturn();
				break;

			case "value":
				this.bill.payment_nominal = this.helper.intToIDR(parseInt(value));
				this.sumReturn();
				break;

			case "sum":
				payment_nominal = this.helper.IDRtoInt(this.bill.payment_nominal);
				value = parseInt(value);
				payment_nominal = payment_nominal + value;

				console.log(value, payment_nominal)

				this.bill.payment_nominal = this.helper.intToIDR(parseInt(payment_nominal));
				
				this.sumReturn();
				break;

			case "substract":
				payment_nominal = this.helper.IDRtoInt(this.bill.payment_nominal);
				value = parseInt(value);
				payment_nominal = payment_nominal - value;

				console.log(value, payment_nominal)

				this.bill.payment_nominal = this.helper.intToIDR(parseInt(payment_nominal));
				
				this.sumReturn();
				break;
			case "action":
				switch (value) {
					case "pas":
						this.bill.payment_nominal = this.helper.intToIDR(this.billProvider.get_bill_component('payment_total'));
						this.sumReturn();
						break;

					case "clear":
						this.bill.payment_nominal = 0
						// this.sumReturn();
						break;

					

					case "rm":
						let payment_nominal = this.helper.IDRtoInt(this.bill.payment_nominal).toString();
						if(payment_nominal.length > 0)
						{
							var a = payment_nominal.split('')
							a.pop();
							payment_nominal = a.join('');
							this.bill.payment_nominal = this.helper.intToIDR(parseInt(payment_nominal));
						}else
						{
							this.bill.payment_nominal = 0;
						}
						this.sumReturn();
						break;
					
					case 'simpan':
						this.payBill()
						break;
					default:
						// code...
						break;
				}
				break;
		}

	}

	edit_payment_method(data:any)
	{

		console.log(data)

		let item = {
			payment_total  : data.payment_total,
            sumPrice         : data.payment_bills,
            update_db 		 : false,
            tax              : data.tax_percent,
            receipts         : [],
            visitor          : data.visitor_name,
            visitor_name     : data.visitor_name,
            table            : data.table_id,
            visitor_table    : data.table_id,
            taxAmount    	 : data.tax_percent,
		}

		data.bills.forEach((val, index) => {
			
			let d = {
				amount: val.qty,
				id: val.product,
				price: val.price,
				totalPrice: val.total,
				type: val.type,
				name: val.name
			}
			item.receipts.push(d);
		})


		this.billProvider.set_data_bill(item, false);
		this.events.publish('bill.update', item)
		this.get_temporary_data();		


	}

	get_temporary_data()
	{
		let data = this.billProvider.data_bill();
		data = Object.assign({},data);
		this.events.publish('bill.update', {})
	    this.bill = data;
/*
	    if(data.orders.length < 1)
	    {
		  	this.dbLocalProvider.opendb('bill.data')
		  	.then( (res) =>{
		  		if(res.orders.length < 1)
		  		{
		  			this.navCtrl.setRoot(ProductPage, {
		  				previous: 'payment-page',
		  				event: 'payment.cashier'
		  			})
		  		}else
		  		{
		  			this.bill = res;
		  		}

		  	} )
	    	
	    }else
	    {
			this.events.publish('bill.update', {})

	    }*/

		// this.sumReturn();

	}

	countChargePercent()
	{
		let val = this.helper.IDRtoInt( this.bill.payment_bank_charge_percent )
		let grandTotal = this.helper.IDRtoInt(this.bill.payment_total)
		let payment_nominal = this.helper.IDRtoInt(this.bill.payment_nominal)
		let chargeNominal = grandTotal * (val/100);
		if(payment_nominal > 0)
		{
			grandTotal = grandTotal - payment_nominal;
		}
		this.bill.paid_with_bank_nominal = this.helper.intToIDR( grandTotal + chargeNominal );
		this.bill.payment_bank_charge_nominal = this.helper.intToIDR( chargeNominal )
	}

	countChargeNominal()
	{
		let val = this.helper.IDRtoInt( this.bill.payment_bank_charge_nominal )
		let grandTotal = this.helper.IDRtoInt(this.bill.payment_total)
		this.bill.payment_bank_charge_percent = ((val/grandTotal)*100).toFixed(1); // to make 1 digit after comma
		this.bill.paid_with_bank_nominal = this.helper.intToIDR( grandTotal + val );
	}
}
