import { Injectable } from '@angular/core';
import { ConfigProvider } from '../../providers/config/config';
import { AlertController, Events, LoadingController  } from 'ionic-angular';
import * as $ from "jquery"
import { DbLocalProvider } from '../../providers/db-local/db-local';
import * as moment from 'moment';
import { HelperProvider } from '../../providers/helper/helper'; 

/*
Generated class for the BillProvider provider.

See https://angular.io/guide/dependency-injection for more info on providers
and Angular DI.
*/
@Injectable()
export class BillProvider {
    bill            :any = this.default_bill_value()
    temp_bill       :any = this.default_bill_value() // it will be temporary variable,
    records_bill    :any = [] // use if we want to create another bill
    

    constructor(public loadingCtrl: LoadingController, public config: ConfigProvider, public alertCont: AlertController, public dbLocalProvider: DbLocalProvider, private events: Events, public helper: HelperProvider) {

        this.pull_data_bill();
    }

    default_bill_value()
    {
        return {
            order_session: [],
            orders: [],
            payment_bills:0,
            payment_total:0,
            payment_nominal:0,

            discount_nominal:0,
            discount_percent:0,
            discount_id:undefined,

            tax_nominal:0,
            tax_percent:0,

            outlet:undefined,
            visitor_name:'',
            table_id:undefined,
            
            payment_method:undefined,
            paid_nominal:undefined,
            paid_with_bank_nominal:undefined,

            table:{}

        };
    }

    save(data:any={})
    {
        return new Promise((resolve, reject)=>{

            let item = this.helper.local.get_params(this.helper.config.variable.credential).outlet;
            
            let alertData = this.alertCont.create({
                title: "Process gagal",
                message: "Terdapat kesalahan ketika menyimpan nota. Silahkan laporkan pengembang sistem.",
                buttons : ["Ok"]
            })

            let successData = this.alertCont.create({
                title: "Process selesai",
                message: "Nota telah disimpan",
                buttons : ["Ok"]
            })

            var url = this.config.base_url('admin/outlet/transaction/add')
            let billdata = this.data_bill(data)
            billdata = Object.assign(billdata, data)
            billdata.complement_status = data.complement_status == 'true'? 1 : 0;

            this.bill = billdata;

            return this.helper.loading_countdown({url: url, data:billdata}, {onload_title: "Menyimpan order. Silahkan tunggu.."})
            .then((res:any) => {
                console.log(res)
                res = !this.helper.isJSON(res)? res : JSON.parse(res);
                
                if(res.code == 200)
                {

                    this.helper.airemote.send(item.outlet_id+'.app.cashier:new-order','',{uuid: this.helper.uuid, title:"Terdapat pesanan baru"}, function(){})
                    successData.present();
                    resolve(res)

                }else
                {
                    reject(res)
                    alertData.present();
                }
            })
            .catch(()=>{
                reject({code:500})

                alertData.present();
            })
        })

    }
    get(data:any, opt:any={})
    {

        var url = this.config.base_url('admin/outlet/transaction/get')
        data = data
        return this.helper.loading_countdown({url:url, data:data}, opt)
    }
    
    get_unpaid_bill(data:any, opt:any={})
    {
        return this.get(data, opt)
    }

    get_bill()
    {
        return this.bill;
    }

    set_bill_component(name:string, value:any, value_default:any='', also_save_temp:boolean=false)
    {
        this.bill[name] = this.bill[name]?this.bill[name]:value_default
        this.bill[name] = value;
        if(also_save_temp)
        {
            this.temp_bill[name] = this.temp_bill[name]?this.temp_bill[name]:value_default
            this.temp_bill[name] = value;
        }
    }

    get_bill_component(name:any=undefined, get_temp:boolean=false)
    {
        if(!name)
        {
            return this.bill;
        }
        return get_temp? this.temp_bill[name] : this.bill[name];
    }
    update_bill_component(data:object={}, update_db:boolean=false, merge:boolean=true)
    {
        console.log(data, this.bill, merge)
        if(merge)
        {
            this.bill = Object.assign(this.bill, data)
        }else
        {
            this.bill = Object.assign(data,{})
        }
        this.temp_bill = this.bill

        this.detection_order_session_from_orders(this.bill.orders, true)
        

        if(update_db)
        {
            this.update_bill();
        }
    }

