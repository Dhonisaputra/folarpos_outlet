import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelperProvider } from '../../providers/helper/helper'; 

/**
 * Generated class for the ReportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-report',
  templateUrl: 'report.html',
})
export class ReportPage {
	reports:any={cancel:[], complement:[],income:0, data:[], paid:[], period:{}, type:{}, item:{complement:[], data:[], paid:[]} }
  constructor(public navCtrl: NavController, public navParams: NavParams, public helper: HelperProvider) {
  	this.get_report_data();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReportPage');
  }

  get_report_data()
  {
  	let today = this.helper.moment().format('YYYY-MM-DD')
	let url = this.helper.config.base_url('admin/outlet/transactions/report/penjualan/data/json');
	this.helper.loading_countdown({
		url: url,
		type: "GET",
		data: {
			app:true,
			uuid: this.helper.uuid,
			start: today,
			outlet_id: this.helper.outlet_active()
		}
	})
	.then((res:any)=>{
		res = this.helper.isJSON(res)? JSON.parse(res) : {}
		this.reports = res;
	})
  }

}
