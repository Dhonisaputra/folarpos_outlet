import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ModalController, ViewController } from 'ionic-angular';
import { BillProvider } from '../../providers/bill/bill';
// import { ProductProvider } from '../../providers/product/product';
import { DbLocalProvider } from '../../providers/db-local/db-local';
import { TablePage } from '../table/table';
import { TotalPaymentEditorPage } from '../total-payment-editor/total-payment-editor';
import { EditReceiptItemPage } from '../edit-receipt-item/edit-receipt-item';
import { HelperProvider } from '../../providers/helper/helper'; 
import { MemberNewFormPage } from '../member-new-form/member-new-form'; 
import { MemberPage } from '../member/member'; 
import * as $ from "jquery"

/**
* Generated class for the ReceiptPage page.
*
* See https://ionicframework.com/docs/components/#navigation for more info on
* Ionic pages and navigation.
*/

@IonicPage()
@Component({
	selector: 'page-receipt',
	templateUrl: 'receipt.html',
})
export class ReceiptPage {
	receipts:any = [];
	sumPrice:number;
	GrandTotalPrice:number;
	tax:number;
	taxqty:number;
	visitor_name:string;
	visitor_table:number;
	event_handler:any={};
	bill:any=this.billProvider.default_bill_value();
	receipt_page_params:any= {
		can_edit_slide_item: true,
		can_edit_bill_total:true, 
		can_edit_table:false, 
		can_edit_visitor_name:false,
		show_footer:true,
		show_header:true,
		show_content:true,
		show_split_arrow:false,
	}

	constructor(public helper:HelperProvider, public navCtrl: NavController, public navParams: NavParams, public events: Events, private dbLocalProvider: DbLocalProvider, private billProvider: BillProvider, private modalCtrl:ModalController, public viewCtrl:ViewController) {
		this.receipts = []
		this.taxqty = 10;

		// if(navParams)

		// update data

		// event listener to update bill
	  	events.subscribe('bill.update', (data) => {
	  		this.trigger_update_receipt();
		});

		// event listener to get data bill and passing to emiter
		events.subscribe('get.data.receipt', (data) => {
			let data_receipts = this.billProvider.data_bill({	
				_passed_data 	: data,
			});

			events.publish('receive.data.receipt', data_receipts)
		});

		// event listener to reset data bill
		events.subscribe('reset.data.receipt', (data) => {
			this.billProvider.reset_bill();
			this.bill = {}
	  		this.trigger_update_receipt();
		});

		if(this.navParams.data.receipt_page_params)
		{
			this.update_page_parameters(this.navParams.data.receipt_page_params);
		}
	}

	// function trigger to updating data receipts
	trigger_update_receipt()
	{
		let data = this.billProvider.data_bill();
		this.set_receipts(data);
		this.billProvider.detection_order_session_from_orders(data.orders)

	}	

	update_receipt()
	{
		// let receipt = this.get_data_receipt();
		/*if(this.billProvider.get_bill_component('member_id'))
		{
			this.billProvider.set_bill_component('member_id', undefined);

			this.billProvider.set_bill_component('member', undefined);

			this.billProvider.set_bill_component('nota_screenshot', undefined);
		}*/

        this.billProvider.set_bill_component('visitor_name', this.bill.visitor_name);
        this.billProvider.update_bill_component({}, true);
	}

	get_data_receipt()
	{
		let receipt = {
            // GrandTotalPrice  : this.GrandTotalPrice,
            // sumPrice         : this.sumPrice,
            // tax              : this.tax,
            // receipts         : this.receipts,
            visitor_name     : this.bill.visitor_name,
            // visitor_table    : this.visitor_table,
            // taxqty    	 : this.taxqty,
        }
        return receipt;
	}
	set_receipts(data:any={})
    {
        this.bill = data;
    }

    get_orders()
    {
    	let orders = this.billProvider.get_bill_component('orders')

    	return orders;
    }


	ionViewDidLoad() {
	}
	ionViewWillUnload()
	{

	}
	update_page_parameters(data:any={})
	{
		this.receipt_page_params = Object.assign(this.receipt_page_params, data)
	}
	ionViewWillEnter()
	{

		switch (this.navParams.data.event) {
			case "transaction.edit":
				break;
			
			default:
  				this.trigger_update_receipt();

				break;
		}

		this.detect_parameters();

	}

	detect_parameters()
	{
		this.event_handler[this.navParams.data.events] = this.navParams.data;
		
	}

	change_table()
	{
		this.events.publish('bill.table.change', {})


		// if(this.receipt_page_params.can_edit_table)
		// {
			let index:number=-1;
			let isFound:boolean= false;
			let navCtrlLen:number=this.navCtrl.length();

			this.navCtrl.setRoot(TablePage, {
				previous: 'product-page',
				event: 'bill.changeTable',
				trigger_event: 'table.change',
				data: this.event_handler['table.pick']
			})
		// }

	}


	removeReceipt(ev, item)
	{
		// alert('removed')
	}