    put_bill_component(data:object={})
    {
        this.bill = data
        this.temp_bill = this.bill
    }

    // O R D E R
    public get_order(index:number)
    {
        return this.get_bill_component('orders')[index];
    }

    set_order(index:number, content:any={})
    {
        this.get_bill_component('orders')[index] = content;
    }
    insert_order(data:any)
    {
        this.get_bill_component('orders').push(data);
    }

    remove_order(index)
    {
        this.get_bill_component('orders').splice(index, 1);
    }
    
    update_order_item(index, name, value)
    {
        let order = this.get_order(index);
        if(order)
        {
            order[name] = value;
        }

    }
    set_order_item(index, name, value)
    {
        this.update_order_item(index, name, value);
    }

    public get_order_item(index:number, name:string='')
    {
        let order = this.get_bill_component('orders');
        return name.length < 1? undefined : this.get_order(index)[name];
    }

    delete_order_item(index:number, name:string='')
    {
        let order = this.get_bill_component('orders');
        if(name.length)
        {
            delete this.get_order(index)[name];
        }
    }

    // E N D  O F  O R D E R



    public check_existences_order(id, event:string='add')
    {
        if(!id)
        {
            return {exist: false, index:-1}
        }
        let order = this.get_bill_component('orders');
        

        // search object array that contain event == event[add||reduce]
        var result = order.map(function(res){
            if(res.event && res.event == event)
            {
                return res.id
            }
        }).indexOf(id);
        return {index: result, exist: result < 0? false : true}
    }

    // only for bill that has been saved in database
    public check_existences_product(product, order_session:number, event:string='add')
    {
        if(!product)
        {
            return {exist: false, index:-1}
        }
        let order = this.get_bill_component('orders');
        

        // search object array that contain event == event[add||reduce]
        var result = order.map(function(res){
            if(res.order_session == order_session)
            {
                return res.product
            }
        }).indexOf(product);
        return {index: result, exist: result < 0? false : true}
    }


    // METHOD
    insert_item(item, event:string='add')
    {

        let existence = this.check_existences_order(item.id, event)
        
        item.event = event;
        if(existence.exist && existence.index > -1)
        {
            let order = this.get_bill_component('orders');
            order[existence.index].qty       = parseInt(order[existence.index].qty) + 1;
            order[existence.index].total     = parseInt(order[existence.index].qty) * parseInt(order[existence.index].price);
            order[existence.index].total     = (order[existence.index].discount_nominal)? parseInt(order[existence.index].total) - order[existence.index].discount_nominal : order[existence.index].total;

            $('#receipt-product-'+item.id+'-'+event+' .product-amount').addClass('pulse')
            setTimeout(function(){
                $('#receipt-product-'+item.id+'-'+event+' .product-amount').removeClass('pulse')
            },800)
        }else{
            item.qty = item.qty && event != 'add' ?item.qty:1;
            item.total = item.price * item.qty;
            item.total = item.discount_nominal? parseInt(item.discount_nominal) - item.total : item.total;
            this.insert_order(item)
        }
        this.count_pricing()
        this.update_bill();
    }

    // only for bill that has been saved in database
    insert_product(item, event:string='add')
    {

        let existence = this.check_existences_product(item.product, item.order_session, event)
        
        item.event = event;
        console.log(item, existence, this.get_bill_component('orders'))
        if(existence.exist && existence.index > -1)
        {
            let order = this.get_bill_component('orders');
            order[existence.index].qty       = parseInt(order[existence.index].qty) + 1;
            order[existence.index].total     = parseInt(order[existence.index].qty) * parseInt(order[existence.index].price);
            order[existence.index].total     = (order[existence.index].discount_nominal)? parseInt(order[existence.index].total) - order[existence.index].discount_nominal : order[existence.index].total;

            $('.receipt-product-'+item.product+'-'+event+' .product-amount').addClass('pulse')
            setTimeout(function(){
                $('.receipt-product-'+item.product+'-'+event+' .product-amount').removeClass('pulse')
            },800)
        }else{
            item.qty = item.qty && event != 'add' ?item.qty:1;
            item.total = item.price * item.qty;
            item.total = item.discount_nominal? parseInt(item.discount_nominal) - item.total : item.total;
            this.insert_order(item)
        }
        this.count_pricing()
        this.update_bill();
    }

