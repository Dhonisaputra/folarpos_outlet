var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelperProvider } from "../../providers/helper/helper";
/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
var AboutPage = /** @class */ (function () {
    function AboutPage(helper, navCtrl, navParams) {
        this.helper = helper;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.listAbout = [];
        this.listAbout = [{
                name: "nama",
                value: 'Folarpos Instant'
            }, {
                name: 'uuid',
                value: this.helper.local.get_params('uuid')
            }, {
                name: 'version',
                value: 'build 20180321-1-20'
            }, {
                name: 'Author',
                value: 'dhoni.p.saputra@gmail.com'
            }, {
                name: 'Company',
                value: 'Folarium Technomedia'
            }, {
                name: "Year",
                value: 2018
            }, {
                name: 'Website',
                value: "http://folarpos.co.id"
            }];
    }
    AboutPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad AboutPage');
    };
    AboutPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-about',
            templateUrl: 'about.html',
        }),
        __metadata("design:paramtypes", [HelperProvider, NavController, NavParams])
    ], AboutPage);
    return AboutPage;
}());
export { AboutPage };
//# sourceMappingURL=about.js.map