import { Injectable } from '@angular/core';

/*
Generated class for the ConfigProvider provider.

See https://angular.io/guide/dependency-injection for more info on providers
and Angular DI.
*/
@Injectable()
export class ConfigProvider {

	host: string;
	variable:any = {
		credential: 'credential',
		settings: 'settings'
	}
	remote_host:object = {}
	build_number:any;
	constructor() {
		this.host = 'http://instant.folarpos.co.id/';
		// this.host = 'http://localhost/folarpos-instant/';
		// this.host = 'http://192.168.1.7/folarpos-instant/';
		// this.host = 'http://192.168.0.104/folarpos-instant/';
		// this.host = 'http://192.168.100.31/folarpos-instant/';

		this.build_number = '20180419-1-1-44';
		this.remote_host =  this.remote_host_default();
	}

	remote_host_default()
	{
		return {
			host:'https://folariumremote.herokuapp.com/',
			// host:'http://localhost:3000',
            apiKey:'instantFolar3030' ,
            id:undefined
		}
	}

	base_url(url:any)
	{
		url = url?url+'/' : '';
		return this.host + url;
	}
}