    count_pricing()
    {

        this.set_bill_component('payment_bills',0);
        this.set_bill_component('payment_total',0);

        let payment_total = this.get_bill_component('payment_total');
        let payment_bills = this.get_bill_component('payment_bills');
        let tax_nominal = this.get_bill_component('tax_nominal');
        let discount_nominal = this.get_bill_component('discount_nominal');
        let discount_percent = this.get_bill_component('discount_percent');
        let discount_id = this.get_bill_component('discount_id');

        

        tax_nominal = tax_nominal?parseInt(tax_nominal):0;
        discount_nominal = discount_nominal?parseInt(discount_nominal):0;

        let order = this.get_bill_component('orders');

        console.log(this.bill)
        $.each(order, (i, val)=>{
            if(!val.complement_status || parseInt(val.complement_status) < 1)
            {
                let total = order[i].qty * order[i].price    
                let order_discount_nominal = parseInt(val.discount_nominal);
                if(val.discount_percent)
                {
                    order_discount_nominal = this.helper.percentToNominal(val.discount_percent, total)
                }
                if(order_discount_nominal)
                {
                    total = total - order_discount_nominal;
                }
                this.update_order_item(i, 'total', total);
                this.update_order_item(i, 'discount_nominal', order_discount_nominal);

                order[i].total = total;
                order[i].discount_nominal = order_discount_nominal;
                
            }else
            {
                if(val.complement_item < val.qty)
                {
                    let total = (order[i].qty - val.complement_item) * order[i].price    
                    let order_discount_nominal = parseInt(val.discount_nominal);
                    if(val.discount_percent)
                    {
                        order_discount_nominal = this.helper.percentToNominal(val.discount_percent, total)
                    }

                    if(order_discount_nominal)
                    {
                        total = total - order_discount_nominal;
                    }
                    this.update_order_item(i, 'total', total);
                    this.update_order_item(i, 'discount_nominal', order_discount_nominal);

                    order[i].total = total;
                    order[i].discount_nominal = order_discount_nominal;

                }else
                {
                    order[i].total = 0;
                }
            }

        })


        let RestotalPrice = order.map((res) => {
            // lakukan pengechekan apakah order memiliki "complement_status";
            if( !res.complement_status || parseInt(res.complement_status) < 1 || (parseInt(res.complement_status) > 0 && res.complement_item < res.qty) )
            {
                return res.total
            }else
            {
                return 0;
            }
        })

        for (var i = 0; i < RestotalPrice.length; ++i) {
            payment_bills = payment_bills + parseInt(RestotalPrice[i]);
        }

        if(discount_id && discount_percent)
        {
            discount_nominal = this.helper.percentToNominal(discount_percent, payment_bills);
        }

        payment_total = payment_bills - discount_nominal + tax_nominal;

        this.set_bill_component('payment_bills', payment_bills, true);
        this.set_bill_component('payment_total', payment_total, true);
        this.set_bill_component('discount_nominal', discount_nominal, true);

    }

    set_bill(data)
    {
        // this.set_bill_component('orders', data.data);
        let orders = data.data||data.orders;
        this.set_bill_component('orders', orders);
        this.count_pricing()
        this.set_bill_component('visitor_name', data.visitor_name);
        this.set_bill_component('table_id', data.visitor_table);
        this.update_bill();
    }

    update_bill()
    {
        let bill = this.data_bill();
        // this.dbLocalProvider.setdb('bill.data', this.data_bill())
    }

