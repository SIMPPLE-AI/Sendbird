import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { Events } from 'ionic-angular';
import { UtilityService } from '../../providers/utility/utility';
import { HttpHeaders, HttpClient } from '@angular/common/http';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  log = {Username: '', Password:''};

  constructor(public http:HttpClient, public utilityService:UtilityService, public navCtrl: NavController, public navParams: NavParams, public loadingController:LoadingController, public storage:Storage, public events:Events) {
    
  }

  // Exit Kiosk
  exit() {
    this.utilityService.exit();
  }

  // LOGIN TO DATABASE
  login() {
    // DISPLAY LOADER
    let loader = this.loadingController.create({
      content: "Loading",
      duration : 3000
    });
    loader.present();
    
    // SAVE CREDENTIALS
    this.storage.set("login", this.log);

    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin' , '*');
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'my-auth-token');
    let username = 'user2';
    let password = 'simpple123';
    let params = {
        "username":username,
        "password":password
    };
    console.log(params);
    const url = "http://192.168.100.151";
    this.http.post(url + '/api/robotLogin',{headers: headers, params: params}).subscribe(data => {
      if(data['success']){
        console.log("Logged in");
      }
      else{
        console.log("Invalid credentials");
      }
    });

    // GO TO MAIN PAGE
    this.navCtrl.setRoot(HomePage);

    // TRIGGER EVENT HANDLER INIT AND AUTHENTICATE SENDBIRD 
    this.events.publish('init', this.log.Username);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }
}
