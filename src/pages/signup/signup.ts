import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelperProvider } from '../../providers/helper/helper'; 
import { ActivationAccountPage } from '../activation-account/activation-account'; 

/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
	user:any={}
  constructor(public navCtrl: NavController, public navParams: NavParams, private helper: HelperProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

  close()
  {
  	this.navCtrl.pop();
  }

  signUp()
  {
  	

  	let url = this.helper.config.base_url('signup-process');
  	let data = {
  		fullname: this.user.username,
  		email: this.user.email,
  		password: this.user.password,
  		password_conf: this.user.conf_password,

  	}

  	this.helper.loading_countdown({
  		url: url,
  		data: data
  	})
  	.then((res:any)=>{
  		res = this.helper.isJSON(res)? JSON.parse(res) : res
  		switch (res.code) {
  			case 200:
  				let data_act = {
					user_email_or_phone: data.email,
					user_password: data.password
  				}
				this.navCtrl.setRoot(ActivationAccountPage, {data: data_act})
  				// code...
  				break;
  			
  			default:
  				this.helper.alertCtrl.create({
  					title: "Kesalahan",
  					message: res.message,
  					buttons: ["Ok"]
  				}).present();
  				break;
  		}
  		console.log(res)
  	})
  }

}