    reset_bill()
    {
        
        this.bill = this.default_bill_value();
        this.dbLocalProvider.removedb('bill.data')
        this.reset_order_session();

    }
    data_bill(data:any={})
    {
        let receipt = this.get_bill_component()
        return Object.assign(receipt, data)
    }

    set_data_bill(data:any={}, update_db:boolean=true)
    {
        console.log(this.bill, data)
        this.bill = data;
        
        this.count_pricing()
        this.update_bill();
        this.events.publish('bill.update')
    }

    pull_data_bill()
    {
        return this.dbLocalProvider.opendb('bill.data')
        .then( (res) =>{
            
          if(res)
          {
              this.put_bill_component(res)
              this.detection_order_session_from_orders(res.orders)
              this.events.publish('bill.update')
          }

        })
    }

    

    /*
    // fungsi ini sebagai penanda tentang jumlah save dari suatu bill
    */

    // set order session from local-storage 
    reset_order_session()
    {

        this.set_bill_component('order_session', [])
        this.dbLocalProvider.setdb('bill.order_session', this.bill.order_session)

    }

    set_order_session(data:object=[])
    {
        this.bill.order_session = data;
    }

    // create new order session

    detection_order_session_from_orders(orders:any=[], create_new:boolean=false)
    {
        this.reset_order_session();
        let order_array = {}
        orders.forEach((value, index)=>{
            value.order_session = parseInt(value.order_session);
            if(!order_array[value.order_session])
            {

                order_array[value.order_session] = {count:1, first: value.id};
                this.update_order_item(index, 'first_session_order', true)
            }else
            {
                this.update_order_item(index, 'first_session_order', false)
                order_array[value.order_session].count = order_array[value.order_session].count + 1;
            }
        })

        // recreate previous session
        $.each(order_array, (i, val)=>{
            this.add_order_session(val)
        })
        if(create_new)
        {
            // create new session
            this.add_order_session();
        }
    }

    get_order_session_item(session:number = 0)
    {
        let a = this.get_bill_component('orders');
        return a.filter((res)=>{
            return res.order_session == session;
        })
    }

    add_order_session(data:object={})
    {
        this.bill.order_session = this.bill.order_session? this.bill.order_session : []
        data = Object.assign({count:0, timestamp:moment().unix()}, data)
        this.bill.order_session.push(data)
        this.dbLocalProvider.setdb('bill.order_session', this.bill.order_session)
    }

    get_order_session()
    {
        return this.bill.order_session? this.bill.order_session.length : 0;
    }

    set_order_session_item_counter(session:number)
    {
        this.bill.order_session[session].count = parseInt(this.bill.order_session[session].count) + 1;
    }
    get_order_session_item_counter(session:number)
    {
        return this.bill.order_session[session].length;
    }
    get_active_order_session()
    {
        if(!this.bill.order_session)
        {
            this.bill.order_session = [];
        }

        return this.bill.order_session.length - 1;
    }
    isset_order_session()
    {
        let order = this.get_bill_component('orders');
        if(order && order.length < 1)
        {
            this.reset_order_session()
            return false;
        }
        order = order.filter((res)=>{
            return !res.detail_id;
        })
        return  order.length > 0? true : false;
    }

    cancel_bill(pay_id:number, note:string)
    {
        var url = this.config.base_url('admin/outlet/transaction/update')
        let billdata = {
            pay_id: pay_id,
            payment_cancel_note: note,
            payment_cancel_status: 1

        }
        return this.helper.loading_countdown({url:url, data:billdata})
    }


    // B I L L S 
    new_nota(value:any=undefined)
    {
        value = value?value:this.default_bill_value();
        this.records_bill.push(value)
        let index = Object.keys(this.get_nota()).pop()
        return parseInt(index);
    }

    get_nota(index:number=undefined)
    {
        return !this.records_bill[index]?this.records_bill:this.records_bill[index];
    }

    get_nota_component(index:number, property:string)
    {
        let nota = this.get_nota(index);
        return nota[property];
    }
    set_nota_property(index:number, property:string, value:any='')
    {
        let nota = this.get_nota(index);
        nota[property] = value;
    }

