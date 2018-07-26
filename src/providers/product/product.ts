import { Injectable } from '@angular/core';
import { ConfigProvider } from '../../providers/config/config';
import * as $ from "jquery"
import { Storage } from '@ionic/storage';
import { HelperProvider } from '../../providers/helper/helper'; 

/*
Generated class for the ProductProvider provider.

See https://angular.io/guide/dependency-injection for more info on providers
and Angular DI.
*/
@Injectable()
export class ProductProvider {
	public last_request: any;
	public last_options: any;
	public data:any={products:{}}
	constructor(public config: ConfigProvider, private storage: Storage, public helper:HelperProvider) {
		console.log('Hello ProductProvider Provider');
	}

	get_product(options:any)
	{
		options.online = this.helper.local.get_params('connection');
		console.log(this.helper.is_online())
		if(this.helper.is_online())
		{
			options.data = Object.assign(
				{
					fields: 'id,outlet,type,price,name,unit,stock,image,charge_nominal,charge_percent,status,discount_nominal,discount_percent,status_text,can_be_removed,favorite,prod_description,ingredients'	,
					limit: 100000,
					page: 1,				
				}, options.data)

			this.last_options = options;
			this.last_request = options.data;

			// let http = $.post( this.config.base_url('admin/outlet/product/get'), options.data )
			let http = this.helper.loading_countdown({
				url: this.config.base_url('admin/outlet/product/get'),
				data: options.data
			});

			http.then( (res) =>{
            	this.helper.storage.set('md_product', res);
				return res;
				// res = !this.helper.isJSON(res)? res : JSON.parse(res);
				// this.data.temp_product = res;
			} )
			return http;
			
		}else
		{
			return this.storage.get('md_product')
		}
	}

	get_data(name:string)
	{
		return this.data[name];
	}

	get_temporary()
	{
		return this.data.temp_product;
	}

	set_data(name:string, value:any)
	{
		this.data[name] = value;
	}

}
