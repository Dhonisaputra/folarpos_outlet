import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelperProvider } from "../../providers/helper/helper";
/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
	listAbout:any = [];
  constructor(private helper: HelperProvider, public navCtrl: NavController, public navParams: NavParams) {
  	this.listAbout = [{
  		name: "nama",
  		value: 'Folarpos Instant' 
  	},{
  		name: 'uuid',
  		value: this.helper.local.get_params('uuid')
  	},{
  		name: 'version',
  		value: 'build'+this.helper.config.build_number
  	},{
  		name: 'Author',
  		value: 'dhoni.p.saputra@gmail.com'
  	},{
  		name: 'Company',
  		value: 'Folarium Technomedia'
  	},{
  		name: "Year",
  		value: 2018
  	}, {
  		name: 'Website',
  		value: "http://folarpos.co.id"
  	}]
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

}