    check_nota_order(index:number, product:number, order_session:number)
    {
        let nota = this.get_nota(index);
        let indexNota = nota.orders.map((res)=>{
            if(res.order_session == order_session)
            {
                return res.product
            }
        }).indexOf(product)

        return indexNota;
    }

    new_nota_order(index:number, data:any)
    {
        let nota = this.get_nota(index);
        nota['orders'].push(data);
    }    

    remove_nota_order(index:number, index_order:number)
    {
        let nota = this.get_nota(index);
        nota['orders'].splice(index_order, 1)
    }
    get_nota_order(index:number, order_index:number, property:any=undefined)
    {
        let nota = this.get_nota(index);
        if(order_index >=0 && !nota['orders'][order_index])
        {
            return false;
        }

        if(order_index<0)
        {
            return nota['orders'];
        }
        return !property?nota['orders'][order_index]:nota['orders'][order_index][property];
    }

    set_nota_order(index:number, order_index:number, property:any=undefined, value:any='')
    {
        let nota = this.get_nota(index);
        if(property)
        {
            nota['orders'][order_index][property] = value;        
        }else
        {
            nota['orders'][order_index] = value;        
        }
    }

    nota_count_pricing(nota:any, reset:boolean=false)
    {
        nota = Object.assign({}, nota);

        let discount_nominal  = nota['discount_nominal'];
        let discount_percent  = nota['discount_percent'];
        let discount_id       = nota['discount_id'];
        
        let payment_total:any     = 0;
        let payment_bills:any     = 0;
        let tax_nominal:any       = 0;

        if(!reset)
        {

            let payment_total     = nota['payment_total'];
            let payment_bills     = nota['payment_bills'];
            let tax_nominal       = nota['tax_nominal'];
        }

        

        tax_nominal = tax_nominal?parseInt(tax_nominal):0;
        discount_nominal = discount_nominal?parseInt(discount_nominal):0;

        let order = nota['orders'];

        $.each(order, (i, val)=>{
            if(!val.complement_status || parseInt(val.complement_status) < 1)
            {
                let total = order[i].qty * order[i].price    
                let order_discount_nominal = parseInt(val.discount_nominal);
                if(val.discount_percent)
                {
                    order_discount_nominal = this.helper.percentToNominal(val.discount_percent, total)
                }
                if(order_discount_nominal)
                {
                    total = total - order_discount_nominal;
                }
                nota['orders'][i]['total'] = total;
                nota['orders'][i]['discount_nominal'] = order_discount_nominal;

                order[i].total = total;
                order[i].discount_nominal = order_discount_nominal;
                
            }else
            {
                if(val.complement_item < val.qty)
                {
                    let total = (order[i].qty - val.complement_item) * order[i].price    
                    let order_discount_nominal = parseInt(val.discount_nominal);
                    if(val.discount_percent)
                    {
                        order_discount_nominal = this.helper.percentToNominal(val.discount_percent, total)
                    }

                    if(order_discount_nominal)
                    {
                        total = total - order_discount_nominal;
                    }
                    nota['orders'][i]['total'] = total;
                    nota['orders'][i]['discount_nominal'] = order_discount_nominal;

                    order[i].total = total;
                    order[i].discount_nominal = order_discount_nominal;

                }else
                {
                    order[i].total = 0;
                }
            }

        })


        let RestotalPrice = order.map((res) => {
            // lakukan pengechekan apakah order memiliki "complement_status";
            if( !res.complement_status || parseInt(res.complement_status) < 1 || (parseInt(res.complement_status) > 0 && res.complement_item < res.qty) )
            {
                return res.total
            }else
            {
                return 0;
            }
        })

        for (var i = 0; i < RestotalPrice.length; ++i) {
            payment_bills = payment_bills + parseInt(RestotalPrice[i]);
        }

        if(discount_id && discount_percent)
        {
            discount_nominal = this.helper.percentToNominal(discount_percent, payment_bills);
        }

        payment_total = payment_bills - discount_nominal + tax_nominal;

        nota.payment_bills = payment_bills;
        nota.payment_total = payment_total;
        nota.discount_nominal = discount_nominal;

        return nota;

    }

