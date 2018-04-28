import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ConfigProvider } from '../../providers/config/config';
import { MenuController  } from 'ionic-angular';
import * as $ from "jquery"
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { HelperProvider } from '../../providers/helper/helper'; 

/*
  Generated class for the DbTableProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DbTableProvider {

  constructor(public helper: HelperProvider, public http: HttpClient, public storage: Storage, private config: ConfigProvider, private menuController     : MenuController, private screenOrientation   : ScreenOrientation,

    ) {
    console.log('Hello DbTableProvider Provider');
  }

  get_table(data:any={})
  {
  	// return this.storage.get('table')
    let urlTable = this.config.base_url('admin/outlet/table/data/get')
    let dataTable = Object.assign({status: 1}, data)
    return this.helper.loading_countdown({url:urlTable, data:dataTable})
    .then((res:any)=>{
        res = JSON.parse(res);
        this.storage.set('table', res)
        .then(()=>{
            console.info('Data table has been updated')
        })
        .catch(()=>{
            console.error('Error occured when updating data table')
        })
        return res;
    })
    .catch(()=>{
      this.helper.alertCtrl.create({
        title: "Kesalahan saat mengambil data meja",
        message: "Silahkan coba lagi",
        buttons: ["OK"],
      }).present()
    })
  }

  
  get_table_storage()
  {

  }

}
