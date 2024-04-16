import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import { MyApp } from '../../app/app.component';
import { HomePage } from '../home/home';

@NgModule({
  declarations: [
    LoginPage,
    MyApp,
    HomePage
  ],
  imports: [
    IonicPageModule.forChild(LoginPage),
  ],
})
export class LoginPageModule {}
