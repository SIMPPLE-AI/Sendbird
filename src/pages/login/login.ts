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

  log = {Username: 'user4', Password: 'simpple123'};

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
      duration : 5000
    });
    loader.present();

    // VERIFY USER WITH DATABASE
    // this.api(this.log.Username, this.log.Password);

    this.navCtrl.setRoot(HomePage);
    this.events.publish('init', this.log.Username);
  }

  api(Username, Password){
    const headers = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'my-auth-token',
        'Access-Control-Allow-Origin': '*'
      })
    };

     let params = {
         "username":Username, // 'user3'
         "password":Password  // 'simpple123'
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
         this.events.publish('init', Username);
       }
       else{
         console.log("Invalid credentials");
         alert("Invalid Credentials, please try again.")
       }
     }, error => {
      console.log(error);
     })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    // CHECK FOR STORED CREDENTIALS
    // this.storage.get("login").then( (data)=> {
    //   if (data) {
    //     // VERIFY USER WITH DATABASE
    //     this.api(data.Username,data.Password);
    //   }
    // });
  }
}
