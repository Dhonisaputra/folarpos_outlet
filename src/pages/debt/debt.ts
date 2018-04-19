import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelperProvider } from '../../providers/helper/helper'; 

/**
 * Generated class for the DebtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 @IonicPage()
 @Component({
 	selector: 'page-debt',
 	templateUrl: 'debt.html',
 })
 export class DebtPage {
 	outlet: number;
 	debts: any=[];
 	state: any='list';
 	page_params:any={}
 	filter_input:any='';
 	filter_params:any='member_name';
 	detail_item:any;
 	constructor(public navCtrl: NavController, public navParams: NavParams, private helper: HelperProvider) {
 		this.page_params = {
 			toggleSearchInput:false
 		}
 	}

 	ionViewDidLoad() {
 		console.log('ionViewDidLoad DebtPage');

 		this.outlet = this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id;

 		this.get_data_debt();

 	}

 	filter_hutang()
 	{
 		if(this.filter_input.length > 0 && this.filter_input.length < 5)
 		{
 			return false;
 		}
 		let loading = this.helper.loadingCtrl.create({
 			content: "Memeriksa data"
 		})
 		loading.present();

 		let url = this.helper.config.base_url('admin/outlet/debt/get/list')
 		let data = {
 			fields: 'total_debt_rest,debt_id,pay_id,member_id,debt_date,debt_in,debt_out,debt_rest,outlet_id,member_name,member_mail,member_phone',
 			outlet_id: this.outlet,
 			group_by: 'member_id',
 			where:{
 			},
 			like: [[this.filter_params, this.filter_input]]
 		}


 		this.helper.loading_countdown({
 			url: url,
 			type: 'POST',
 			data: data,
 			dataType: "json"
 		})
 		.then((res:any)=>{
 			loading.dismiss();
 			if(res.code == 200)
 			{
 				this.debts = res.data;
 			}
 			console.log(res);
 		})
 		.catch(()=>{
 			loading.dismiss();
 		})
 	}
 	get_data_debt(params:any={})
 	{
 		let loading = this.helper.loadingCtrl.create({
 			content: "Memeriksa data"
 		})
 		loading.present();

 		let url = this.helper.config.base_url('admin/outlet/debt/get/list')
 		let data = {
 			fields: 'debt_rest_pay_id,total_debt_out,debt_id,total_debt_in,pay_id,member_id,debt_date,debt_in,debt_out,debt_rest,outlet_id,member_name,member_mail,member_code,member_phone',
 			outlet_id: this.outlet,
 			group_by: 'member_id',
 			order_by: 'pay_id DESC',
 			where:{
 			}
 		}


 		this.helper.loading_countdown({
 			url: url,
 			type: 'POST',
 			data: data,
 			dataType: "json"
 		})
 		.then((res:any)=>{
 			loading.dismiss();
 			if(res.code == 200)
 			{
 				this.filter_params = 'member_mail';
 				this.filter_input = '';
 				this.debts = res.data;
 			}
 			console.log(res);
 		})
 		.catch(()=>{
 			loading.dismiss();
 		})
 	}

 	cicilHutang(item)
 	{
 		this.helper.alertCtrl.create({
 			title: "Isikan jumlah cicilan",

 			inputs: [{
 				name: 'cicilan',
 				type: "number",
 				placeholder: 'jumlah cicilan',
 				handler: (val)=>{
 					console.log(val)
 				}
 			}],
 			buttons: [
 			{
 				text: 'Batal',
 				handler: data => {
 				}
 			},
 			{
 				text: 'Tambahkan cicilan',
 				handler: data => {
 					console.log(data)
 					this.process_cicil_hutang(item, data.cicilan)
 				}
 			}
 			]

 		}).present()
 	}

 	process_cicil_hutang(item, cicilan)
 	{

 		let loading = this.helper.loadingCtrl.create({
 			content: "Memeriksa data"
 		})
 		loading.present();
 		let url:any;
 		if(this.state == 'list')
 		{
 			url = this.helper.config.base_url('admin/outlet/debt/pay/nominal')

 		}else
 		{
 			url = this.helper.config.base_url('admin/outlet/debt/save')
 		}
 		item.debt_out = cicilan;
 		item.debt_in = 0;
 		if(this.state == 'detail' || this.state == 'history')
 		{
 			item.pay_type = "PAY_BY_BILL";
 		}

 		this.helper.loading_countdown({
 			url: url,
 			type: 'POST',
 			data: item,
 			dataType: "json"
 		})
 		.then((res:any)=>{
 			loading.dismiss();
 			if(res.code == 200)
 			{
 				switch (this.state) {
 					default:
 					case "list":
 						// code...
 						this.get_data_debt();
 						break;

 					case "detail":
 						// code...
 						this.openDetailDebt(this.detail_item)
 						if(res.credit_rest > 0)
 						{
 							this.helper.alertCtrl.create({
 								title: "Kembalian cicilan",
 								message: "Terdapat kembalian cicilan sebesar <strong> "+res.credit_rest+" </strong>",
 								buttons: ["OK"]
 							}).present()
 						}
 						break;

 					case "history":
 						// code...
 						this.openLogDebt(this.detail_item);
 						if(res.credit_rest > 0)
 						{
 							this.helper.alertCtrl.create({
 								title: "Kembalian cicilan",
 								message: "Terdapat kembalian cicilan sebesar <strong> "+res.credit_rest+" </strong>",
 								buttons: ["OK"]
 							}).present()
 						}
 						break;
 				}
 			}
 		})
 		.catch(()=>{
 			loading.dismiss();
 		})
 	}

 	openDetailDebt(item)
 	{
 		this.detail_item = item;
 		let loading = this.helper.loadingCtrl.create({
 			content: "Memeriksa data"
 		})
 		loading.present();

 		let url = this.helper.config.base_url('admin/outlet/debt/get/detail')
 		let data = {
 			outlet_id: this.outlet,
 			fields: 'debt_rest_pay_id,total_debt_in,total_debt_out,debt_id,pay_id,member_id,debt_date,debt_in,debt_out,debt_rest,outlet_id,member_name,member_mail,member_phone,member_code',
 			where: {
 				member_id: item.member_id,
 			},
 			group_by: 'pay_id'
 		}
 		this.helper.loading_countdown({
 			url: url,
 			type: 'POST',
 			data: data,
 			dataType: "json"
 		})
 		.then((res:any)=>{
 			loading.dismiss();
 			if(res.code == 200)
 			{
 				if(res.data.length <= 0)
 				{
 					this.outDetail();
 				}else
 				{
 					this.debts = res.data;
 				}
 			}
 		})
 		.catch(()=>{
 			loading.dismiss();
 		})
 	}	

 	openLogDebt(item)
 	{
 		this.detail_item = item;
 		let loading = this.helper.loadingCtrl.create({
 			content: "Memeriksa data"
 		})
 		loading.present();

 		let url = this.helper.config.base_url('admin/outlet/debt/get/detail')
 		let data = {
 			outlet_id: this.outlet,
 			fields: 'debt_id,pay_id,member_id,debt_date,debt_in,debt_out,debt_rest,outlet_id,member_name,member_mail,member_phone,member_code',
 			where: {
 				member_id: item.member_id,
 				pay_id: item.pay_id,
 			},
 			order_by: 'debt_date DESC'
 		}
 		this.helper.loading_countdown({
 			url: url,
 			type: 'POST',
 			data: data,
 			dataType: "json"
 		})
 		.then((res:any)=>{
 			loading.dismiss();
 			if(res.code == 200)
 			{
 				if(res.data.length <= 0)
 				{
 					this.openDetailDebt(item);
 				}else
 				{
 					this.debts = res.data;
 				}
 			}
 		})
 		.catch(()=>{
 			loading.dismiss();
 		})
 	}	

 	advanceOptions(index, item)
 	{
 		this.helper.actionSheet.create({
 			title: 'Opsi lanjutan',
 			buttons:[{
 				text: "Lihat data hutang",
 				handler: ()=>{
 					this.state = 'detail'
 					this.debts = []
 					this.openDetailDebt(item)
 				}
 			},{
 				text: "Cicil hutang member",
 				handler: ()=>{
 					this.cicilHutang(item)
 				}
 			},{
 				text: "Kirim email pengingat hutang",
 				handler: ()=>{
 					this.debtReminder(item)
 				}
 			},{
 				text: "Lihat kartu hutang",
 				handler: ()=>{
 					let url = this.helper.config.base_url('admin/outlet/debt/bill/'+this.outlet+'/'+item.member_id)
					window.open(url,'_blank')
 				}
 			}]
 		}).present()
 	}

 	advanceOptionsDetail(index, item)
 	{
 		this.helper.actionSheet.create({
 			title: 'Opsi lanjutan',
 			buttons:[{
 				text: "Lihat log pembayaran",
 				handler: ()=>{
 					this.state = 'history'
 					this.debts = []
 					this.openLogDebt(item)
 				}
 			},{
 				text: "Cicil hutang nota",
 				handler: ()=>{
 					this.cicilHutang(item)
 				}
 			}/*,{
 				text: "Kirim email pengingat hutang",
 				handler: ()=>{
 					this.debtReminder(item)
 				}
 			},{
 				text: "Lihat kartu hutang",
 				handler: ()=>{
 					let url = this.helper.config.base_url('admin/outlet/debt/bill/'+this.outlet+'/'+item.member_id)
					window.open(url,'_blank')
 				}
 			}*/]
 		}).present()
 	}

 	outDetail()
 	{
 		this.state = 'list';
 		this.debts = []
 		this.get_data_debt();
 	}

 	outFromLog()
 	{
 		this.state = 'detail';
 		this.debts = []

 		this.openDetailDebt(this.detail_item);
 	}

 	filter_options()
 	{
 		this.helper.actionSheet.create({
 			title: "Filter lanjutan",
 			buttons:[
 				{
 					text: "Email member",
 					handler: ()=>{
 						this.filter_params = 'member_mail'
 					}
 				},{
 					text: "Nama member",
 					handler: ()=>{
 						this.filter_params = 'member_name'
 					}
 				},{
 					text: "Telephone member",
 					handler: ()=>{
 						this.filter_params = 'member_phone'
 					}
 				},{
 					text: "Kode unik member",
 					handler: ()=>{
 						this.filter_params = 'member_code'
 					}
 				},
 			]
 		}).present();
 	}

 	debtReminder(item)
 	{
 		let loading = this.helper.loadingCtrl.create({
 			content: "Mengirimkan email",
 		})
 		loading.present()
 		let url = this.helper.config.base_url('admin/outlet/debt/reminder')
 		let data = {
 			outlet_id: this.outlet,
 			where: {member_id: item.member_id},
            fields : 'outlet_address,outlet_phone,outlet_logo,outlet_name,total_debt_rest,debt_id,pay_id,member_id,debt_date,debt_in,debt_out,debt_rest,outlet_id,member_name,member_mail,member_phone',
            item: item
 		}
 		this.helper.loading_countdown({
 			url: url,
 			data:data,
 			type:"POST",
 			dataType:"json"
 		})
 		.then( (res:any)=>{
 			loading.dismiss();
 			console.log(res)
 			switch (res.code) {
 				case 200:
 					this.helper.alertCtrl.create({
 						title: "Proses berhasil",
	 					message: "Pengingat telah dikirimkan",
	 					buttons: ["OK"]
	 				}).present();
 					break;
 				
 				default:
 					this.helper.alertCtrl.create({
 						title: "Terjadi kesalahan",
	 					message: "Pengingat gagal dikirimkan",
	 					buttons: ["OK"]
	 				}).present();
 					break;
 			}
 		} )
 		.catch(()=>{
 			loading.dismiss();
 			this.helper.alertCtrl.create({
				title: "Terjadi kesalahan code:500",
				message: "Fatal Error. Silahkan laporkan kepada pengembang aplikasi. ",
				buttons: ["OK"]
			}).present();
 		})
 	}

 	open_debt_card()
 	{
 		let url = this.helper.config.base_url('admin/outlet/debt/card/'+this.outlet)
		window.open(url,'_blank')
 	}

 	pay_as_nominal()
 	{

 	}

 	pay_as_pay_id()
 	{

 	}
 }
