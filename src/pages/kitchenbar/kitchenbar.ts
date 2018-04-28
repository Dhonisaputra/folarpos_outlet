import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ActionSheetController, AlertController } from 'ionic-angular';
import { DbLocalProvider } from '../../providers/db-local/db-local';
import { ConfigProvider } from '../../providers/config/config';
import { PaymentPage } from "../payment/payment"
import { ProductPage } from "../product/product"
import { SplitBillPage } from "../split-bill/split-bill"
import { BillProvider } from "../../providers/bill/bill"
import { BillItemEditorPage } from "../bill-item-editor/bill-item-editor"
import { HelperProvider } from '../../providers/helper/helper'; 

import * as $ from "jquery"
import * as moment from 'moment';

/**
 * Generated class for the KitchenbarPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-kitchenbar',
  templateUrl: 'kitchenbar.html',
})
export class KitchenbarPage {
    items         :any=[]
    original_items:any=[]
    outlet        :number;
    filter_by     :string="visitor_name";
    order_by      :string='date ASC';
    filter_input  :string='';
    payment_status:number=-1;
    filter_date_start   :string=moment().format('MM/DD/YYYY');
    filter_date_end     :string=moment().format('MM/DD/YYYY');
    edit_transaction_status  :boolean=false;
    page_params  :object={
      action:'default', // [default, edit, pay],
      toggleSearchInput: false,
      toggleFilter: false
    }
    transaction_params:any = {data:{limit: 20, page: 1}};


    constructor(private billProvider: BillProvider, private actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private dbLocalProvider:DbLocalProvider, private helper: HelperProvider, private config: ConfigProvider, private loadingCtrl: LoadingController) {
        this.outlet = this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_id;
        let dataFetch = {
            online:true,
            infinite: false,
            data: { 
                
            }
        }

        if(this.navParams.data.body)
        {
            if(this.navParams.data.today == true)
            {
                this.navParams.data.body.where['payment_date_only'] = moment().format('YYYY-MM-DD')
                this.navParams.data.body.where['outlet_id'] = this.outlet
                this.navParams.data.body.in = [['pay_dt_order_status', [0,1]]]
                this.navParams.data.body.group_by = 'pay_id, pay_dt_order_session';
                this.navParams.data.body.order_by = 'pay_date ASC';
                this.payment_status = 0;
                this.filter_by = 'payment_date';
            }
            dataFetch.data = Object.assign(dataFetch.data, this.navParams.data.body)
            // this.get_transaction(dataFetch);

        }

        this.transaction_params = dataFetch;
        let loadingData = this.loadingCtrl.create({
          content: "Mengambil data.Silahkan tunggu"
        });

        loadingData.present();
        this.filter_transaction()
        .then((res)=>{
            loadingData.dismiss();
        })

        



      if(this.navParams.data.page_params)
      {
        this.update_page_parameters(this.navParams.data.page_params);
      }
    }

    refresh_data($event)
    {
        this.filter_transaction()
        .then((res)=>{
            $event.complete();
        })

    }

    ionViewDidLoad() {
        this.helper.events.subscribe("monitoring_request:refresh", (res)=>{
            this.filter_transaction();
            this.helper.toast.create({
                message: "Terdapat pesanan baru",
                showCloseButton: true,
                duration: 3000,
            }).present();
        })
    }

    ionViewWillLeave()
    {
        this.helper.events.unsubscribe('monitoring_request:refresh')
    }

    changeProsesForSelectedItem(item)
    {
        let url = this.config.base_url('admin/outlet/transaction/order/update');
        let data = {
            update:{
                pay_dt_order_status: item.pay_dt_order_status == 0? 1 : (item.pay_dt_order_status == 1? 2 : 3),
            },
            in: [['pay_dt_id', item.selected_item]],
            where: {
                pay_id: item.pay_id,
                order_session: item.order_session,
            }
        }
        this.helper.$.post(url, data)
        .done((res)=>{
            res = JSON.parse(res)
            if(res.code == 200)
            {
                this.filter_transaction();
                switch (parseInt(item.pay_dt_order_status)) {
                    case 0:
                        this.helper.toast.create({
                            message: "Status pesanan berhasil diubah menjadi proses",
                            duration: 2000
                        }).present()
                        /*var nota = this.helper.outlet_initial_name()+'/NOTA/'+this.helper.lead_zero(item.pay_id, 5);
                        this.helper.airemote.send(this.outlet+'.waiters:proses-done','',{title: "Pesanan nota "+nota+' telah diproses' }, () => {
                        })*/
                        break;

                    case 1:
                        this.helper.toast.create({
                            message: "Status pesanan berhasil diselesaikan",
                            duration: 4000
                        }).present()
                        var nota = this.helper.outlet_initial_name()+'/NOTA/'+this.helper.lead_zero(item.pay_id, 5);
                        this.helper.airemote.send(this.outlet+'.waiters:proses-done','',{title: "Pesanan nota "+nota+' telah selesai' }, () => {

                        })
                        break;
                    
                    default:
                        // code...
                        break;
                }
            }
        })
    }

    changeProses(item)
    {
        let url = this.config.base_url('admin/outlet/transaction/order/update');
        let data = {
            update:{
                pay_dt_order_status: item.pay_dt_order_status == 0? 1 : (item.pay_dt_order_status == 1? 2 : 3),
            },
            where: {
                pay_id: item.pay_id,
                order_session: item.order_session,
            }
        }
        this.helper.$.post(url, data)
        .done((res)=>{
            res = JSON.parse(res)
            if(res.code == 200)
            {
                this.filter_transaction();
                switch (parseInt(item.pay_dt_order_status)) {
                    case 0:
                        this.helper.toast.create({
                            message: "Status pesanan berhasil diubah menjadi proses",
                            duration: 2000
                        }).present()
                        var nota = this.helper.outlet_initial_name()+'/NOTA/'+this.helper.lead_zero(item.pay_id, 5);
                        this.helper.airemote.send(this.outlet+'.waiters:proses-done','',{title: "Pesanan nota "+nota+' telah diproses' }, () => {
                        })
                        break;

                    case 1:
                        this.helper.toast.create({
                            message: "Status pesanan berhasil diselesaikan",
                            duration: 4000
                        }).present()
                        var nota = this.helper.outlet_initial_name()+'/NOTA/'+this.helper.lead_zero(item.pay_id, 5);
                        this.helper.airemote.send(this.outlet+'.waiters:proses-done','',{title: "Pesanan nota "+nota+' telah selesai' }, () => {

                        })
                        break;
                    
                    default:
                        // code...
                        break;
                }
            }
        })
    }

    splitting_prod_name(item)
    {
        return item.split(', ');
    }


    update_page_parameters(data:any={})
    {
      this.page_params = Object.assign(this.page_params, data)
    }

    get_transaction(data:any={data:{}})
    {
        
        this.transaction_params = data;

        let url = this.config.base_url('admin/outlet/transaction/realtime/kitchenbar')
        let included_data = this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_roles_id != 3? [0,1] : [0,1,2]
        let ndata = {
            where    :{
                outlet_id         : this.outlet,
                pay_dt_date_now   : this.helper.moment('YYYY-MM-DD')
            },
            in       : [['pay_dt_order_status', included_data]],
            join     : ["md_prod_type","tr_payment","mg_member","md_tables"],
            group_by : "pay_id,pay_dt_order_session",
            order_by : "date ASC",
        }
        data.data = Object.assign(ndata, data.data)
        return this.helper.loading_countdown({url:url, data:data.data})
        .then((res:any) => {

            res = !this.helper.isJSON(res)? res : JSON.parse(res); 
            if(res.code == 200)
            {

                if(data.infinite == true)
                {
                    this.items = this.items.concat(res.data);
                    this.original_items = this.original_items.concat(res.data);
                }else
                {
                    this.items = res.data;
                    this.original_items = res.data;
                }
            }else
            {
                this.helper.alertCtrl.create({
                    title: "Kesalahan",
                    message: "Kesalahan saat pengambilan data.",
                    buttons: []
                }).present()
            }

            return res;
        });
    }

    product_sort() {
        let actionSheet = this.actionSheetCtrl.create({
          title: 'Urutkan berdasarkan',
          buttons: [
            {
              text: 'Nama costumer',
              handler: () => {
                this.filter_by = "visitor_name";
                this.filter_transaction()
              }
            },{
              text: 'Nomor nota',
              handler: () => {
                  this.filter_by = "pay_id";
                this.filter_transaction()
              }
            },{
              text: 'Tanggal pembelian',
              handler: () => {
                  this.filter_by = "payment_date";
                this.filter_transaction()
              }
            },{
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                  // actionSheet.dismiss();
              }
            }
          ]
        });
        actionSheet.present();
    }

    infinite_scroll(ev:any={})
    {
        this.transaction_params.data.page += 1;
        this.transaction_params.infinite = true;
        this.get_transaction(this.transaction_params)
        .then( ()=>{
            if(this.transaction_params.infinite == true && ev.complete)
            {
                ev.complete()
            }
        } )
    }


    search_transaction(ev:any={})
    {
        let val = this.filter_input;
        let character_length = 4;
        if(val && val.length < character_length)
        {
            return false;
        }
        this.filter_transaction();

    }
    filter_transaction(ev:any={})
    {
        return new Promise((resolve, reject) => {

            let exclude_to_filter_input = ['table_name','visitor_name', 'pay_id']

            let val = this.filter_input;
            if(val && exclude_to_filter_input.indexOf('this.filter_by') > -1)
            {
                reject();
                return false;
            }

            this.transaction_params.data.where = {}
            this.transaction_params.data.like =  []
            this.transaction_params.infinite = false;
            this.transaction_params.data.page = 1;

            if (val && val.trim() != '') {


                if(this.filter_by == 'visitor_name')
                {
                    this.transaction_params.data.like = [[this.filter_by, val]]; 
                    delete this.transaction_params.data.where[this.filter_by] 
                }else
                {
                    this.transaction_params.data.where[this.filter_by] = val;
                    delete this.transaction_params.data.like; 
                }
            }

            if(this.filter_by == 'payment_date')
            {
              this.transaction_params.data.like = [[this.filter_by, moment().format("YYYY-MM-DD")]]; 
            }

            this.transaction_params.data.where['payment_complement_status'] = this.payment_status;
            if(this.payment_status < 0)
            {
                delete this.transaction_params.data.where['payment_complement_status'];
            }

            this.transaction_params.data.order_by = this.order_by;

            this.get_transaction(this.transaction_params)
<<<<<<< HEAD
            .then((res)=>{
=======
            .then((res:any)=>{
>>>>>>> e5b010e0726340a49feb899b2f467dd91ba40965
                resolve(res)
            })
            .catch(()=>{
                reject();
            })

        })
    }

    itemWantToProcess(item)
    {
        let id = item.group_pay_dt_id.split(',');
        let name = item.group_prod_name.split(',');
        let data = [];
        this.helper.$.each(item.orders, (i, val)=>{

            data[i] = {
                value: parseInt(val.pay_dt_id),
                label: val.prod_name,
                type: 'checkbox',
                checked: true
            }
        })


        this.helper.alertCtrl.create({
            title: "Daftar order",
            message: "Silahkan pilih order yang akan diproses",
            inputs: data,
            buttons:[{
                text: "Proses order terpilih",
                cssClass: 'btn-primary',
                handler: (res)=>{
                    item.selected_item = res
                    this.changeProsesForSelectedItem(item)
                }
            },"Tutup"]
        }).present();
    }
    itemWantToNextProcess(item)
    {
        let data = [];
        this.helper.$.each(item.orders_process, (i, val)=>{

            data[i] = {
                value: parseInt(val.pay_dt_id),
                label: val.prod_name,
                type: 'checkbox',
                checked: true
            }
        })


        this.helper.alertCtrl.create({
            title: "Daftar order",
            message: "Pilih order yang akan tandai selesai",
            inputs: data,
            buttons:[{
                text: "Proses order terpilih",
                cssClass: 'btn-primary',
                handler: (res)=>{
                    item.selected_item = res
                    item.pay_dt_order_status = 1
                    this.changeProsesForSelectedItem(item)
                }
            },"Tutup"]
        }).present();
    }

    edit_transaction(i, item)
    {
        this.navCtrl.push(PaymentPage, {
            previous: 'transaction-page',
            event: 'transaction.edit',
            trigger_event: 'transaction.edit',
            bill: item,
            receipt_page_params:
            {
                can_edit_slide_item: false
            }
        })
    }
    pay_transaction(i, item)
    {
        item = Object.assign({}, item)
        this.navCtrl.push(ProductPage, {
            previous: 'transaction-page',
            event: 'transaction.edit',
            trigger_event: 'product.pay',
            bill: item,
            receipt_page_params:
            {
                can_edit_slide_item: true
            }
        })
    }

    info_transaction(index, item)
    {
        this.navCtrl.push(BillItemEditorPage, {
                bill:item, index:index,
                receipt_page_params:
                {
                    can_edit_slide_item: false,
                    can_edit_bill_total: false,
                    can_edit_table:true, can_edit_visitor_name:true
                }
            })
    }

    default_click_transaction(index, item)
    {
        if(!this.navParams.data.event)
        {
            this.info_transaction(index, item)
        }else
        {
            this.pay_transaction(index, item)
        }
    }

    transform_date(date)
    {
        return moment(date).format('HH:mm - DD MMM YYYY')
    }

    cancel_transaction(index, item)
    {
        let alert = this.alertCtrl.create({
            title: 'Success',
            subTitle: 'Orderan telah dibatalkan',
            buttons: ['OK']
        });

        let alertGagal = this.alertCtrl.create({
            title: 'Kesalahan',
            subTitle: 'Terdapat kesalahan saat membatalkan order. Silahkan dicoba kembali!',
            buttons: ['OK']
        });

        let prompt = this.alertCtrl.create({
          title: 'Batalkan pesanan',
          message: "Silahkan isikan alasan",
          inputs: [
            {
              name: 'cancel_note',
              placeholder: 'Alasan pembatalan'
            },
          ],
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: data => {
                // console.log('Cancel clicked');
              }
            },
            {
              text: 'Save',
              handler: data => {
                  let loading = this.helper.loadingCtrl.create({
                      content: 'Silahkan tunggu'
                  })
                  loading.present();
                this.billProvider.cancel_bill(item.pay_id, data.cancel_note)
                .then( (res:any) =>{
                    loading.dismiss();
                    res = !this.helper.isJSON(res)? res : JSON.parse(res); 
                    if(res.code == 200)
                    {
                        alert.present();
                    }else
                    {
                        alertGagal.present()
                    }

                } )
                .catch( ()=>{
                    loading.dismiss();
                    alertGagal.present();
                } )

              }
            }
          ]
        });
        prompt.present();
    }

    advanceOptions(index, item)
    {

        if(item.payment_nominal <= 0 && item.payment_cancel_status == 0)
        {
            this.actionSheetCtrl.create({
              title: 'Opsi lanjutan',
              buttons: [
                {
                  text: 'Gabungkan Nota',
                  handler: () => {
                    // this.filter_transaction()
                  }
                },{
                  text: 'Pisahkan Nota',
                  handler: () => {
                    this.splitBill(index, item)
                  }
                },{
                  text: 'Lihat Detail Transaksi',
                  handler: () => {
                      this.info_transaction(index, item)
                  }
                }
              ]
            }).present();  
        }else if(item.payment_nominal > 0 && item.payment_cancel_status == 0)
        {
            this.actionSheetCtrl.create({
              title: 'Opsi lanjutan',
              buttons: [
                {
                  text: 'Lihat Detail Transaksi',
                  handler: () => {
                      this.info_transaction(index, item)
                  }
                }
              ]
            }).present();
        }
    }

    splitBill(index, item)
    {
        this.navCtrl.push(SplitBillPage,{
            index:index, bill:item,
            receipt_page_params:
            {
                can_edit_slide_item: false,
                can_edit_bill_total: false,
                can_edit_table:false, can_edit_visitor_name:false,
                show_footer:false,
                show_split_arrow: true
            }
        })
    }

}