    nota_bill_session(session:number=0)
    {

        let bill = this.get_order_session_item(session)
        bill = this.nota_count_pricing({orders: bill}) 
        bill = Object.assign(this.get_bill(), bill)
        return bill
    }
    nota_order_session(data:any)
    {

        return data.map((res)=>{
            // return
        })
    }
    print_bill_wifi(data_print:any={}, nota:any='')
    {
        data_print.print_type = parseInt(data_print.print_type)
        let outletName = this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_name? this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_name : 'OUTLET';
        let outletAddress = this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_address?this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_address:'ADDRESS';
        let outletPhone = this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_phone?this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_phone:'PHONE';
        let orders = this.get_bill_component('orders');
        let b = this.get_bill();
        let initialName = this.helper.get_initial_outlet_name(outletName).join('.');
        let divider = "\n________________\n";
        nota = nota?initialName+'/0000'+nota:'-';
        let visitorTable = b.table_name?b.table_name+'/':'';
        let visitorName = b.visitor_name?b.visitor_name:'-';
        let visitor = "Nomor Nota : "+nota+"\nMeja/Pelanggan: "+visitorTable+visitorName+"\n"+"Kasir: "+this.helper.local.get_params(this.helper.config.variable.credential).users.users_fullname+"\nTanggal : "+this.helper.moment().format('DD MMM YYYY HH:mm')+"\n";
        let textPrintHeader = outletName+"\n"+outletAddress+"\n"+outletPhone+''+divider+""+visitor;
        let textPrint = textPrintHeader;
        if(b.member_id)
        {

            textPrint += "Member : "+initialName+'/000'+b.member_id+"\n";
        }        
        textPrint += ""+divider;

        let conf_print = this.helper.printer.countConfiguration(this.helper.printer.print_type(data_print.print_type),0);

        let data_item = [];

        $.each(orders, (i, item)=>{
            var ditem = {
                qty: item.qty,
                name: item.name,
                price: this.helper.intToIDR(item.price),
                totalPrice: this.helper.intToIDR(item.price*item.qty)
            };
            textPrint += this.helper.printer.convert(ditem, conf_print);  
            /* if(item.complement_status > 0)
            {
                let kompl_item = item.complement_status > 0 && item.complement_item < item.qty? item.complement_item : '';
                textPrint += kompl_item+" komplimen\n";
            }
            if(this.helper.IDRtoInt(item.discount_nominal) > 0 && (this.helper.toInt(item.complement_status) != 1 || this.helper.toInt(item.complement_item) < this.helper.toInt(item.qty) ) )
            {
                textPrint += "Diskon "+ this.helper.toInt(item.discount_percent)+"% (-"+this.helper.intToIDR(item.discount_nominal)+") \n";
            }*/
        })
        textPrint += "________________\n";
        
        textPrint += "Total :      "+this.helper.intToIDR(this.get_bill_component('payment_total'))+"\n";
        textPrint += "\n\n Bila ada pelayanan/produk yang kurang \nberkenan, Hub. 0857 1272 2217 \nTerima Kasih\nPowered by folarpos.co.id\n";
        return textPrint
           
    }

