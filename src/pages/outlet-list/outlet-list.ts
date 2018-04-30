import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { HelperProvider } from '../../providers/helper/helper';
import { LoginPage } from '../login/login';
import { TablePage } from '../table/table'; 
import { ProductPage } from '../product/product'; 
import { SplashScreen } from '@ionic-native/splash-screen';
import { WaitersPage } from '../waiters/waiters'; 
import { ScreenOrientation } from '@ionic-native/screen-orientation';



/**
* Generated class for the OutletListPage page.
*
* See https://ionicframework.com/docs/components/#navigation for more info on
* Ionic pages and navigation.
*/

@IonicPage()
@Component({
    selector: 'page-outlet-list',
    templateUrl: 'outlet-list.html',
})
export class OutletListPage {
    uid:any='';
    outlets:any=[];
    isSearch: any = false;
    constructor(public screenOrientation: ScreenOrientation, private splashScreen : SplashScreen, public navCtrl: NavController, public navParams: NavParams, public device_id: UniqueDeviceID, private helper:HelperProvider, public platform: Platform) {

        this.helper.local.set_params('login_outlet_device', false)

        this.helper.airemote.initialize({}, ()=>{
            this.helper.airemote.subscribe('outlet_list.refresh', ()=>{
                this.get_outlet();
            })
        })

        this.helper.storage.get(this.helper.config.variable.credential)
        .then((val) => {
            if(!this.platform.is('cordova'))
            {
                this.helper.storage.get('uuid')
                .then((uuid:any) => {
                    if(!uuid)
                    {
                        this.uid = val.outlet.outlet_id+'-'+this.helper.moment().valueOf()+'-'+val.users.users_id;
                        this.helper.storage.set('uuid', this.uid);
                    }else
                    {
                        this.uid = uuid;
                        this.helper.local.set_params('uuid', this.uid)
                    }
                    this.get_outlet()
                })
            }else
            {
                this.device_id.get()
                .then((uuid: any)=>{

                    this.uid = uuid? uuid: val.outlet.outlet_id+'-'+this.helper.moment().valueOf()+'-'+val.users.users_id;
                    this.helper.local.set_params('uuid', this.uid)
                    this.get_outlet()
                    this.helper.airemote.socket_listener_general()

                });
            }
        })

    }

    get_outlet_refresh($event)
    {
        let aj = this.get_outlet()
        aj
        .then(()=>{
            
                $event.complete();
        })
    }

    get_outlet()
    {
        return new Promise((resolve, reject)=>{

            if(!this.helper.local.get_params(this.helper.config.variable.credential))
            {
                this.navCtrl.setRoot(LoginPage)
                return false;
            }

            let users_id = this.helper.local.get_params(this.helper.config.variable.credential).users.users_id;
            let url = this.helper.config.base_url('admin/outlet/employee');
            this.helper.loading_countdown({url: url, data: {users_id:users_id, smartphone:true, uuid:this.uid} })
            .then((res:any)=>{
                res = JSON.parse(res)
                this.outlets = res
                this.isSearch = true;
                resolve(res)
            })
            .catch(()=>{
                // reject()
                this.isSearch = true;
                this.outlets = []
            })
        })
    }

    selectOutlet(item)
    {
        this.helper.play('audio');

        let pending_devices = item.pending_devices? item.pending_devices.split(',') : [];
        let active_devices = item.connected_devices? item.connected_devices.split(','): [];
        if(pending_devices.indexOf(this.uid) >= 0)
        {
            this.helper.alertCtrl.create({
                title: "Menunggu konfirmasi",
                message: "Anda telah melakukan permintaan hak akses, silahkan menunggu konfirmasi dari outlet",
                buttons: ["OK"]
            }).present();
            return false;

        }else if(!item.device_status_confirmation || active_devices.indexOf(this.uid) < 0 )
        {
            this.helper.alertCtrl.create({
                title: "",
                message: "Device anda belum terdaftar dalam outlet "+item.outlet_name+' pilih "Kirim permintaan akses" untuk mengirimkan permintaan akses kepada outlet.',
                buttons: ["Tutup", {
                    text: "Kirim permintaan akses",
                    handler: ()=>{
                        let loading = this.helper.loadingCtrl.create({
                            content: "Mengirimkan permintaan. Silahkan tunggu!"
                        });

                        // loading.present();

                        let users_id = this.helper.local.get_params(this.helper.config.variable.credential).users.users_id;
                        let url = this.helper.config.base_url('admin/device/authority/request');
                        let data = {
                            users_id: users_id,
                            outlet_id: item.outlet_id,
                            uuid: this.uid
                        }
                        this.helper.loading_countdown({url:url, data:data})
                        .then((res:any)=>{
                            // loading.dismiss();

                            res = JSON.parse(res);
                            switch (res.code) {
                                case 200:
                                this.helper.alertCtrl.create({
                                    title: "Permintaan hak akses sukses",
                                    message: "Menunggu konfirmasi dari admin outlet",
                                    buttons: ["OK"]
                                }).present();
                                this.get_outlet();
                                break;

                                case 304:
                                this.helper.alertCtrl.create({
                                    title: "Permintaan hak akses outlet",
                                    message: "Permintaan telah dikirimkan. Menunggu konfirmasi outlet",
                                    buttons: ["OK"]
                                }).present();
                                break;

                                default:
                                this.helper.alertCtrl.create({
                                    title: "Permintaan hak akses Gagal",
                                    message: "Terdapat kesalahan saat melakukan pengiriman hak akses ke outlet. Silahkan ulangi kembali!",
                                    buttons: ["OK"]
                                }).present();
                                break;
                            }
                        })
                        .catch(()=>{
                            this.helper.alertCtrl.create({
                                title: "Permintaan hak akses Gagal",
                                message: "Terdapat kesalahan saat melakukan pengiriman hak akses ke outlet. Silahkan ulangi kembali!",
                                buttons: ["OK"]
                            }).present();
                        })
                    }
                }]
            }).present();
        }else
        {
            let data = this.helper.local.get_params(this.helper.config.variable.credential);
            data.outlet = Object.assign(data.outlet, item);
            data.data = Object.assign(data.data, item);
            data.outlet_device = item;
            data.outlet_device.uuid = this.uid;

            this.helper.storage.set(this.helper.config.variable.credential, data);
            this.helper.local.set_params(this.helper.config.variable.credential, data);
            this.helper.storage.get(this.helper.config.variable.settings)
            .then( (resSettings)=>{
                let default_page = resSettings && !resSettings.choose_table_first?  ProductPage : TablePage ;
                this.helper.local.set_params('login_outlet_device', true)
                this.helper.airemote.socket_listener()

                this.helper.airemote.send(item.outlet_id+'.notif.ring','',{uuid: this.uid, toast: true, title:"Pemberitahuan perangkat terhubung", text: data.users.users_fullname+" tersambung kedalam sistem."}, () => {

                    if(item.outlet_roles_id == 3)
                    {
                        this.navCtrl.setRoot(WaitersPage);

                    }else{
                        if( this.platform.is('android') )
                        {
                            this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE)
                            .catch(()=>{
                            })
                        }
                        this.navCtrl.setRoot(default_page);
                    }
                })
            })

        }
    }

    ionViewDidLoad() {

// console.log('ionViewDidLoad OutletListPage');
}

}
