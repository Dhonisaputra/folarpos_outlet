import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DbLocalProvider } from '../../providers/db-local/db-local';
import { HelperProvider } from '../../providers/helper/helper';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { ErrorPage } from '../../pages/error/error';
import { LoginPage } from '../../pages/login/login';
import { PrintBluetoothPanelPage } from '../../pages/print-bluetooth-panel/print-bluetooth-panel';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  segment:string='menu';
  settings:any={
    choose_table_first:true
  };
  users:any={}
  constructor(public navCtrl: NavController, public navParams: NavParams, private db: DbLocalProvider, public helper: HelperProvider) {
    this.settings = Object.assign(this.settings, this.helper.local.get_params(this.helper.config.variable.settings) )
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  update_settings()
  {
    this.helper.local.set_params(this.helper.config.variable.settings, this.settings);
    this.helper.storage.set(this.helper.config.variable.settings, this.settings);
    this.helper.toast.create({
      message: "Settings telah diperbarui",
      duration: 1500
    }).present();
  }

  to_error_page(code, message)
  {
    this.navCtrl.push(ErrorPage, {code:code, message:message});
  }
  sync()
  {
  	this.db.sync();
  }
  logout()
  {
    this.helper.local.reset_params('is_login');
    this.helper.storage.remove(this.helper.config.variable.credential)
    this.helper.storage.remove('pinned_product')
    this.helper.local.set_params(this.helper.config.variable.credential,{users:{}, data:{}, outlet:{}, type_product:[]});
    this.helper.local.set_params('pinned_params',[]);
    this.navCtrl.setRoot(LoginPage);
  }

  openPrinterBluetoothPrinterSettings()
  {
    this.navCtrl.push(PrintBluetoothPanelPage);
  }

  updateUser()
  {
    if(this.users.new_password != this.users.rePassword)
    {
      this.helper.alertCtrl.create({
        title: "Kesalahan",
        message: "password tidak sama",
        buttons: ["OK"]
      }).present()
      return false;
    }
    let url = this.helper.config.base_url('sign/mobile_change_password')

    let users_id = this.helper.local.get_params(this.helper.config.variable.credential).users.users_id;
    this.helper.loading_countdown({url: url, data: {users_id: users_id, new_password: this.users.new_password, old_password: this.users.old_password }})
    .then((res:any)=>{
      res = JSON.parse(res);
      switch (res.code) {
        case 200:
          this.helper.toast.create({
            message: "password sudah diganti",
            duration: 2000
          }).present();
          break;

         case 404:
          this.helper.alertCtrl.create({
            title: "Kesalahan",
            message: "Pengguna tidak ditemukan",
            buttons: ["OK"]
          }).present();
          break;

        default:
        case 500:
          this.helper.alertCtrl.create({
            title: "Kesalahan Fatal",
            message: "System tidak dapat mengolah permintaan anda. Silahkan laporkan kepada pengembang sistem",
            buttons: ["OK"]
          }).present();
          break;
        case 304:
          this.helper.alertCtrl.create({
            title: "Tidak ada perubahan",
            message: "Password yang anda isikan sama dengan sebelumnya, tidak dapat melakukan perubahan",
            buttons: ["OK"]
          }).present();
          break;       
       }
      
    })
    .catch(()=>{
      this.helper.alertCtrl.create({
            title: "Kesalahan Fatal",
            message: "System tidak dapat mengolah permintaan anda. Silahkan laporkan kepada pengembang sistem",
            buttons: ["OK"]
          }).present();
    })
  }

}
