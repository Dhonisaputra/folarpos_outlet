import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController  } from 'ionic-angular';
import { BillProvider } from '../../providers/bill/bill';
import { ReceiptPage } from '../receipt/receipt';
import { ProductPage } from '../product/product';

/**
 * Generated class for the EditReceiptItemPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-receipt-item',
  templateUrl: 'edit-receipt-item.html',
})
export class EditReceiptItemPage {

  item: any;
  itemTemp:any;
  isChange:boolean=false;
  isUpdated:boolean=false;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public billProvider:BillProvider, private alertCtrl: AlertController) {
    this.item = {}

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditReceiptItemPage');
  }

  ionViewWillEnter()
  {
    this.item = {}
    // this.billProvider.update_data_bill()
    console.log(this.navParams.data.index)
    let item = this.billProvider.get_order(this.navParams.data.index);

    this.item = item?item:{}
    this.itemTemp = Object.assign({}, this.item);

  }

  closeModal()
  {
    this.billProvider.helper.play('audio');
    if(this.isChange)
    {
      this.billProvider.helper.alertCtrl.create({
        title: "Anda telah mengubah data, apakah anda ingin keluar?",
        subTitle: "Data anda tidak akan tersimpan.",
        buttons: [{
          text: "Keluar",
          handler: ()=>{
            this.isChange=false;
            this.cancelUpdate();
  	        this.viewCtrl.dismiss();
          },
        }, "Batal"]
      }).present();
    }else
    {
      this.viewCtrl.dismiss();
      
    }
  }
  cancelUpdate()
  {
      this.billProvider.helper.play('audio');
    console.log(this.itemTemp)
    this.billProvider.set_order(this.navParams.data.index, this.itemTemp);
    this.billProvider.update_bill()
    this.billProvider.count_pricing()
    this.viewCtrl.dismiss();
  }

  countChargeNominal(el:any={})
  {
    this.isChange = true;
    let product_price = this.billProvider.helper.IDRtoInt( this.billProvider.get_order_item(this.item.index, 'price') )
    let qty = this.billProvider.helper.IDRtoInt( this.billProvider.get_order_item(this.item.index, 'qty') )

    let val = this.billProvider.helper.IDRtoInt( this.item.discount_percent )
    if(val >= 99 && el.target)
    {
      val = 99;
      this.billProvider.helper.$(el.target).val(val)
      this.item.discount_percent = val;
    }

    let price = this.billProvider.helper.IDRtoInt(this.item.price)
    let chargeNominal = price * (val/100);
    
    this.item.totalWithCharge = this.billProvider.helper.intToIDR( price + chargeNominal );
    this.item.discount_nominal = this.billProvider.helper.intToIDR( chargeNominal )
    // this.billProvider.update_order_item(this.item.index, 'discount_nominal', chargeNominal)

    // this.billProvider.update_order_item(this.item.index, 'total', (product_price*qty)-chargeNominal)
  }

  countChargePercent(el:any={})
  {
    this.isChange = true;
    let product_price = this.billProvider.helper.IDRtoInt( this.billProvider.get_order_item(this.item.index, 'price') )
    let qty = this.billProvider.helper.IDRtoInt( this.billProvider.get_order_item(this.item.index, 'qty') )
    let val = this.billProvider.helper.IDRtoInt( this.item.discount_nominal )
    let price = this.billProvider.helper.IDRtoInt(this.item.price)

    if(val >= product_price && el.target)
    {
      val = product_price;
      this.billProvider.helper.$(el.target).val(val)
      this.item.discount_nominal = val;
    }

    val = val?val:0;

    this.item.discount_percent = ((val/price)*100).toFixed(1); // to make 1 digit after comma
    this.item.totalWithCharge = this.billProvider.helper.intToIDR( price + val );
    // this.billProvider.update_order_item(this.item.index, 'discount_percent', this.item.discount_percent)
    // this.billProvider.update_order_item(this.item.index, 'total', (product_price*qty)-val)
  }

  changeNotes()
  {
    this.isChange = true;
    this.item.note = this.item.note?this.item.note:'';
    // this.billProvider.update_order_item(this.item.index, 'notes', this.item.note)
    // this.ionViewWillEnter()
  }

  changeComplementNotes()
  {
    this.isChange = true;
    this.item.complement_note = this.item.complement_note?this.item.complement_note:'';
    // this.billProvider.update_order_item(this.item.index, 'complement_note', this.item.complement_note)
    // this.ionViewWillEnter()
  }

  changeComplementItems(type:string='input', el:any={})
  {
      this.billProvider.helper.play('audio');
    this.isChange = true;
    let qty;
    switch (type) {
      case "input":
        qty = this.billProvider.get_order_item(this.item.index, 'qty')
        let complement_item = this.item.complement_item > qty ? qty : this.item.complement_item;

        if(this.item.complement_item >= qty && el.target)
        {  
          this.billProvider.helper.$(el.target).val(complement_item)
          this.item.complement_item = complement_item;
        }  

        this.billProvider.update_order_item(this.item.index, 'complement_item', this.item.complement_item)
        break;

      case "reduce":
        this.item.complement_item -=1;
        if(this.item.complement_item < 1)
        {
          this.item.complement_item = 1;
        }
        this.billProvider.update_order_item(this.item.index, 'complement_item', this.item.complement_item)
        break;

      case "add":
        // code...
        this.item.complement_item +=1;
        qty = this.billProvider.get_order_item(this.item.index, 'qty')
        this.item.complement_item = this.item.complement_item > qty ? qty : this.item.complement_item;
        this.billProvider.update_order_item(this.item.index, 'complement_item', this.item.complement_item)
        break;
      
      default:
        // code...
        break;
    }
    // this.ionViewWillEnter()
  }
  changeComplementStatus()
  {
    this.isChange = true;
    let product_price = this.billProvider.helper.IDRtoInt( this.billProvider.get_order_item(this.item.index, 'price') )
    let qty = this.billProvider.helper.IDRtoInt( this.billProvider.get_order_item(this.item.index, 'qty') )
    let complement_status = this.item.complement_status? 1 : 0;

    this.billProvider.update_order_item(this.item.index, 'complement_status', complement_status);

    if(this.item.complement_status > 0)
    {
      // jika ditemukan complement < 1, maka lakukan complement semuanya.
      if(!this.item.complement_item || this.item.complement_item < 1)
      {
        this.item.complement_item = this.billProvider.get_order_item(this.item.index, 'qty')
      }else
      {
        
      }

      // update total
      if(this.item.complement_item == qty)
      {
        this.billProvider.update_order_item(this.item.index, 'total', 0)  
      }else
      {
        let not_complement = qty - this.item.complement_item;
        let price = not_complement * product_price;
        this.billProvider.update_order_item(this.item.index, 'total', price)  
         
      }
      
      // simpan complement item.
      this.billProvider.update_order_item(this.item.index, 'complement_item', this.item.complement_item)  
    }else
    {
      this.item.complement_item = 0;
      this.billProvider.update_order_item(this.item.index, 'total', product_price*qty)  
      this.billProvider.update_order_item(this.item.index, 'complement_item', 0)  
      this.countChargeNominal()
    }
    // this.ionViewWillEnter()
  }



  reduceItem()
  {
      this.billProvider.helper.play('audio');
    this.isChange = true;
    var dataitem = this.billProvider.get_order(this.item.index);
    if(dataitem.qty <= 1)
    {
      return false;
    }else
    {
      this.item.qty = parseInt(this.item.qty) - 1
      // this.billProvider.update_order_item(this.item.index, 'qty', parseInt(this.item.qty) - 1)
      // this.billProvider.count_pricing()
      // this.ionViewWillEnter()
      // this.trigger_update_receipt();
    }

  }
  addItem()
  {
    this.billProvider.helper.play('audio');
    this.isChange = true;
    var dataitem = this.billProvider.get_order(this.item.index);
    this.item.qty = parseInt(this.item.qty) + 1
    
      // this.billProvider.update_order_item(this.item.index, 'qty', parseInt(this.item.qty) + 1)
      // this.billProvider.count_pricing()
      // this.ionViewWillEnter()
      // this.trigger_update_receipt();
    
  }

  updateItem()
  {
      let alertErrorProduct = this.alertCtrl.create({
          title: 'Kesalahan',
          subTitle: 'Mohon untuk mengisi catatan complement!',
          buttons:["OK"]
      });

      if(this.item.complement_status > 0 && ( !this.item.complement_note || this.item.complement_note.toString().length < 1) )
      {
        alertErrorProduct.present();
        return false;
      }

      this.billProvider.set_order(this.navParams.data.index, this.item);
      this.changeComplementStatus();
      this.billProvider.update_bill()
      this.billProvider.count_pricing()
      this.isChange = false;
      this.isUpdated=true;
      this.viewCtrl.dismiss();
      // this.closeModal();
      // this.navCtrl.pop({})
      /*this.navCtrl.setRoot(ProductPage,{
        event: 'order.return',
        trigger_event: 'order.return',
        page_params:
        {
          use_temporary_data: true
        }
      })*/
  }

  

}
