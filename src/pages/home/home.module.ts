import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { MyApp } from '../../app/app.component';
import { HomePage } from '../home/home';

@NgModule({
  declarations: [
    LoginPage,
    MyApp,
    HomePage
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
  ],
})
export class HomePageModule {}
