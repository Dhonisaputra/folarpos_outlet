import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { HelperProvider } from '../../providers/helper/helper'; 
import { MemberNewFormPage } from '../member-new-form/member-new-form'; 
import { MemberDetailPage } from '../member-detail/member-detail'; 

/**
 * Generated class for the MemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-member',
  templateUrl: 'member.html',
})
export class MemberPage {
	
	segment_member:string='member_list'	
	member:any = []
	outlet: any;
	page_params:any={
		toggleSearchInput:false
	}

	constructor(public navCtrl: NavController, public navParams: NavParams, public helper:HelperProvider, public modalCtrl:ModalController, public viewCtrl:ViewController) {
		this.segment_member='member_list';
		this.outlet = this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id;
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad MemberPage');
	}

	filter_member($event)
	{
    	let val = $event.target.value;
    	if(val && val.length < 3)
    	{
    		return false;
    	}
		let load = this.helper.loadingCtrl.create({
			content: "Memeriksa data"
		})
		load.present();
		this.helper.loading_countdown({
			type: "POST",
			url: this.helper.config.base_url('admin/outlet/member/get'),
			data: {
				fields:"last_transaction,member_id,outlet_id,member_name,member_code,member_phone,member_mail,member_registered",
				outlet_id: this.outlet,
				like: [['member_name', val]]
			},
			dataType: 'json'
		})
		.then((res:any)=>{

			load.dismiss();
			this.member = res.data
		})
		.catch( ()=>{
			load.dismiss();
		} )
	}

	fetching_member($event:any={})
	{
		let load = this.helper.loadingCtrl.create({
			content: "Memeriksa data"
		})
		load.present();
		this.helper.loading_countdown({
			type: "POST",
			url: this.helper.config.base_url('admin/outlet/member/get'),
			data: {
				fields:"last_transaction,member_id,outlet_id,member_name,member_code,member_phone,member_mail,member_registered",
				outlet_id: this.outlet
			},
			dataType: 'json'
		})
		.then((res:any)=>{

			load.dismiss();
			this.member = res.data
			if(typeof $event.complete == 'function')
			{
				$event.complete();
			}
		})
		.catch( ()=>{
			load.dismiss();
		} )
	}

	ionViewWillEnter()
	{
		this.fetching_member();

	}

	hapus_member(item)
	{
		let load = this.helper.loadingCtrl.create({
			content: "menghapus member"
		})
		load.present();
		this.helper.loading_countdown({
			type: "POST",
			url: this.helper.config.base_url('admin/outlet/member/delete'),
			data: {
				outlet_id: this.outlet,
				member_id: item.member_id
			},
			dataType: 'json'
		})
		.then((res:any)=>{

			// this.member = res.data
			if(res.code == 200)
			{
				this.helper.alertCtrl.create({
					title: "Member berhasil dihapus",
					message: "Member telah berhasil dihapus",
					buttons:["OK"]
				}).present();
				this.fetching_member();
			}else
			{
				this.helper.alertCtrl.create({
					title: "Terdapat kesalah",
					message: "Member gagal dihapus",
					buttons:["OK", {
						text: 'Ulangi',
				        handler: () => {
				        	this.hapus_member(item)
				        }
					}]
				}).present();
			}

		})
		.catch(()=>{
			load.dismiss();
			this.helper.alertCtrl.create({
				title: "Terdapat kesalah",
				message: "Member gagal dihapus",
				buttons:["OK", {
					text: 'Ulangi',
			        handler: () => {
			        	this.hapus_member(item)
			        }
				}]
			}).present();
		})
	}
	update_new_member()
	{

	}
	openFormPopover(data:any={})
	{
		let modal = this.modalCtrl.create(MemberNewFormPage, data)
		modal.onDidDismiss(data => {
			this.fetching_member();
	   	});
		modal.present();
	}

	pickMember(index, item)
	{
		switch (this.navParams.data.event) {
			case "pick.member":
				this.viewCtrl.dismiss({data:item})
				break;
			
			default:
				// code...
				this.openDetailPage(index, item)
				break;
		}
		// this.navCtrl.push(MemberNewFormPage);
	}

	openDetailPage(index, item)
	{
		console.log(index, item)
		this.navCtrl.push(MemberDetailPage, {index:index, data:item})
	}

	advanceOptions(index, item)
	{
		this.helper.actionSheet.create({
			title: 'Opsi lanjutan',
			buttons: [
				{
					text: 'Edit Member',
					handler: () => {
						this.openFormPopover({index:index, member:item, event:'edit'})
					}
				},{
					text: 'Buka Detail Member',
					handler: () => {
						this.openDetailPage(index, item)
					}
				},{
					text: 'Kirimkan email kartu member',
					handler: () => {
						this.openTheCard(index, item, 'email')
					}
				},{
					text: 'Download PDF Kartu Email',
					handler: () => {
						this.openTheCard(index, item, 'pdf')
					}
				},{
					text: 'Hapus Member',
					handler: () => {
						this.helper.alertCtrl.create({
							title: "Peringatan",
							message: "Apakah anda akan menghapus member ini?",
							buttons:["Batal", {
								text: 'Hapus',
						        handler: () => {
						        	this.hapus_member(item)
						        }
							}]
						}).present();
					}
				}
			]
		}).present()
	}

	openTheCard(index, item, type)
	{
		let url = this.helper.config.base_url('admin/outlet/member/card/'+this.outlet+'/'+item.member_id+'/'+type)
		switch (type) {
			case "email":
				// code...
				let loading = this.helper.loadingCtrl.create({
					content: "Mengirimkan email"
				});
				loading.present();
				this.helper.loading_countdown({
					url:url,
					type:"POST",
				})
				.then((res:any)=>{
					loading.dismiss();
					this.helper.alertCtrl.create({
						title: "Kartu member terkirim",
						message: "Kartu member berhasil dikirim",
						buttons: ["OK"]
					}).present()
				})
				.catch(()=>{
					loading.dismiss();
					this.helper.alertCtrl.create({
						title: "Kesalahan code : 500",
						message: "Terjadi kesalahan saat mengirimkan email. Silahkan laporkan kepada pengembang aplikasi",
						buttons: ["OK"]
					}).present()
				})
				break;
			
			default:
				// code...
				window.open(url, '_blank')
				break;
		}
	}
}
