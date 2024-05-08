import { Component, ChangeDetectorRef, ViewRef } from '@angular/core';
import { IonicPage, LoadingController, Events, NavController } from 'ionic-angular';
import * as SendBirdCall from 'sendbird-calls';
import { UtilityService } from '../../providers/utility/utility';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  slideToCallProgress = 0;
  callTriggered = true;
  callCountDownInterval:any;
  slideToCancelCallProgress = 0;
  countdown = 3;
  robotStatusCountdownInterval:any;
  url = "http://192.168.100.151";

  constructor(public navCtrl:NavController, public events:Events, public http:HttpClient, private loadingController:LoadingController, public storage:Storage, private utilityService:UtilityService,private changeRef: ChangeDetectorRef) {
    // NAVIGATE TO LOGIN PAGE IF USER HAS LOGGED OUT
    this.events.subscribe('logout', (data) => {
      if (data) {
        this.navCtrl.setRoot(LoginPage);
        console.log(this.storage.get("login"));
      }
    })

    this.events.subscribe('CallEndedEvent', () => {
      console.log("Call ended event");
      this.resetCountdown();
    });

  }

  async ionViewDidLoad(){
    console.log("ionViewDidLoad - home.ts");

    // DISPLAY LOADER
    let loader = this.loadingController.create({
      content: "Loading"
    });
    loader.present();

    await this.getMappedRobotUser();

    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    await this.getRobotStatusAPI();

    // Create timer interval
    this.robotStatusCountdownInterval = setInterval(async () => {
      console.log(`Calling getRobotStatusAPI @  ${new Date().toLocaleString()}`);
      await this.getRobotStatusAPI();
    }, 60000); // 60000 milliseconds = 60 seconds

    loader.dismiss();
  }

  ionViewDidLeave(){
    console.log("ionViewDidLeave");
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    if(this.robotStatusCountdownInterval){
      console.log("CLEARING ROBOT STATUS COUNTDOWN INTERVAL");
      clearInterval(this.robotStatusCountdownInterval);
      this.robotStatusCountdownInterval = null;
    }
    if(this.callCountDownInterval){
      clearInterval(this.callCountDownInterval);
      this.callCountDownInterval = null;
    }
  }

  /*
  Clear robotStatusCountdownInterval if app is minimized
  Dont clear callCountDownInterval since it is assumed that user won't end minimize app while calling another user so as to avoid initializing the callDownInterval again
  */
  handleVisibilityChange = async () => {
    console.log("handleVisibilityChangeCalled");
    if (document.visibilityState === 'hidden') {
      if (this.robotStatusCountdownInterval) {
        console.log("CLEARING ROBOT STATUS COUNTDOWN INTERVAL");
        clearInterval(this.robotStatusCountdownInterval);
        this.robotStatusCountdownInterval = null;
      }
    } else {
      await this.getRobotStatusAPI();
      console.log("RESTARTING ROBOT STATUS INTERVAL");
      // You can optionally restart the intervals here if needed
      this.robotStatusCountdownInterval = setInterval(async () => {
        console.log(`Calling getRobotStatusAPI @  ${new Date().toLocaleString()}`);
        await this.getRobotStatusAPI();
      }, 60000); // 60000 milliseconds = 10 seconds
    }
  }

  getMappedRobotUser(){
    console.log("Getting mapped user");
    let self = this;
    return new Promise(function(resolve, reject) {
      self.storage.get("robot").then( (robot_data)=> {
        if (robot_data) {
          const headers = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Authorization': 'my-auth-token',
              'Access-Control-Allow-Origin': '*'
            })
          };

          let params = {
              "robot_id":robot_data['id']
          };

          self.http.post(self.url + '/api/getMappedRobotUser',{headers: headers, params: params}).subscribe(data => {
            if(data['success']){
                console.log("Logged in");
                console.log(data);
                self.dialParams['userId'] = data['robotUserMapping']['user']['sendbird_user_account_id'];
                resolve(true);
            }
            else{
              console.log("Robot is not mapped to any user");
              alert("Robot is not mapped to any user, unable to make calls");
              resolve(false);
            }
          }, error => {
            console.log(error);
            resolve(false);
          })
        }
      });
    });
  }

  // KIOSK MODE SETTINGS
  exit() {
    this.utilityService.exit();
  }

  // DIRECT CALL | VOICE CALL
  dialParams:SendBirdCall.DialParams = {
    userId: '',
    isVideoCall: true,
    callOption: {
      audioEnabled: true,
      videoEnabled: true
    }
  };

  async onPanToCall(event: any) {
    console.log(event);
    console.log('onPanToCall');

    let element = document.getElementById("slideToCallActionBar");
    let elementPadding = 32;
    let width = element.clientWidth; // Width of circle element + adding of slide to call action bar

    /*
      Calculate the effective width of #slideToCallActionBar to account for the width of the slider image, ensuring that the scroll action is considered complete when the slider image reaches the end of the scroll bar.
      - 'elementPadding': Padding of #slideToActionBar
      - '70': Width of the slider image
    */
    let widthToRemove = 70 + elementPadding;
    width = width - widthToRemove;

    // Calculate the progress based on the distance and width
    let progress = event.distance / width;

    // If swiping towards the left, reduce the progress
    if (event.deltaX < 0) {
      this.slideToCallProgress -= progress;
    } else {
      this.slideToCallProgress = progress;
    }


    this.slideToCallProgress = Math.min(Math.max(this.slideToCallProgress, 0), 1);

    // Check if the pan gesture has ended
    if (event.isFinal) {
      if(this.slideToCallProgress == 1){
        document.getElementById('chargingpage').setAttribute('hidden','true');
        document.getElementById('loadcallpage').removeAttribute('hidden');

        this.callCountDownInterval = setInterval(() => {
          this.countdown --;
          if (this.countdown === 0) {

            clearInterval(this.callCountDownInterval);
            this.callCountDownInterval = null;

            // MAKE CALL
            this.onVideoCall();
          }
          else{
            if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
              this.changeRef.detectChanges();
            }
          }
        }, 1000);
      }
      console.log("EVENT IS FINAL");
      // Reset progress to 0 when the pan gesture ends
      this.slideToCallProgress = 0;
    }
  }

  async onPanToCancel(event : any){
    console.log(event);
    console.log('onPanToCancel');

    let element = document.getElementById("slideToCancelActionBar");
    let elementPadding = 32;
    let width = element.clientWidth;

    /*
      Calculate the effective width of #slideToCallActionBar to account for the width of the slider image, ensuring that the scroll action is considered complete when the slider image reaches the end of the scroll bar.
      - 'elementPadding': Padding of #slideToActionBar
      - '70': Width of the slider image
    */
    let widthToRemove = 70 + elementPadding;
    width = width - widthToRemove;

    // Calculate the progress based on the distance and width
    let newProgress = event.distance / width;

    // If swiping towards the left, reduce the progress
    if (event.deltaX < 0) {
      this.slideToCancelCallProgress -= newProgress;
    } else {
      this.slideToCancelCallProgress = newProgress;
    }

    this.slideToCancelCallProgress = Math.min(Math.max(this.slideToCancelCallProgress, 0), 1);

    console.log("SlideToCancelProgress = "+this.slideToCancelCallProgress);
    // Check if the pan gesture has ended
    if (event.isFinal) {
      if(this.slideToCancelCallProgress == 1){
        clearInterval(this.callCountDownInterval);

        document.getElementById('chargingpage').removeAttribute('hidden');
        document.getElementById('loadcallpage').setAttribute('hidden','true');

        this.countdown = 3;
      }
      this.slideToCancelCallProgress = 0;
    }
  }


  getTranslateX(): number {
    let element = document.getElementById("slideToCallActionBar");
    let elementPadding = 32;
    let width = element.clientWidth;

    /*
      Calculate the effective width of #slideToCallActionBar to account for the width of the slider image, ensuring that the scroll action is considered complete when the slider image reaches the end of the scroll bar.
      - 'elementPadding': Padding of #slideToActionBar
      - '70': Width of the slider image
    */
    let widthToRemove = 70 + elementPadding;
    width = width - widthToRemove;

    return this.slideToCallProgress * width;
  }

  getSlideToCancelTranslateX(): number {
    let element = document.getElementById("slideToCancelActionBar");
    let elementPadding = 32;
    let width = element.clientWidth;

    /*
      Calculate the effective width of #slideToCallActionBar to account for the width of the slider image, ensuring that the scroll action is considered complete when the slider image reaches the end of the scroll bar.
      - 'elementPadding': Padding of #slideToActionBar
      - '70': Width of the slider image
    */
    let widthToRemove = 70 + elementPadding;
    width = width - widthToRemove;
    return this.slideToCancelCallProgress * width;
  }

  resetCountdown(){
    this.countdown = 3;
  }

  // VIDEO CALL
  onVideoCall(){
    SendBirdCall.dial(this.dialParams, async (call, error) => {
      if (error) {
        alert("Video Call Failed");
      }
      // CONSOLE
      console.log('Video calling ' + call.callee.nickname);

      this.utilityService.registCallEvent(call);

      // Reset countdown timer to 3
      // this.countdown = 3;
    });
  }

  async getRobotStatusAPI(){
    console.log('getRobotStatusAPI')
    let self = this;
    return new Promise(function(resolve, reject) {
      const headers = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'Authorization': 'my-auth-token',
          'Access-Control-Allow-Origin': '*'
        })
      };
      self.storage.get("robot").then( (robot_data)=> {
        let params = {
            "robot_id":robot_data['serial_number']
        };

        self.http.post(self.url + '/api/getGSRobotStatus',{headers: headers, params: params}).subscribe(data => {
        if(data['success']){
          console.log(`Successfully retrieved robot status at ${new Date().toLocaleString()}`);
          resolve(true);
        }
        else{
          console.log("Unable to get robot status")
          resolve(false);
        }
      }, error => {
        console.log(error);
        resolve(false);
        })
      });
    });
  }
}
