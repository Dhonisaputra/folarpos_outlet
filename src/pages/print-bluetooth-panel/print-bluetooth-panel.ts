import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PrinterServiceProvider } from "../../providers/printer-service/printer-service"
import { HelperProvider } from "../../providers/helper/helper";
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';

/**
 * Generated class for the PrintBluetoothPanelPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-print-bluetooth-panel',
  templateUrl: 'print-bluetooth-panel.html',
})
export class PrintBluetoothPanelPage {
  win:any;
  data_printer:any={print_type: 80,outlet_printer_connect_with: 'wifi' }
  printer_connection: boolean;
  printer_connected:any=[];
  printer_list:any=[];
  printer_unconnected:any=[];
  default_printer:any=[];
  data_printer_type:any=[];
  outlet_id:any;
  state: any='index';
  search_print: boolean;

  form_status:boolean=false;
  data_status:boolean=true;
  printer_list_status:boolean=false;
  constructor(private bluetoothSerial: BluetoothSerial, public navCtrl: NavController, public navParams: NavParams, private helper: HelperProvider, private printer:PrinterServiceProvider ) {
    this.search_print = false  
    this.outlet_id = this.helper.local.get_params(this.helper.config.variable.credential).data.outlet_id;
    this.getDefaultPrinter();
    if(this.helper.platform.is('tablet'))
    {
      this.form_status = true;
    }
  }

  ionViewDidLoad() {
    this.get_printer_type()
    this.get_printer();
  }

  checking_bluetooth_connection()
  {
    let printLoading = this.helper.loadingCtrl.create({
      content: "Memeriksa printer"
    })
    printLoading.present();
    this.check_unpaired_device();
    
  }

  search_bluetooth_printer(e)
  {
    let element = this.helper.$(e._elementRef.nativeElement)
    let isTrue = element.prop('checked')
    if(this.printer_connection)
    {
      this.data_printer.outlet_printer_connect_with = 'bluetooth';
      this.printer_list_status = true;
      this.form_status = false;
      this.data_status = false;

      this.check_unpaired_device();    
    }else
    {
      this.data_printer.outlet_printer_connect_with = 'wifi';
      this.data_printer.outlet_printer_address = '';
      this.data_printer.outlet_printer_name = '';
    }
    // data_printer.outlet_printer_connect_with
  }

  get_printer()
  {
     let url = this.helper.config.base_url('admin/outlet/printer/get');
     this.helper.loading_countdown({
       url: url,
       data: {where : {outlet_printer_status: 2, outlet_id: this.outlet_id}}
     })
     .then((res:any)=>{
       res = JSON.parse(res)
       if(res.code == 200)
       {
         this.printer_list = res.data;
       }else
       {
         this.printer_list = [];
       }
     })
     .catch(()=>{
         this.printer_list = [];
     })

  }

  addPrinter()
  {
    this.form_status = true;
    this.data_status = false;

  }
  savePrinter()
  {
     let url = this.helper.config.base_url('admin/outlet/printer/save');
     this.data_printer.outlet_id = this.outlet_id;
     this.helper.loading_countdown({
       url: url,
       data: this.data_printer
     })
    .then((res:any)=>{
      res = JSON.parse(res);
      if(res.code == 200)
      {
        this.data_printer.outlet_printer_address = '';
        this.data_printer.outlet_printer_name = '';
        this.get_printer();
      }else
      {
        this.helper.alertCtrl.create({
          title: "Tidak dapat menyimpan data",
          message: "pastikan koneksi internet anda aktif",
          buttons: ["OK"]
        }).present();
      }
    })
    .catch(()=>{
        this.helper.alertCtrl.create({
          title: "Tidak dapat menyimpan data",
          message: "pastikan koneksi internet anda aktif",
          buttons: ["OK"]
        }).present();
    })
  }

  get_printer_type()
  {
    let url = this.helper.config.base_url('admin/outlet/printer/type');
    this.helper.loading_countdown({url:url})
    .then((res:any)=>{
      res = JSON.parse(res);
      this.data_printer_type = res.data;
    })

  }

  check_unpaired_device()
  {
    this.search_print = true;
    let printLoading = this.helper.loadingCtrl.create({
      content: "Memeriksa printer"
    })
    printLoading.present();
  

    this.printer.listBluetoothDevices()
    .then((devices)=>{
      console.log(devices)
      printLoading.dismiss()
      if(Array.isArray(devices) )
      {
        this.printer_unconnected = devices;
      }
    }, (err)=>{
      console.log(err)
      printLoading.dismiss()
      this.helper.alertCtrl.create({
        title: "Kesalahan saat memeriksa printer",
        message: "Terjadi kesalahan ketika memeriksa ketersediaan printer.",
        buttons: ["OK"]
      }).present();
    })
  }

  itemSelected(item)
  {

    this.helper.local.setdb('printer_connected', item)
    .then(()=>{

      this.printer.connect(item.address)
      .then(()=>{
        this.data_printer.outlet_printer_address = item.address;
        this.data_printer.outlet_printer_name = item.aliasName;
        this.printer_list_status = false;
        this.form_status = true;
      })
      // this.getDefaultPrinter();
      this.default_printer = item;
      this.helper.toast.create({
        message: item.aliasname+" dipilih",
        duration: 2000
      }).present();
    })


  }

  getDefaultPrinter()
  {
    this.helper.local.opendb('printer_connected')
    .then((device)=>{
      this.default_printer = device?device:{};
    })
  }

  pairDevice(item)
  {

  }

  resetDevices()
  {
    this.helper.local.setdb('printer_connected', {})
  }

}
