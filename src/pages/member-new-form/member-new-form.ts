import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HelperProvider } from '../../providers/helper/helper'; 
import { MemberPage } from '../member/member'; 

/**
 * Generated class for the MemberNewFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-member-new-form',
  templateUrl: 'member-new-form.html',
})
export class MemberNewFormPage {

  segment_member:string='member_list'	
	member:any = {}
	outlet: any;
	
	constructor(public navCtrl: NavController, public navParams: NavParams, public helper:HelperProvider, public viewController: ViewController) {
		this.segment_member='member_list';
		this.outlet = this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id;
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad MemberPage');
	}
	ionViewWillEnter() {

		if(this.navParams.data.event)
		{

			switch (this.navParams.data.event) {
				case "edit":
					// code...
					this.member.state = 'update';
					break;
				
				default:
					// code...
					break;
			}
		}else
		{
			this.member = {}
		}

		if(this.navParams.data.member)
		{
			this.member = Object.assign({}, this.navParams.data.member);		
			console.log(this.member)
		}

	}

	create_new_member()
	{
		let load = this.helper.loadingCtrl.create({
			content: "Memeriksa data"
		})
		load.present();

		this.member.outlet_id = this.outlet;
		this.helper.loading_countdown({
			type: "POST",
			url: this.helper.config.base_url('admin/outlet/member/add'),
			data: this.member,
			dataType: 'json'
		})
		.then((res:any)=>{
			load.dismiss();
			console.log(res)

			if(res.code == 200)
			{
				this.member = {}
				this.viewController.dismiss({data:res.data})
			}
		})
		.catch(()=>{
			load.dismiss();
		})
	}
	update_new_member()
	{
		let load = this.helper.loadingCtrl.create({
			content: "Memeriksa data"
		})
		load.present();

		this.member.outlet_id = this.outlet;
		this.helper.$.ajax({
			type: "POST",
			url: this.helper.config.base_url('admin/outlet/member/update'),
			data: this.member,
			dataType: 'json'
		})
		.then((res:any)=>{
			console.log(res)
			load.dismiss();

			if(res.code == 200)
			{
				this.member = {}
				this.navCtrl.setRoot(MemberPage);
			}
		})
		.catch(()=>{
			load.dismiss();
		})
	}

	closeModal()
	{
		this.viewController.dismiss()
	}
}
