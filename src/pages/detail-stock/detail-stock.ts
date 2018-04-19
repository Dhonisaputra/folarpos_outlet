import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HelperProvider } from '../../providers/helper/helper'; 
import * as $ from "jquery"


/**
 * Generated class for the DetailStockPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 @IonicPage()
 @Component({
     selector: 'page-detail-stock',
     templateUrl: 'detail-stock.html',
 })
 export class DetailStockPage {
     tab:string = 'detail_product';
     product:any = {};
     log_stock:any;
     outlet:number;
     page_params  :object={
        action:'default', // [default, edit, pay]
        view_type: 'page', // [page, modal],
        show_history_stock: true, // boolean [true-false]
        show_segment: true, // boolean [true-false]
        show_detail_product: true, // boolean [true-false]
    }
    constructor(public navCtrl: NavController, private viewCtrl: ViewController, public navParams: NavParams, private helper:HelperProvider) {
        this.outlet = this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id;
        
        if(!this.navParams.data)
        {
            this.navCtrl.pop({});
        }
        console.log(this.navParams.data)
        this.product = this.navParams.data
        this.product.price_idr = this.helper.intToIDR(this.product.price)

        if(this.product.ingd_id)
        {
            this.process_get_linked_product();
            this.process_get_stock(this.product.ingd_id);
        }else
        {
            this.process_get_stock(this.product.id);
        }

        if(this.navParams.data.page_params)
        {
            this.update_page_parameters(this.navParams.data.page_params);
        }
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DetailStockPage');
    }
    update_page_parameters(data:any={})
    {
        this.page_params = Object.assign(this.page_params, data)
    }

    process_get_stock(idproduct:number)
    {
        let url = this.helper.config.base_url('admin/outlet/stock/log/get')
        let data_request:any = {outlet:this.outlet, limit:10, page:1, order_by:'stock_date DESC'};
        if(this.product.id)
        {
            data_request.product = this.product.id
        }else
        {
            data_request.ingd = this.product.ingd_id
        }
        
        this.helper.loading_countdown({url:url, data:data_request}, {onload_title: "Mengambil data stock"})
        .then((res:any)=>{
            res = this.helper.isJSON(res)? JSON.parse(res):res;
            this.log_stock = res.data;
            let stock = this.log_stock[0]?this.log_stock[0].stock_rest : 0;
            this.product.stock_opname = this.product.stock < 1? this.product.stock - this.log_stock[0].stock_rest : stock;
        })
        .catch(()=>{
            this.helper.alertCtrl.create({
                message: "Tidak terdapat terhubung kedalam sistem.",
                buttons: ["Tutup", {
                    text: "Coba lagi",
                    handler: ()=>{
                        this.process_get_stock(idproduct)
                    }
                }]
            })
        })
    }

    process_get_linked_product()
    {
        let url = this.helper.config.base_url('admin/outlet/ingredient/related_product')
        this.helper.loading_countdown({url:url, data:{outlet_id: this.outlet, ingredients: [this.product.ingd_id] } })
        .then((res:any)=>{
            res = this.helper.isJSON(res)? JSON.parse(res):res;
            console.log(res)
        })
    }
    closeModal()
    {
        this.viewCtrl.dismiss();
    }
}
