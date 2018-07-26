import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import { SignupPageModule } from '../signup/signup.module';
import { ActivationAccountPageModule } from '../activation-account/activation-account.module';
import { FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
  SignupPageModule,
  ActivationAccountPageModule,
    IonicPageModule.forChild(LoginPage),
  ],
  providers: [
  	File,
  	FileTransfer
  ]
})
export class LoginPageModule {}
