import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProductPage } from "../product/product";
import { HelperProvider } from "../../providers/helper/helper";
import { BillProvider } from "../../providers/bill/bill";

/**
 * Generated class for the SendReceiptPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-send-receipt',
  templateUrl: 'send-receipt.html',
})
export class SendReceiptPage {
	latest_bill_id: any={}
	email: string=''
  constructor(public navCtrl: NavController, public navParams: NavParams, private helper: HelperProvider, private billProvider: BillProvider) {
  	this.latest_bill_id = this.navParams.get('data');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SendReceiptPage');
  }

  	sendReceiptToEmail(returned:boolean=false)
  	{
  		if(this.email.length < 1)
  		{
  			this.helper.alertCtrl.create({
				title: "Kesalahan",
				message: "Untuk mengirimkan nota ke alamat email, mohon isikan email pengguna pada kolom email yang telah disediakan.",
				buttons: ["OK"]
			}).present()
  		}else
  		{
  			
	  		let loading = this.helper.loadingCtrl.create({
	  			content: "Mengirimkan nota"
	  		});
	  		loading.present();

	  		let url = this.helper.config.base_url('admin/outlet/transaction/send_bill')
	  		let ajax = this.helper.loading_countdown({url:url, data:{pay_id: this.latest_bill_id, email: this.email} })
	  		ajax.then((res:any)=>{
	  			res = JSON.parse(res)
	  			loading.dismiss();
	  			if(res.code == 200)
	  			{
	  				if(!returned)
	  				{
	  					this.helper.alertCtrl.create({
	  						title: "Proses selesai",
	  						message: "Email telah dikirimkan",
	  						buttons: ["OK"]
	  					}).present()
	  				}
	  			}else
	  			{
	  				this.helper.alertCtrl.create({
						title: "Proses gagal",
						message: "Email gagal dikirimkan",
						buttons: ["OK"]
					}).present()
	  			}
	  			return res;
	  		})
	  		.catch(()=>{
	  			loading.dismiss();
	  			this.helper.alertCtrl.create({
					title: "Proses gagal",
					message: "Email gagal dikirimkan",
					buttons: ["OK"]
				}).present()
	  		})
	  		return ajax;
  		}


  	}
	printReceipt()
	{
		let loadingPrint = this.helper.loadingCtrl.create({
			content: "Mencetak nota",
		})
		loadingPrint.present()
		return this.process_print_nota(this.latest_bill_id)
		.then(()=>{
			loadingPrint.dismiss()
			this.helper.alertCtrl.create({
				title: "Proses selesai",
				message: "Nota telah tercetak",
				buttons: ["OK"]
			}).present()
		}, ()=>{
			this.helper.alertCtrl.create({
				title: "Proses gagal",
				message: "Nota gagal tercetak",
				buttons: ["OK"]
			}).present()
			loadingPrint.dismiss()
		})
	}
	sendAndPrint()
	{
		this.sendReceiptToEmail(true)
		.then((res:any)=>{
			res = JSON.parse(res)
			if(res.code == 200)
			{
				this.printReceipt()
				.then(()=>{

				})
			}
		})
	}
	backToCashier()
	{
		this.navCtrl.setRoot(ProductPage, {
			previous: 'payment-page',
			event: 'payment.cashier',
			trigger_event: "order.new",
			message: "Nota telah dibayarkan"
		})
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
											resolve();
										}, ()=>{
											reject();
										})
									}, 2000 ) // set timeout
						  		}, (err)=>{
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
}