    print_bill(nota:any='', data_print:any={})
    {
        data_print.print_type = parseInt(data_print.print_type)
      
        let outletName = this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_name? this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_name : 'OUTLET';
        let outletAddress = this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_address?this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_address:'ADDRESS';
        let outletPhone = this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_phone?this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_phone:'PHONE';
        let orders = this.get_bill_component('orders');
        let b = this.get_bill();
        let initialName = this.helper.get_initial_outlet_name(outletName).join('.');
        let divider = "\n________________\n";
        nota = nota?initialName+'/0000'+nota:'-';
        let visitorTable = b.table_name?b.table_name+'/':'';
        let visitorName = b.visitor_name?b.visitor_name:'-';
        let visitor = "Nomor Nota : "+nota+"\nMeja/Pelanggan: "+visitorTable+visitorName+"\n"+"Kasir: "+this.helper.local.get_params(this.helper.config.variable.credential).users.users_fullname+"\nTanggal : "+this.helper.moment().format('DD MMM YYYY HH:mm')+"\n";
        let textPrintHeader = "{center}"+outletName+"\n{s}"+outletAddress+"\n"+outletPhone+"{s}"+divider+"{left}"+visitor;
        let textPrint = textPrintHeader;
        if(b.member_id)
        {

            textPrint += "Member : "+initialName+'/000'+b.member_id+"\n";
        }        
        textPrint += "{left}"+divider;
        let conf_print = this.helper.printer.countConfiguration(this.helper.printer.print_type(data_print.print_type),0);

        $.each(orders, (i, item)=>{
           // textPrint += "{s}{left}"+item.qty+" "+item.name+" x "+this.helper.intToIDR(item.price)+"{/s}  {s}{b}"+this.helper.intToIDR(item.price * item.qty)+"{/b} {/s}{reset}\n";
           var ditem = {
                qty: item.qty,
                name: item.name,
                price: this.helper.intToIDR(item.price),
                totalPrice: this.helper.intToIDR(item.price*item.qty)
            };
            textPrint += "{s}"+this.helper.printer.convert(ditem, conf_print);  

            if(item.complement_status > 0)
            {
                let kompl_item = item.complement_status > 0 && item.complement_item < item.qty? item.complement_item : '';
                textPrint += "{left} {s}{i}"+kompl_item+"{i} komplimen{s}\n";
            }
            if(this.helper.IDRtoInt(item.discount_nominal) > 0 && (this.helper.toInt(item.complement_status) != 1 || this.helper.toInt(item.complement_item) < this.helper.toInt(item.qty) ) )
            {
                textPrint += "{left} {s}Diskon "+ this.helper.toInt(item.discount_percent)+"% {b}(-"+this.helper.intToIDR(item.discount_nominal)+"){/b} \n\n";
            }

            
        })
        textPrint += "________________\n{right}";
        /*if(this.get_bill_component('tax_nominal')>0 || this.get_bill_component('discount_nominal')>0 )
        {
            textPrint += "Bill :      "+this.helper.intToIDR(this.bill.payment_bills)+"\n";
        }*/

        // if(this.get_bill_component('tax_nominal')>0 )
        // {
        //     textPrint += "Pajak "+this.get_bill_component('tax_percent')+"% :      "+this.helper.intToIDR(this.get_bill_component('tax_nominal'))+"\n";
        // }

        // if(this.get_bill_component('discount_nominal')>0 )
        // {
        //     let discountPercent = this.helper.toInt(this.get_bill_component('discount_percent')) > 0? this.get_bill_component('discount_percent')+'%':''
        //     textPrint += "Diskon "+discountPercent+":      "+this.helper.intToIDR(this.get_bill_component('discount_nominal'))+"\n";
        // }

        textPrint += "{s}Total :      "+this.helper.intToIDR(this.get_bill_component('payment_total'))+"{/s}\n";
        textPrint += "\n{center}{s}Bila ada pelayanan/produk yang kurang \nberkenan, Hub. 0857 1272 2217 \nTerima Kasih\nPowered by folarpos.co.id{/s}\n\n\n";
        return textPrint

    }

