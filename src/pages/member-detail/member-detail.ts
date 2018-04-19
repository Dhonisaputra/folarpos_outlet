import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelperProvider } from '../../providers/helper/helper'; 

/**
 * Generated class for the MemberDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 @IonicPage()
 @Component({
 	selector: 'page-member-detail',
 	templateUrl: 'member-detail.html',
 })
 export class MemberDetailPage {

 	transaction:any=[]
 	detail_member:any={}
 	outlet:number;
 	constructor(public navCtrl: NavController, public navParams: NavParams, public helper: HelperProvider) {
 	}

 	ionViewDidLoad() {
 		console.log('ionViewDidLoad MemberDetailPage');
 	}

 	ionViewWillEnter()
 	{
        this.outlet = this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id;
 		this.detail_member = this.navParams.data.data
 		this.get_transaction();
 	}

 	get_transaction()
 	{
        let url = this.helper.config.base_url('admin/outlet/transaction/get')
        let params = {
        	where: {
        		member_id: this.navParams.data.data.member_id
        	},
        	limit:20,
            outlet: this.outlet,
            page: 1,
        	join:['table','discount'],
            fields: `member_id,pay_id,users_outlet,table_id,bank_id,discount_id,payment_method,outlet,payment_nominal,payment_date,visitor_name,payment_date_only,payment_bills,tax_percent,tax_nominal,paid_date,payment_total,paid_nominal,paid_with_bank_nominal,payment_complement_status,payment_complement_note,orders,table_name,payment_rest,discount_name,discount_percent,discount_nominal,payment_cancel_status,payment_cancel_note,reference_counter`
        }
        let load = this.helper.loadingCtrl.create({
        	content: "Memeriksa data"
        })
        load.present();
        this.helper.loading_countdown({
        	url: url,
        	data: params,
        	type: 'POST',
        	dataType: 'json'
        })
        .then((res:any)=>{
            load.dismiss();
        	this.transaction = res.data
        })
        .catch(()=>{
        	load.dismiss();
        })
 	}

 	transform_date(date)
    {
        return this.helper.moment(date).format('HH:mm - YYYY MMM DD')
    }

 }
