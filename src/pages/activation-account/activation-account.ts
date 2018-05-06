import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelperProvider } from '../../providers/helper/helper'; 
import { OutletListPage } from '../outlet-list/outlet-list'; 

/**
 * Generated class for the ActivationAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-activation-account',
  templateUrl: 'activation-account.html',
})
export class ActivationAccountPage {
	user:any={}

  constructor(public navCtrl: NavController, public navParams: NavParams, private helper:HelperProvider) {
  	this.user = this.navParams.get('data')
  	console.log(this.user)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ActivationAccountPage');
  }

  confirmationAccount()
  {
  	let url = this.helper.config.base_url('cust/activation')+'?mobile';
		let data = this.user;
		let alert = this.helper.alertCtrl.create({

		})
		if(!data.user_email_or_phone || !data.user_password)
		{
			alert.setMessage('Email dan Password tidak boleh kosong!');
			alert.present();
			return false;
		}
		// loader.present();
		this.helper.loading_countdown({url:url, data: {
			user_email_or_phone: data.user_email_or_phone,
			user_password: data.user_password,
			users_code_confirmation: data.users_code_confirmation,
		}})
		.then( (res:any) => {
			// loader.dismiss();
			res = !this.helper.isJSON(res)? res : JSON.parse(res);
				if(res.status == 1)
				{
		        	this.helper.local.set_params('is_login', true);
					this.helper.local.set_params(this.helper.config.variable.credential, res);
					this.helper.storage.set(this.helper.config.variable.credential, res);
		        	// alertSuccess.present();
					this.navCtrl.setRoot(OutletListPage);
				}else
				{
					switch (res.code) {
						case 2001:
							// code...
							this.navCtrl.setRoot(ActivationAccountPage, {data: data})
							break;
						
						default:
							// code...
				        	this.helper.local.set_params('is_login', false);
				        	if(res.message)
				        	{
				        		alert.setMessage(res.message);
				        	}
				        	alert.present();
							break;
					}
				}

		}, (err)=>{
			this.helper.alertCtrl.create({
				title: "Login gagal",
				message: "SIlahkan check data login anda",
				buttons: ["OK"]
			}).present();
		})	
		.catch( ()=>{
		}) 
  }

}
