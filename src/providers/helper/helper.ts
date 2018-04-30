import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Platform, LoadingController, AlertController, ToastController, ActionSheetController, Events, PopoverController} from 'ionic-angular';
import { ConfigProvider } from '../../providers/config/config';
import { DbLocalProvider } from '../../providers/db-local/db-local';
import { PrinterServiceProvider } from '../../providers/printer-service/printer-service';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';
import { AiRemoteProvider } from '../../providers/ai-remote/ai-remote';
import { NativeAudio } from '@ionic-native/native-audio';

import * as $ from "jquery"

import * as moment from 'moment';
import * as html2canvas from "html2canvas";
import { UniqueDeviceID } from '@ionic-native/unique-device-id';



/*
  Generated class for the HelperProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
  */
  @Injectable()
  export class HelperProvider {
      public $:any=$;
      public moment:any=moment;
      public html2canvas:any=html2canvas;
      public outlet:any;
      public users_outlet:any;
      public win: any;
      private defaultTimeout: Number = 100;
      audioType: string = 'html5';
      sounds: any = [];
      uuid: any;
      constructor(
          public http: HttpClient, 
          public config: ConfigProvider, 
          public toast:ToastController, 
          public alertCtrl:AlertController, 
          public loadingCtrl: LoadingController, 
          public local: DbLocalProvider, 
          public storage:Storage,
          public actionSheet: ActionSheetController,
          public events:Events,
          public popoverCtrl:PopoverController,
          public platform: Platform,
          public printer: PrinterServiceProvider,
          public ajax: HTTP,
          public localNotifications: LocalNotifications,
          public airemote: AiRemoteProvider,
          public nativeAudio: NativeAudio,
          public uniqueDeviceID: UniqueDeviceID,

          ) {
          this.win = window;

          console.log('Hello HelperProvider Provider');
          this.platform.ready().then(() => {
              if (this.win.cordova && !this.win.DatecsPrinter) {
                  console.warn("DatecsPrinter plugin is missing. Have you installed the plugin? \nRun 'cordova plugin add cordova-plugin-datecs-printer'");
              }
          });
          if(platform.is('cordova')){
              this.audioType = 'native';
          }
          this.get_uuid();
      }

      get_uuid()
      {
        return new Promise((resolve, reject)=>{


            this.storage.get(this.config.variable.credential)
            .then((val) => {
                if(!this.platform.is('cordova'))
                {
                    this.storage.get('uuid')
                    .then((uuid:any) => {
                        if(!uuid)
                        {
                            this.uuid = val.outlet.outlet_id+'-'+this.moment().valueOf()+'-'+val.users.users_id;
                            this.storage.set('uuid', this.uuid);
                        }else
                        {
                            this.uuid = uuid;
                            this.local.set_params('uuid', this.uuid)
                        }
                        resolve(uuid);
                    })
                }else
                {
                    this.uniqueDeviceID.get()
                    .then((uuid: any)=>{

                        this.uuid = uuid? uuid: val.outlet.outlet_id+'-'+this.moment().valueOf()+'-'+val.users.users_id;
                        this.local.set_params('uuid', this.uuid)

                        resolve(uuid);
                    });
                }
            })

        })

      }

      uniqid()
      {
          var unique = (origArr) => {
                var newArr = [],
                    origLen = origArr.length,
                    found, x, y;

                for (x = 0; x < origLen; x++) {
                    found = undefined;
                    for (y = 0; y < newArr.length; y++) {
                        if (origArr[x] === newArr[y]) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        newArr.push(origArr[x]);
                    }
                }
                return newArr;
            };

            var uniqID =() => {
                var ts = +new Date;
                var tsStr = ts.toString();

                var arr = tsStr.split('');
                var rev = arr.reverse();


                var filtered = unique(rev);

                return filtered.join('')+(this.moment().unix());

            };

            return uniqID();

      }
      send_error(text)
      {
          // let url = this.config.base_url('')
          // this.$.post()
      }
      loading_countdown(ajax:any, options:any={duration:5000})
      {
          return new Promise((resolve, reject) =>
          {

              // uniqid asdasd
              let uniq = this.uniqid();
              // each time increase time
              let increase = options.increase||10000;
              // maximum time.
              let max_load = options.max_load||50000;
              // duration
              let duration = options.duration||30000;
              let isFullyLoaded = false;
              let variable = this.local.get_params(this.config.variable.credential);
              let cti = options.duration||increase

              // set loading
              let loader = this.loadingCtrl.create({
                  content: "Mengambil data. Silahkan tunggu! <span class='"+uniq+"'> "+(options.duration/1000)+" </span> detik",
                  duration: options.duration||duration,
              });

              let ct = window.setInterval(()=>{
                  cti = cti - 1000;
                  this.$('.'+uniq).text(cti/1000);
                  if(cti == 0)
                  {
                      window.clearInterval(ct)

                  }
              }, 1000);
              loader.present();

              let deff_aj = {type: 'POST'}
              ajax = Object.assign(deff_aj, ajax);

               let aj = this.$.ajax(ajax)
              .done((res)=>{
                  loader.dismiss();
                  window.clearInterval(ct)
                  isFullyLoaded = true;
                  resolve(res);
              })

              loader.onDidDismiss(()=>{
                  window.clearInterval(ct)

                  if(!isFullyLoaded)
                  {
                      aj.abort();
                      this.alertCtrl.create({
                          title: "Gagal mengambil data.",
                          message: "Coba lagi?",
                          buttons: [{
                              text: "Tidak",
                              handler: ()=>{
                                  loader.dismiss();
                                  resolve([]);
                              }
                          }, {
                              text: "Ya",
                              handler: ()=>{
                                  options.duration = options.duration + increase;
                                  options.reload = false;
                                  if(options.duration > max_load)
                                  {
                                      options.duration = 5000;
                                  }
                                  this.loading_countdown(ajax, options)
                                  .then((res)=>{
                                    resolve(res)
                                  })
                                  .catch((res)=>{
                                    reject(res)
                                  })
                              }
                          }]
                      }).present();
                  }  
              });

             
              /*.catch(()=>{
                  loader.dismiss();
                  window.clearInterval(ct)
                 this.alertCtrl.create({
                     title: "Kesalahan sambungan",
                     message: "Tidak dapat tersambung kedalam sistem. Pastikan koneksi internet anda stabil",
                     buttons: ["Tutup", {
                         text: "Ulangi",
                         handler: ()=>{
                             this.loading_countdown(fn, options)
                         }
                     }]
                 }).present();
                 reject();
              })*/
        });
          
      }

    /*
    @params
        - target = array
    */
    chaining_loading(target:any=[], options:any={})
    {
        options = Object.assign({
            name: "default"
        }, options)
        var len = target.length;
        var index = 0;
        var results:any = []

        var loading = (target_each)=>{
            return new Promise((resolve, reject)=>{
                this.loading_countdown(target_each)
                .then((res:any)=>{
                    res = this.isJSON(res)? JSON.parse(res):res;
                    var id = target[index]['id'] || 'chaining-'+index;
                    let res_ev = {id: id, status:1,results: res, ajax: target[index], index: index };
                    results.push(res_ev);
                    this.events.publish(options.name, res_ev)
                    
                    if(index == len -1)
                    {
                        this.events.publish(options.name, {status:2, results: results})
                    }
                    index = index + 1;
                    if(index < len)
                    {
                        loading(target[index])
                    }
                    resolve(res);
                })
                .catch((res)=>{
                     var id = target[index]['id'] || 'chining-'+index;
                    let res_ev = {id: id, status:1,results: res, ajax: target[index], index: index };
                    this.events.publish(options.name,res_ev)
                    reject();
                })
            })
        }

        loading(target[index])
    }

  /*
    Source
    - https://faisalman.com/2012/02/27/konversi-angka-ke-format-rupiah-di-javascript/
    */
    intToIDR(angka:any)
    {
        var rev     = parseInt(angka, 10).toString().split('').reverse().join('');
        var rev2    = '';
        for(var i = 0; i < rev.length; i++){
            rev2  += rev[i];
            if((i + 1) % 3 === 0 && i !== (rev.length - 1)){
                rev2 += '.';
            }
        }
        return rev2.split('').reverse().join('');

    }



    nativeWindow()
    {
        return window;
    }

    IDRtoInt(angka:any)
    {

        angka = angka? angka.toString() : '0';
        return parseInt(angka.replace(/,.*|\D/g,''),10)

    }

    isJSON(str) 
    {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return {status:true, result: JSON.parse(str)};
    }

    nominalToPercent(nominal:number, total:number)
    {
        return ((nominal/total)*100).toFixed(1);
    }

    percentToNominal(percent:number, total:number)
    {
        return total * (percent/100);
    }

    toInt(text:any)
    {
        return parseInt(text)
    }

    clone_object(data)
    {
        return Object.assign({}, data)
    }

    html_encode(value)
    {
        return $('<div/>').text(value).html();
    }

    html_decode(value)
    {
        return $('<div/>').html(value).text();
    }

    get_initial_outlet_name(name:string, join:string=null)
    {
        let nameArr = name.replace(/[^A-Za-z0-9]/g, ' ').split(' ');
        let initialName:any=[];
        $.each(nameArr, (i, val)=>{
            initialName.push(val[0])
        })
        if(join)
        {
            return initialName.join(join);
        }
        return initialName;
    }

    outlet_initial_name()
    {
        let outletName = this.local.get_params(this.config.variable.credential).outlet.outlet_name? this.local.get_params(this.config.variable.credential).outlet.outlet_name : 'OUTLET';
        return this.get_initial_outlet_name(outletName, '.');
    }

    outlet_active()
    {
        return this.local.get_params(this.config.variable.credential).outlet.outlet_id;
    }

  // audio
  preload(key, asset) {

      if(this.audioType === 'html5'){

          let audio = {
              key: key,
              asset: asset,
              type: 'html5'
          };

          this.sounds.push(audio);

      } else {

          this.nativeAudio.preloadSimple(key, asset);

          let audio = {
              key: key,
              asset: key,
              type: 'native'
          };

          this.sounds.push(audio);
      }      

  }

  play(key){

      let audio = this.sounds.find((sound) => {
          return sound.key === key;
      })

      if(audio.type === 'html5'){

          let audioAsset = new Audio(audio.asset);
          audioAsset.play();

      } else {

          this.nativeAudio.play(audio.asset).then((res) => {
              console.log(res);
          }, (err) => {
              console.log(err);
          })
          .catch(()=>{

          })

      }

  }

  zoom(type:string="in")
  {
      // this.navParams.data.zoom('out')
      this.events.publish('zoom.controller', {event: type})
  }

  lead_zero(value, length)
  {
      length = length || 5;
      value = value.toString();
      let val_len = value.length;
      if(val_len < length)
      {
          let chunk = length - val_len;
          let text = '';
          for (var i = 0; i < chunk; i++) {
              text += '0';
          }
          return text+value; 
      }
      return value;

  }

  closeApp()
  {
      this.platform.exitApp()
  }

}
