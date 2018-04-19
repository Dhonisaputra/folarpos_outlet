import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProductProvider } from '../../providers/product/product';
import { DetailStockPage } from '../detail-stock/detail-stock';

import { HelperProvider } from '../../providers/helper/helper'; 

import * as $ from "jquery"

/**
 * Generated class for the StocksPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-stocks',
  templateUrl: 'stocks.html',
})
export class StocksPage {

  restaurant_mode:boolean=this.helper.local.get_params(this.helper.config.variable.credential).outlet.serv_id == 1 || this.helper.local.get_params(this.helper.config.variable.credential).outlet.serv_id == 2
  items:any=[]
	ingredients:any=[]
	original_items:any=[]
  outlet:number;
  detailStockPage:any;
  page_params  :object={
      action:'default', // [default, edit, pay],
      toggleSearchInput: false,
      toggleFilter: false
    }

  constructor(public navCtrl: NavController, public navParams: NavParams, private productProvider : ProductProvider, private helper:HelperProvider) {
    this.detailStockPage = DetailStockPage;
    this.outlet = this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id;
     if(this.restaurant_mode)
      {
          this.get_ingredient_data()
      }else
      {
        this.first_time_get_product();    
      }

    /*this.dbLocalProvider.opendb('outlet')
    .then((val)=>{
      this.outlet = val;
      
    })*/

    if(this.navParams.data.page_params)
    {
      this.update_page_parameters(this.navParams.data.page_params);
    }
  }

  get_ingredient_data()
    {
        let url = this.helper.config.base_url('admin/outlet/ingredient/get');
        this.helper.loading_countdown({
            url: url,
            type: 'POST',
            data: { 
                limit:1000,
                page:1,
                outlet_id: this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id,

                where:{
                    outlet_id: this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id
                }

            },
            dataType: 'json'
        })
        .then((res:any)=>{
            if(res.code == 200)
            {
                this.ingredients = res.data;
            }
        })
        .catch(()=>{
        })
    }

  first_time_get_product(refresher:any={})
  {
    this.get_product({
      online:true,
      data: { 
        limit:0,
        outlet: this.outlet,
        fields: 'id,outlet,type,price,name,unit,stock,image,stock_latest_update',
        order_by: 'stock_latest_update DESC'
      }
    })
    .then( ()=> {
      if(typeof refresher.complete == 'function')
      {
        refresher.complete();
      }
    })
  }

  get_product(data:any={})
  {
  	return this.productProvider.get_product(data)
  	.then((res) => {

  		res = !this.helper.isJSON(res)? res : JSON.parse(res); 
  		if(data.infinite == true)
  		{
  			this.items = this.items.concat(res.data);
  			this.original_items = this.original_items.concat(res.data);
  		}else
  		{
  			this.items = res.data;
  			this.original_items = res.data;
  		}
// this.filter_product()
	})
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StocksPage');
  }

  update_page_parameters(data:any={})
  {
    this.page_params = Object.assign(this.page_params, data)
  }


  filter_stock(ev:any)
  {

    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.items = this.original_items.filter((item) => {
        return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }else
    {
      this.items = this.original_items;
    }

  }
  openDetailStock(item:any)
  {
    this.navCtrl.push(DetailStockPage, item)
  }
}
