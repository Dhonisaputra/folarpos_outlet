import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { IonicStorageModule } from '@ionic/storage';
import { SQLite } from '@ionic-native/sqlite';
import { FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { NativeAudio } from '@ionic-native/native-audio';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { TablePage } from '../pages/table/table';
import { LoginPage } from '../pages/login/login';
import { SendReceiptPage } from '../pages/send-receipt/send-receipt';
import { PaymentPage } from '../pages/payment/payment';
import { ReceiptPage } from '../pages/receipt/receipt';
import { ProductPage } from '../pages/product/product';
import { BillSavedPage } from '../pages/bill-saved/bill-saved';
import { SettingsPage } from '../pages/settings/settings';
import { StocksPage } from '../pages/stocks/stocks';
import { BillItemEditorPage } from '../pages/bill-item-editor/bill-item-editor';
import { TransactionPage } from '../pages/transaction/transaction';
import { DetailStockPage } from '../pages/detail-stock/detail-stock';
import { EditReceiptItemPage } from "../pages/edit-receipt-item/edit-receipt-item"
import { TotalPaymentEditorPage } from '../pages/total-payment-editor/total-payment-editor';
import { TooltipProductPage } from '../pages/tooltip-product/tooltip-product';
import { ErrorPage } from '../pages/error/error';
import { SplitBillPage } from '../pages/split-bill/split-bill';
import { MemberPage } from '../pages/member/member';
import { MemberNewFormPage } from '../pages/member-new-form/member-new-form';
import { MemberDetailPage } from '../pages/member-detail/member-detail';
import { ModalPage } from '../pages/modal/modal';
import { SpendPage } from '../pages/spend/spend';
import { SpendDetailPage } from '../pages/spend-detail/spend-detail';
import { DebtPage } from '../pages/debt/debt';
import { WaitersPage } from '../pages/waiters/waiters';
import { KitchenbarPage } from '../pages/kitchenbar/kitchenbar';
import { LoadingPage } from '../pages/loading/loading';
import { ReportPage } from '../pages/report/report';

import { OutletListPageModule } from '../pages/outlet-list/outlet-list.module';
import { PrintBluetoothPanelPageModule } from '../pages/print-bluetooth-panel/print-bluetooth-panel.module';
import { AboutPageModule } from '../pages/about/about.module';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ReceiptDataProvider } from '../providers/receipt-data/receipt-data';
import { ConfigProvider } from '../providers/config/config';
import { ProductProvider } from '../providers/product/product';
import { BillProvider } from '../providers/bill/bill';
import { DbLocalProvider } from '../providers/db-local/db-local';
import { DbTableProvider } from '../providers/db-table/db-table';
import { HelperProvider } from '../providers/helper/helper';  

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PrinterServiceProvider } from '../providers/printer-service/printer-service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { HTTP } from '@ionic-native/http';
import { AiRemoteProvider } from '../providers/ai-remote/ai-remote';
import { Network } from '@ionic-native/network';
import { BackgroundMode } from '@ionic-native/background-mode';
// import { AbsoluteDragDirective } from '../directives/absolute-drag/absolute-drag';  

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    TablePage,
    LoginPage,
    SendReceiptPage,
    PaymentPage,
    ReceiptPage,
    ProductPage,
    BillSavedPage,
    SettingsPage,
    StocksPage,
    BillItemEditorPage,
    TransactionPage,
    DetailStockPage,
    EditReceiptItemPage,
    TotalPaymentEditorPage,
    TooltipProductPage,
    ErrorPage,
    SplitBillPage,
    MemberPage,
    MemberNewFormPage,
    MemberDetailPage,
    ModalPage,
    SpendPage,
    SpendDetailPage,
    DebtPage,
    WaitersPage,
    KitchenbarPage,
    LoadingPage,
    ReportPage
    // AbsoluteDragDirective

  ],
  imports: [
    BrowserModule,
    PrintBluetoothPanelPageModule,
    BrowserAnimationsModule,
    OutletListPageModule,
    HttpClientModule,
    AboutPageModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    TablePage,
    SendReceiptPage,
    PaymentPage,
    ReceiptPage,
    ProductPage,
    SettingsPage,
    StocksPage,
    BillItemEditorPage,
    TransactionPage,
    DetailStockPage,
    EditReceiptItemPage,
    TotalPaymentEditorPage,
    TooltipProductPage,
    ErrorPage,
    SplitBillPage,
    MemberPage,
    MemberNewFormPage,
    MemberDetailPage,
    ModalPage,
    SpendPage,
    SpendDetailPage,
    DebtPage,
    WaitersPage,
    KitchenbarPage,
    LoadingPage,
    ReportPage
    

  ],
  providers: [
    StatusBar,
    SplashScreen,
    LocalNotifications,
    SQLite,
    File,
    FileTransfer,
    ScreenOrientation,
    NativeAudio,
    ReceiptDataProvider,
    ConfigProvider,
    ProductProvider,
    BillProvider,
    DbLocalProvider,
    DbTableProvider,
    HelperProvider,
    PrinterServiceProvider,
    BluetoothSerial,
    UniqueDeviceID,
    HTTP,
    AiRemoteProvider,
    Network,
    BackgroundMode,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
  ]
})
export class AppModule {}
