import { HttpClient } from '@angular/common/http';
import { Events, AlertController, ToastController} from 'ionic-angular';
import { Injectable } from '@angular/core';
import { DbLocalProvider } from '../../providers/db-local/db-local';
import { ConfigProvider } from '../../providers/config/config';
import * as io from 'socket.io-client';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Network } from '@ionic-native/network';
/*
Generated class for the AiRemoteProvider provider.

See https://angular.io/guide/dependency-injection for more info on providers
and Angular DI.
*/
@Injectable()
export class AiRemoteProvider {
    io:any = io;
    options:any={}
    socket:any;
    isInitialize:boolean=false;
    isListen:boolean=false;
    isListenGeneral:boolean=false;
    constructor(
        public http: HttpClient,
        public toast: ToastController, 
        public localNotifications: LocalNotifications, 
        private alert: AlertController, 
        private local: DbLocalProvider, 
        private config: ConfigProvider, 
        private events: Events,
        private network: Network
        ) {
        this.options = this.default_params();
        this.network_connection();
    }

    initialize(params, connect)
    {
        if(!this.isInitialize)
        {
            this.options = Object.assign(this.options, params);
            this.options.url = this.options.host+'?cluster='+this.options.apiKey;
            this.socket = this.io(this.options.url)
            this.isInitialize = true;
            this.socket.on('connect', ()=>{
                if(typeof connect == 'function')
                {
                    connect();
                }
            })
        }
    }

    network_connection()
    {
        let conn = this.alert.create({
            message: "Anda tidak memiliki koneksi. Pastikan anda memiliki akses internet",
            enableBackdropDismiss: false,
            title: "Koneksi terputus"
        });
        let contoasting = this.toast.create({
            position: 'top',
            message: "Tidak ada koneksi ditemukan! ",
            dismissOnPageChange: false
        });
        
        this.network.onchange()
        .subscribe((res)=>{
            console.log(res)
        })

        this.network.onDisconnect().subscribe(() => {
            conn.present();
            contoasting.present();
            this.local.set_params('connection',false);
        
        });

        this.network.onConnect().subscribe(() => {
            this.local.set_params('connection',true);
            conn.dismiss();
            this.toast.create({
                message: "Koneksi kembali tersedia",
                duration: 4000,
                position: 'top'
            })
            contoasting.dismiss();
            
            conn = this.alert.create({
                message: "Anda tidak memiliki koneksi. Pastikan anda memiliki akses internet",
                enableBackdropDismiss: false,
                title: "Koneksi terputus"
            });

            contoasting = this.toast.create({
                position: 'top',
                message: "Tidak ada koneksi ditemukan! ",
                dismissOnPageChange: false
            });

        });

    }
    default_params()
    {
        return {
            host:'https://folariumremote.herokuapp.com/',
            apiKey:'instantFolar3030' ,
            id:undefined
        }
    }
    subscribe(event, fn)
    {	
        event = this.options.apiKey+"_"+event;
        this.socket.on(event, fn)
    }

    send(event, target, data, fn)
    {
        fn = typeof fn == 'undefined'? function(){} : fn;

        data = {

            target: target,
            uuid: this.local.get_params(this.config.variable.credential).outlet_device.uuid,
            data: data,
            _props: {
                apiKey: this.options.apiKey
            }
        };
        this.socket.emit(event, data, fn);
    }

    socket_listener()
    {
        let isLogin = this.local.get_params('login_outlet_device')

        if(!this.isListen)
        {

            let outlet_id = this.local.get_params(this.config.variable.credential).data.outlet_id;
            let data = this.local.get_params(this.config.variable.credential).data;
            let uuid = this.local.get_params(this.config.variable.credential).outlet_device.uuid;

            if(this.local.get_params(this.config.variable.credential).outlet.outlet_roles_id == 3)
            {

            }
            this.subscribe(outlet_id+'.waiters:proses-done', (res)=>{
                if(res.uuid && res.uuid == uuid){return false;}
                this.events.publish('transaction:refresh')
                this.events.publish('monitoring_request:refresh')
                this.localNotifications.schedule({
                    id: 1,
                    text: res.title,
                    sound: 'file://assets/audio/notification.mp3',
                    icon: 'file://assets/icon/official.png',
                    data: { secret: uuid }
                });
                this.toast.create({
                    message: res.title,
                    duration: 3000
                }).present();
            })

            if(this.local.get_params(this.config.variable.credential).outlet.outlet_roles_id != 3)
            {


                this.subscribe(outlet_id+'.app.cashier:new-order', (res)=>{
                    if(res.uuid && res.uuid == uuid){return false;}
                    console.log(res)
                    this.events.publish('transaction:refresh')
                    this.events.publish('monitoring_request:refresh')
                    this.localNotifications.schedule({
                        id: 1,
                        text: res.title,
                        sound: 'file://assets/audio/notification.mp3',
                        icon: 'file://assets/icon/official.png',
                        data: { secret: uuid }
                    });
                })
            }

            this.subscribe('app.'+uuid+'.'+outlet_id+'.authority.revoke', (res)=>{
                if(!isLogin)
                {
                    this.events.publish('outlet_list.refresh')
                    return false;
                }
                if(res.uuid && res.uuid == uuid){return false;}
                this.alert.create({
                    title: "Anda telah dikeluarkan oleh admin",
                    subTitle: "Hak akses Anda telah dicabut oleh admin dari outlet ini. Silahkan hubungi admin outlet anda untuk keterangan lebih lanjut!",
                    buttons: [{
                        text: "Tutup",
                        handler: ()=>{
                            this.events.publish('outlet.signout')
                        }
                    }]
                }).present();
            })

            this.subscribe('app.'+uuid+'.authority.accepted', (res)=>{
                if(res.uuid && res.uuid == uuid){return false;}
                this.localNotifications.schedule({
                    id: 1,
                    icon: 'file://assets/icon/official.png',
                    text: 'Perangkat anda telah diperbolehkan untuk mengakses outlet '+data.outlet_name,
                    sound: 'file://assets/audio/notification.mp3',
                    data: { secret: uuid }
                });
            })

            this.isListen = true;
        }
    }  

    socket_listener_general()
    {
        let isLogin = this.local.get_params('login_outlet_device')

        if(!this.isListenGeneral)
        {

            let vari = this.local.get_params(this.config.variable.credential);
            let data = vari;
            let uuid = this.local.get_params("uuid");

            this.subscribe('app.'+uuid+'.authority.accepted', (res)=>{
                if(isLogin)
                {
                    return false;
                }
                if(res.uuid && res.uuid == uuid){return false;}
                this.localNotifications.schedule({
                    id: 1,
                    text: 'Perangkat anda telah diperbolehkan untuk mengakses outlet '+data.outlet_name,
                    sound: 'file://assets/audio/notification.mp3',
                    icon: 'file://assets/icon/official.png',
                    data: { secret: uuid }
                });
                this.toast.create({
                    message: 'Perangkat anda telah diperbolehkan untuk mengakses outlet '+data.outlet_name,
                    duration: 2000
                }).present();

            })

            this.isListenGeneral = true;
        }
    }
}