    print_nota(nota:any='')
    {
        let outletName      = this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_name? this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_name : 'OUTLET';
        let outletAddress   = this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_address?this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_address:'ADDRESS';
        let outletPhone     = this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_phone?this.helper.local.get_params(this.helper.config.variable.credential).outlet.outlet_phone:'PHONE';
        let orders          = this.get_bill_component('orders');
        let b               = this.get_bill();
        let initialName     = this.helper.get_initial_outlet_name(outletName).join('.');
        let divider         = "\n________________\n";
        nota                = nota?initialName+'/0000'+nota:'-';
        
        let visitorTable    = b.table_name?b.table_name+'/':'';
        let visitorName     = b.visitor_name?b.visitor_name:'-';
        let visitor         = "Nomor Nota : "+nota+"\nMeja/Pelanggan: "+visitorTable+visitorName+"\n"+"Kasir: "+this.helper.local.get_params(this.helper.config.variable.credential).users.users_fullname+"\nTanggal : "+this.helper.moment().format('DD MMM YYYY HH:mm')+"\n";
        let textPrintHeader = "{center}"+outletName+"\n{s}"+outletAddress+"\n"+outletPhone+"{s}"+divider+"{left}\n"+visitor;
        let textPrint       = textPrintHeader;
        if(b.member_id)
        {
            textPrint += "Member : "+initialName+'/000'+b.member_id+"";
        }        
        textPrint     += "{right}"+divider;

        $.each(orders, (i, item)=>{
           textPrint += "{s}{right}"+item.qty+" "+item.name+" x "+this.helper.intToIDR(item.price)+"{/s}  {s}{b}"+this.helper.intToIDR(item.price * item.qty)+"{/b} {/s}{reset}\n";
            if(item.complement_status > 0)
            {
                let kompl_item = item.complement_status > 0 && item.complement_item < item.qty? item.complement_item : '';
                textPrint     += "{right} {s}{i}"+kompl_item+"{i} komplimen{s}\n";
            }
            if(this.helper.IDRtoInt(item.discount_nominal) > 0 && (this.helper.toInt(item.complement_status) != 1 || this.helper.toInt(item.complement_item) < this.helper.toInt(item.qty) ) )
            {
                textPrint += "{right} {s}Diskon "+ this.helper.toInt(item.discount_percent)+"% {i}(-"+this.helper.intToIDR(item.discount_nominal)+"){/i} \n";
            }

            
        })
        textPrint += "________________\n\n{right}";
        if(this.get_bill_component('tax_nominal')>0 || this.get_bill_component('discount_nominal')>0 )
        {
            textPrint += "Bill :      "+this.helper.intToIDR(this.bill.payment_bills)+"\n";
        }

        if(this.get_bill_component('tax_nominal')>0 )
        {
            textPrint += "Pajak "+this.get_bill_component('tax_percent')+"% :      (-"+this.helper.intToIDR(this.get_bill_component('tax_nominal'))+")\n";
        }

        if(this.get_bill_component('discount_nominal')>0 )
        {
            let discountPercent = this.helper.toInt(this.get_bill_component('discount_percent')) > 0? this.get_bill_component('discount_percent')+'%':''
            textPrint           += "Diskon "+discountPercent+":      (+"+this.helper.intToIDR(this.get_bill_component('discount_nominal'))+")\n";
        }

        textPrint += "{s}Total :      "+this.helper.intToIDR(this.get_bill_component('payment_total'))+"{/s}\n";
        textPrint += "{s}Tunai :      "+this.helper.intToIDR(this.get_bill_component('payment_nominal'))+"{/s}\n";
        if(this.get_bill_component('paid_with_bank_nominal') > 0 )
        {
            if(this.get_bill_component('payment_bank_charge_percent') > 0 )
            {
                let charge = this.get_bill_component('payment_bank_charge_percent');
                textPrint += "{s}Charge Non-tunai "+charge+":      (+"+this.helper.intToIDR(this.get_bill_component('payment_bank_charge_nominal'))+"){s}\n";
            }
            textPrint += "{s}Non-tunai :      "+this.helper.intToIDR(this.get_bill_component('paid_with_bank_nominal'))+"{/s}\n";
        }
        textPrint += "{s}Kembali :      "+this.helper.intToIDR(this.get_bill_component('payment_rest'))+"{/s}\n";
        textPrint += "{center}{s}\n\nTerima kasih. Selamat belanja kembali\nBila ada pelayanan/produk yang kurang \nberkenan, Hub."+outletPhone+" \nTerima Kasih\nPowered by folarpos.co.id{/s}\n\n\n\n\n";
        return textPrint

    }

}
