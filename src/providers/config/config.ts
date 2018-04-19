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
	build_number:any;
	constructor() {
		// this.host = 'http://instant.folarpos.co.id/';
		// this.host = 'http://localhost/folarpos-instant/';
		this.host = 'http://192.168.1.38/folarpos-instant/';
		// this.host = 'http://192.168.0.104/folarpos-instant/';
		// this.host = 'http://192.168.100.31/folarpos-instant/';

		this.build_number = '20180419-1-1-44'
	}

	base_url(url:any)
	{
		url = url?url+'/' : '';
		return this.host + url;
	}
}
