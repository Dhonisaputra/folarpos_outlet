import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { BillProvider } from '../../providers/bill/bill';

import { HelperProvider } from '../../providers/helper/helper'; 

/**
 * Generated class for the BillItemEditorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bill-item-editor',
  templateUrl: 'bill-item-editor.html',
})
export class BillItemEditorPage {
	bill:object={};
  constructor(public navCtrl: NavController, public navParams: NavParams, private billProvider:BillProvider, private helper: HelperProvider, private events: Events) {
  	

	// this.navParams.data = {} // this code use to reset navParams. bcause, whenever a page pushed from this page and popped back, this data bill item always from the previous event. 
  }

  ionViewWillEnter() {
  	this.bill = this.navParams.data.bill
  	console.log(this.bill)
    this.billProvider.update_bill_component(this.navParams.data.bill, false)
	  this.billProvider.count_pricing();
	  this.events.publish('bill.update', {})
  }

}
