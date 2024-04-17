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

  log = {Username: '', Password: ''};

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
      duration : 2000
    });
    loader.present();

    // VERIFY USER WITH DATABASE
    this.api(this.log.Username, this.log.Password);
  }

  api(Username, Password){
     let headers = new HttpHeaders();
     headers.append('Access-Control-Allow-Origin' , '*');
     headers.append('Content-Type', 'application/json');
     headers.append('Authorization', 'my-auth-token');
     let username = Username;      // 'user2'
     let password = Password;      // 'simpple123'
     let params = {
         "username":username,
         "password":password
     };
     console.log(params);
     const url = "http://192.168.100.151";
     this.http.post(url + '/api/robotLogin',{headers: headers, params: params}).subscribe(data => {
       if(data['success']){
         console.log("Logged in");
         // SAVE CREDENTIALS
         this.storage.set("login", this.log);
         this.navCtrl.setRoot(HomePage);
         // TRIGGER EVENT HANDLER INIT AND AUTHENTICATE SENDBIRD 
         this.events.publish('init', this.log.Username);
       }
       else{
         console.log("Invalid credentials");
       }
     });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    // CHECK FOR STORED CREDENTIALS
    this.storage.get("login").then( (data)=> {
      if (data) {
        // VERIFY USER WITH DATABASE
        this.api(data.Username,data.Password);
      }
    });
  }
}
