import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelperProvider } from '../../providers/helper/helper'; 
import { LoginPage } from '../login/login';

/**
 * Generated class for the LoadingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-loading',
  templateUrl: 'loading.html',
})
export class LoadingPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public helper: HelperProvider) {
  	this.helper.get_uuid()
  	.then((uuid)=>{
  		console.log(uuid)
  		this.helper.uuid = uuid;
    	this.get_data();

  	})
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoadingPage');
  }

  // get data devices
  private get_data()
  {
  	
  	this.helper.events.subscribe('loading', (res)=>{
  		console.log(res)
  		switch (res.status) {
  			case 1:
	  			switch (res.id) {
	  				case "chaining-0":
	  					// code...
	 	 				this.helper.local.set_params('device_printer_pairing', res.results);
	  					break;
	  				
	  				default:
	  					// code...
	  					break;
	  			}
  				break;
  			case 2:
  				this.helper.events.unsubscribe('loading');
  				this.navCtrl.setRoot(LoginPage)
  				break;
  			
  			default:
  				// code...
  				break;
  		}
  	})
  	let dataload = []
  	dataload.push({
  		url: this.helper.config.base_url('admin/device/printer/pairing/get'),
  		data: {
  			unique_device_id: this.helper.uuid
  		}
  	})

  	this.helper.chaining_loading(dataload, {name: 'loading'})
  }

}