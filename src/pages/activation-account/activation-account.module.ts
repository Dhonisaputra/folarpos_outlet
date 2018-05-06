import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ActivationAccountPage } from './activation-account';

@NgModule({
  declarations: [
    ActivationAccountPage,
  ],
  imports: [
    IonicPageModule.forChild(ActivationAccountPage),
  ],
})
export class ActivationAccountPageModule {}