	removeItem(index, item)
	{
		this.billProvider.remove_order(index)
		this.billProvider.count_pricing()
		this.billProvider.update_bill()
		this.trigger_update_receipt();
	}
	reduceItem(index, item)
	{
		item = Object.assign({}, item)
		var dataitem = this.billProvider.get_order(index);
		if(item.detail_id)
		{
			delete item.detail_id;
			if(!this.billProvider.isset_order_session())
			{
				this.billProvider.add_order_session();
			}

			item.order_session = this.billProvider.get_active_order_session();
			item.id = item.product;
			item.qty = -Math.abs(1);
			item.price = -Math.abs(item.price * item.qty );

			this.billProvider.insert_item(item, 'reduce')
			this.billProvider.set_order_session_item_counter(item.order_session);

			this.trigger_update_receipt();
		}else
		{
			if(item.qty <= 0)
			{
				return false;
			}

			this.billProvider.update_order_item(index, 'qty', parseInt(item.qty) - 1)
			this.billProvider.count_pricing()
			this.billProvider.update_bill()
			this.trigger_update_receipt();
		}

	}
	addItem(index, item)
	{
		item = Object.assign({}, item)
		var dataitem = this.billProvider.get_order(index);
		if(item.detail_id)
		{
			delete item.detail_id;
			if(!this.billProvider.isset_order_session())
			{
				this.billProvider.add_order_session();
			}

			item.order_session = this.billProvider.get_active_order_session();
			item.id = item.product;

			this.billProvider.insert_item(item)
			this.billProvider.set_order_session_item_counter(item.order_session);

			this.trigger_update_receipt();
		}else
		{
			if(parseInt(dataitem.qty) >= parseInt(dataitem.stock))
			{
				return false;
			}else
			{
				this.billProvider.update_order_item(index, 'qty', parseInt(item.qty) + 1)
				this.billProvider.count_pricing()
				this.billProvider.update_bill()
				this.trigger_update_receipt();
			}
		}
	}
	editItem(item, index)
	{
		this.events.publish('bill.item.clicked', {item:item, index:index})

		if(!this.receipt_page_params.can_edit_slide_item)
		{
			return false
		}
		item.index = index;
		let modal = this.navCtrl.push(EditReceiptItemPage, item)
		// let modal = this.modalCtrl.create(EditReceiptItemPage, item)
		// modal.present();
		// modal.onDidDismiss(data => {
			// this.trigger_update_receipt();
	   // });
	}

	edit_total_payment()
	{
		if(!this.receipt_page_params.can_edit_bill_total)
		{
			return false;
		}
		// this.navCtrl.push(TotalPaymentEditorPage, {})
		let modal = this.modalCtrl.create(TotalPaymentEditorPage, {})
		modal.present();
		modal.onDidDismiss(data => {
			this.trigger_update_receipt();
	   });
	}


	openFormNewMember(data:any={})
	{
		let modal = this.modalCtrl.create(MemberNewFormPage, data.data)
		modal.onDidDismiss(data => {
			this.callbackNewMember(data);
	   	});
		modal.present();
	}
	callbackNewMember(data)
	{
		if(data.data)
		{
			this.bill.visitor_name = data.data.member_name
			this.billProvider.set_bill_component('member_id', data.data.member_id);
			this.billProvider.set_bill_component('member', data.data);
			this.helper.html2canvas($('.receipt-product')[0])
			.then((canvas) => {
		      	var img = canvas.toDataURL()
		      	// img = this.helper.html_encode(img);
		      	img = img.split(',')[1];
				this.billProvider.set_bill_component('nota_screenshot', img);
		    })
		    .catch(err => {
		      console.log("error canvas", err);
		    });
			this.update_receipt();
		}

	}
	openFormDataMember()
	{
		let modal = this.modalCtrl.create(MemberPage, {
			event: "pick.member",
			onClick: (member)=>{
				this.viewCtrl.dismiss(member)
			}
		});

		modal.onDidDismiss(data => {
			this.callbackNewMember(data);
	   	});
		modal.present();
		
	}
	optionVisitor()
	{
		let visitor_name =  this.bill.visitor_name;
		this.helper.actionSheet.create({
			title: 'Opsi lanjutan',
			buttons: [
				{
					text: 'Tambahkan Member',
					handler: () => {
						this.openFormNewMember({
							data:{
								member:{member_name : visitor_name}
							}
						})
					}
				},{
					text: 'Pilih Member',
					handler: () => {
						this.openFormDataMember()
					}
				}
			]
		}).present()
	}

	table_options()
	{
		let visitor_name =  this.bill.visitor_name;
		this.helper.actionSheet.create({
			title: 'Opsi lanjutan...',
			buttons: [
				{
					text: 'Ganti meja',
					handler: () => {
						this.change_table()
					}
				},{
					text: 'Ganti menjadi bungkus',
					handler: () => {
						this.bill.table_name = "Bungkus";
						this.update_receipt();
					}
				},{
					text: 'Hapus meja',
					handler: () => {
						this.bill.table_name = "";
						this.update_receipt();
					}
				}
			]
		}).present()
	}

}
