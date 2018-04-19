import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HelperProvider } from '../../providers/helper/helper'; 
import { BillProvider } from '../../providers/bill/bill';


import * as $ from "jquery"
// import * as moment from 'moment';
/**
 * Generated class for the TotalPaymentEditorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-total-payment-editor',
  templateUrl: 'total-payment-editor.html',
})
export class TotalPaymentEditorPage {

	bill:any={};
  outlet:any;
   page_params  :object={
        action:'default', // [default, edit, pay]
        view_type: 'modal', // [page, modal],
        show_history_stock: true, // boolean [true-false]
        show_segment: true, // boolean [true-false]
        show_detail_product: true, // boolean [true-false]
    }
  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams, public billProvider:BillProvider, public helper:HelperProvider) {
  	this.bill = this.billProvider.get_bill_component()
    this.outlet = this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id;
    this.get_discount();
    
    if(this.navParams.data.page_params)
    {
        this.update_page_parameters(this.navParams.data.page_params);
    }
  }


   ionViewDidLoad() {
        console.log('ionViewDidLoad DetailStockPage');
        let data = Object.assign({}, this.billProvider.get_bill())
        this.helper.local.set_params('payment_editor_temp', data)
    }
    update_page_parameters(data:any={})
    {
        this.page_params = Object.assign(this.page_params, data)
    }
    closeModal()
    {
        this.viewCtrl.dismiss();
    }

    cancelEdit()
    {
        let data = this.helper.local.get_params('payment_editor_temp')
        this.billProvider.set_data_bill(data)
        this.closeModal();
    }

  countTaxNominal()
  {
    this.bill.tax_percent = this.helper.toInt(this.bill.tax_percent)> 99?99:this.bill.tax_percent;
    let val = this.helper.IDRtoInt( this.bill.tax_percent )
    let total = this.billProvider.get_bill_component('payment_bills');
    
    let tax_nominal = total * (val/100);
    
    this.billProvider.set_bill_component('tax_nominal', tax_nominal)
    this.billProvider.set_bill_component('tax_percent', val)

    this.billProvider.count_pricing()
  }

  countTaxPercent()
  {
    let val = this.helper.IDRtoInt( this.bill.tax_nominal )

    let total = this.billProvider.get_bill_component('payment_bills');
    
    let tax_percent = ((val/total)*100).toFixed(1); // to make 1 digit after comma

    this.billProvider.set_bill_component('tax_percent', tax_percent)
    this.billProvider.set_bill_component('tax_nominal', val)
    
    this.bill.tax_percent = tax_percent;
    this.billProvider.count_pricing()
  }

  countDiscountNominal(el:any={})
  {
    let discount_percent = this.helper.toInt(this.bill.discount_percent) > 99?99:this.bill.discount_percent;
    if(el.target && discount_percent >=99)
    {
      $(el.target).val(discount_percent)
      this.bill.discount_percent = discount_percent;
    }
    
    let val = this.helper.IDRtoInt( this.bill.discount_percent )
    let total = this.billProvider.get_bill_component('payment_bills');
    
    let discount_nominal = total * (val/100);
    
    this.billProvider.set_bill_component('discount_nominal', discount_nominal)
    this.billProvider.set_bill_component('discount_percent', val)

    this.billProvider.count_pricing()

  }

  countDiscountPercent(el:any={})
  {
    let val = this.helper.IDRtoInt( this.bill.discount_nominal )
    let total = this.billProvider.get_bill_component('payment_bills');
    if(val >= total && el.target)
    {
      val = total;
      this.bill.discount_nominal = val;
      $(el.target).val(val)
    }

    let discount_percent = ((val/total)*100).toFixed(1); // to make 1 digit after comma
    
    this.billProvider.set_bill_component('discount_percent', discount_percent)
    this.billProvider.set_bill_component('discount_nominal', val)

    this.bill.discount_percent = discount_percent;
    this.billProvider.count_pricing()

  }

  updateItem()
  {
      this.billProvider.update_bill()
      this.billProvider.count_pricing()
      this.closeModal();
  }

  change_discount()
  {
  	let index = this.bill.discounts.map((res)=>{
  		return res.discount_id
  	}).indexOf(this.bill.discount_id);

  	if(this.bill.discount_id < 1)
  	{
  		this.bill.discount_percent = 0;
	  	this.billProvider.set_bill_component('discount', '');
	  	console.log('no change')
  	}else
  	{
  		let discount = this.bill.discounts[index];
  		this.bill.discount_percent = discount.discount_percent;
	  	this.billProvider.set_bill_component('discount', this.bill.discounts[index]);
  	}
  	this.billProvider.set_bill_component('discount_id', this.bill.discount_id);
  	this.countDiscountNominal();

  	/*if(this.bill.discount[index].discount_percent < 1 && this.bill.discounts[index].discount_nominal > 0)
  	{
  		this.bill.discount_nominal = this.bill.discounts[index].discount_nominal;
	  	this.billProvider.set_bill_component('discount_nominal', this.bill.discounts[index].discount_nominal);
  	}else
  	{

  		this.bill.discount_percent = this.bill.discounts[index].discount_percent;
  		this.billProvider.set_bill_component('discount_nominal', this.bill.discounts[index].discount_percent);
  		this.countDiscountNominal()
  	}*/
  }

  toggleTax(e)
  {
  	if(this.bill.is_tax)
  	{
  		this.bill.tax_percent = 10;
  	}else
  	{
  		this.bill.tax_percent = 0;
  	}
  	this.countTaxNominal();
  }

  toggleDiscount()
  {
	this.bill.discount_percent = 0;
  	if(this.bill.is_discount)
  	{
  	}else
  	{
		this.bill.discount_percent = 0;
		this.bill.discount = []
		this.bill.is_discount = 0;
		this.bill.discount_type_fill = 0
		this.bill.discount_id = 0;
  	}
  	this.countDiscountNominal();

  }
  get_discount()
  {
    this.outlet = this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id;
    let data = {
  		outlet: this.outlet
  	}
    console.log(data)
  	this.helper.loading_countdown({url:this.helper.config.base_url('admin/disc-manage/data/discount/active'), data:data})
  	.then((res:any)=>{
        res = !this.helper.isJSON(res)? res : JSON.parse(res); 
        this.bill.discounts = res.data
  	})
  }
}
