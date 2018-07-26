import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, App } from 'ionic-angular';
import { DbLocalProvider } from "../../providers/db-local/db-local";
import { ProductPage } from "../../pages/product/product";
import { DbTableProvider } from "../../providers/db-table/db-table";
import { HelperProvider } from '../../providers/helper/helper'; 
import { BillProvider } from '../../providers/bill/bill';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
declare let DatecsPrinter:any;


/**
 * Generated class for the TablePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  priority: 'high'
})
@Component({
  selector: 'page-table',
  templateUrl: 'table.html',
})
export class TablePage {
  DatecsPrinter: any;
  tableNum : any = [];
  outlet : number;
  tableSelect : any;
  multiple:boolean = false;
  tableChoosen:any = {};
  choose_type_order:number = 1;
  event_handler:any={};
  constructor(public screenOrientation: ScreenOrientation,public navCtrl: NavController, private appCtrl: App, public navParams: NavParams, private local : DbLocalProvider, private dbTableProvider: DbTableProvider, private helper: HelperProvider, private events:Events, private billProvider:BillProvider) {
    // this.helstorage.set('outlet', 1)
    // this.local.setdb('outlet', 1)
  	/*this.local.opendb('table')
  	.then((res)=>{
  		if(!res)
  		{
  			console.error('No Table defined. please do synchronize first!');
	  		this.tableNum = [];
  		}else
  		{
  			
	  		this.tableNum = res.results;
  		}
	  })*/
}	
  ionViewWillEnter()
  {
    this.detect_parameters();
    

    if(!this.navParams.data.trigger_event || this.navParams.data.trigger_event != 'table.change' )
    {

      /*if(this.helper.local.get_params(this.helper.config.variable.settings) && !this.helper.local.get_params(this.helper.config.variable.settings).choose_table_first)
      {
        this.navCtrl.setRoot(ProductPage);
      }*/

    }
  }


  ionViewDidLoad() {
    this.outlet = this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id;
    this.get_data_table();

  }

  refresh_data($event)
  {
    this.get_data_table()
    .then(()=>{
        $event.complete()
    })
    .catch(()=>{
        $event.complete()
    })
  }

  get_data_table()
  {
    return new Promise((resolve, reject)=>{
      if(this.helper.is_online())
      {
        this.dbTableProvider.get_table({outlet: this.outlet})
        .then( (res:any)=>{
          res = !this.helper.isJSON(res)? res : JSON.parse(res);
          if(res.code == 200)
          {
            this.helper.storage.set('md_table', res);
            this.tableNum = res.results;
            resolve()
          }else
          {
            reject()
          }
        })
        .catch(()=>{
            reject()
        })
      }else
      {
        this.helper.storage.get('md_table')
        .then((res:any)=>{
            this.tableNum = res.results;
             resolve()
        },()=>{
            reject()
        })
      }
    })
  }

  selectTable(index:number, tab_id:number)
  {
    if(this.is_selected(index))
    {
      delete this.tableChoosen[index];
    }else
    {
      if(!this.multiple)
      {
        this.tableChoosen = {}
      }
      this.tableChoosen[index] = this.tableNum[index];
    }
    // this.tableNum[index].status_meja = this.tableNum[index].status_meja?false:true;
  }

  is_selected(index:number)
  {
    return this.tableChoosen[index]? true : false;
  }
  is_selection_null()
  {
    return Object.keys(this.tableChoosen).length < 1? true : false;
  }

  change_order(number:number)
  {
    this.choose_type_order = number;
    switch (number) {
      case 1:
        // code...
        break;
      case 2:
        // code...
        this.billProvider.set_bill_component('table_name','Bungkus');
        this.billProvider.update_bill_component({},true);
        this.events.publish('bill.update', {})
        this.navCtrl.setRoot(ProductPage)
        break;
      
      default:
        // code...
        alert('undefined data')
        break;
    }
  }

  detect_parameters()
  {
    this.event_handler[this.navParams.data.event] = this.navParams.data;
    if(this.navParams.data.trigger_event)
    {
      switch (this.navParams.data.trigger_event) {
        case "table.change":
          break;
        
        default:
          // code...
          break;
      }
    }
  }

  order()
  {
    console.log(this.navParams.data.trigger_event)
    this.local.set_params('table.selected', this.tableChoosen);
    let trigger_event = this.navParams.data.trigger_event == 'table.change'? 'table.change' : 'order.pick';
    if(trigger_event == 'order.pick')
    {
      this.billProvider.reset_order_session();
      this.billProvider.set_bill_component('order_session',[]);
      this.billProvider.set_bill_component('orders',[]);
      this.billProvider.set_bill_component('visitor_name','');
      this.billProvider.update_bill_component({},true);
      this.events.publish('bill.update', {})
    }
    
    this.navCtrl.setRoot(ProductPage, {'previous': 'table-page', event:'table.pick', trigger_event: trigger_event, 'table': this.tableChoosen, 'multiple': this.multiple})
  }
}
