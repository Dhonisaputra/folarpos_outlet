import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ToastController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TablePage } from '../pages/table/table';
import { LoginPage } from '../pages/login/login';
import { OutletListPage } from '../pages/outlet-list/outlet-list';
import { ProductPage } from '../pages/product/product';
import { SettingsPage } from '../pages/settings/settings';
import { StocksPage } from '../pages/stocks/stocks';
import { TransactionPage } from '../pages/transaction/transaction';
import { MemberPage } from '../pages/member/member';
import { SpendPage } from '../pages/spend/spend';
import { DebtPage } from '../pages/debt/debt';
import { ModalPage } from '../pages/modal/modal';
import { AboutPage } from '../pages/about/about';
import { WaitersPage } from '../pages/waiters/waiters';
import { PrintBluetoothPanelPage } from '../pages/print-bluetooth-panel/print-bluetooth-panel';
import { KitchenbarPage } from '../pages/kitchenbar/kitchenbar';
import { LoadingPage } from '../pages/loading/loading';
import { ReportPage } from '../pages/report/report';


import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { BackgroundMode } from '@ionic-native/background-mode';

import { HelperProvider } from '../providers/helper/helper'; 
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage         : any = LoginPage;
  tablePage        : any = TablePage;
  productPage      : any = ProductPage;
  kitchenbarPage   : any = KitchenbarPage;
  reportPage   : any = ReportPage;
  
  waitersPage       :any=WaitersPage;
  stocksPage       :any=StocksPage;
  transactionPage  :any=TransactionPage;
  memberPage       :any=MemberPage;
  modalPage        :any=ModalPage;
  spendPage        :any=SpendPage;
  debtPage         :any=DebtPage;
  settingsPage     :any=SettingsPage;
  outletListPage   :any=OutletListPage;
  aboutPage        :any=AboutPage;
  printerPage      :any=PrintBluetoothPanelPage;
  pages            : any; //Array<{title: string, component: any, options:any}>
  lastTimeBackPress:number=0;
  timePeriodToExit :number=2000;
  users            : any={}
  public routeHistory: Array<any>;


  constructor(public backgroundMode: BackgroundMode, public toastCtrl: ToastController, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public helper:HelperProvider, private screenOrientation: ScreenOrientation) {
    this.splashScreen.show();

    this.initializeApp();
    // console.log(helper.local.get_params(this.helper.config.variable.settings))
    // let default_page = !this.helper.local.get_params(this.helper.config.variable.settings) || this.helper.local.get_params(this.helper.config.variable.settings).choose_table_first?  TablePage : ProductPage ;
    // used for an example of ngFor and navigation
    this.pages = [
    ];

    // this.storage.set('outlet', 1)
    this.routeHistory = [];
    

  }

  initializeApp() {
    this.platform.ready().then(() => {
      if(!this.backgroundMode.isEnabled())
      {
        this.backgroundMode.enable();
        this.backgroundMode.configure({
          text: "Folarpos Instant is running",
        })
      }
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE).catch(()=>{});

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      this.platform.registerBackButtonAction(()=>this.preventClose(),10);
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.helper.preload('audio', 'assets/audio/intuition.mp3');

      this.helper.events.subscribe('outlet.signout', () => {
        // user and time are the same arguments passed in `events.publish(user, time)`
        this.signOutOutlet();
      });

      // this.users = this.helper.local.get_params(this.helper.config.variable.credential).users;
    });
  } 

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  setRoot(page, params:any={}) {
    this.helper.play('audio');
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page, params);
  }

  preventClose()
  {
    let toast = this.toastCtrl.create({
      message: "Silahkan tutup aplikasi melalui sidebar menu!",
      duration: 3000
    });
    toast.present(); 
  }

  logout()
  {
    this.helper.local.reset_params('is_login');
    this.helper.storage.remove(this.helper.config.variable.credential)
    this.helper.storage.remove('pinned_product')
    this.helper.local.set_params(this.helper.config.variable.credential,{users:{}, data:{}, outlet:{}, type_product:[]});
    this.helper.local.set_params('pinned_params',[]);
    this.nav.setRoot(LoginPage);
  }

  closeApp()
  {
    this.helper.alertCtrl.create({
      title: "Tutup aplikasi",
      message: "Apakah anda yakin ingin menutup aplikasi?",
      buttons: ["Tidak", {
        text: "Tutup",
        handler: ()=>{    
          this.platform.exitApp()
        }
      }]
    }).present();
  }

  signOutOutlet()
  {
    this.helper.local.reset_params('login_outlet_device');
        this.helper.local.set_params('login_outlet_device', false)
    this.nav.setRoot(OutletListPage)
  }

  filteringTypeCategories(item)
  {
    let selectedType = this.helper.$('.typeCategories:checked').serializeArray().map((res)=>{return res.value});
    this.helper.events.publish('product:filter-type', { item: selectedType })
  }

}
