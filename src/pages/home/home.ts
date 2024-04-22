import { Component, ChangeDetectorRef, ViewRef } from '@angular/core';
import { Events, LoadingController } from 'ionic-angular';
import * as SendBirdCall from 'sendbird-calls';
import { UtilityService } from '../../providers/utility/utility';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  slideToCallProgress = 0;
  callCountDownInterval:any;
  slideToCancelCallProgress = 0;
  countdown = 3;

  constructor(public http:HttpClient, private loadingController:LoadingController, public storage:Storage, private events:Events, private utilityService:UtilityService,private changeRef: ChangeDetectorRef) {
    this.events.subscribe('logout', (data) => {
      if (data) {
        // go to login.ts
      }
    })
  }

  async ionViewDidLoad(){
    console.log("ionViewDidLoad");

    // DISPLAY LOADER
    let loader = this.loadingController.create({
      content: "Preparing Home Page"
    });
    loader.present();

    // await this.getMappedRobotUser();
    loader.dismiss();

  } 

  getMappedRobotUser(){
    console.log("Getting mapped user");
    let self = this;
    return new Promise(function(resolve, reject) {
      self.storage.get("login").then( (user_data)=> {
        console.log("Got user data");
        console.log(user_data);
        if (user_data) {
          const headers = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Authorization': 'my-auth-token',
              'Access-Control-Allow-Origin': '*'
            })
          };

          let params = {
              "username":user_data['Username'],
              "password":user_data['Password']
          };

          const url = "http://192.168.86.38";
          self.http.post(url + '/api/getMappedRobotUser',{headers: headers, params: params}).subscribe(data => {
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
    userId: 'user4',
    isVideoCall: true,
    callOption: {
      audioEnabled: true,
      videoEnabled: true
    }
  };

  // DIRECT CALL
  /* onDirectCall(){
    this.dialParams.isVideoCall = false;
    this.dialParams.callOption.videoEnabled = false;
    const call =  SendBirdCall.dial(this.dialParams, (call, error) => {
      if (error) {
        alert("Direct Call Failed");
      }

      // CONSOLE
      console.log('Voice calling ' + call.callee.nickname);

      // INTERFACE SETTINGS
      document.getElementById('btnDirectCall').setAttribute('hidden','true');
      document.getElementById('btnVideoCall').setAttribute('hidden','true');
      document.getElementById('btnEnd').removeAttribute('hidden');

      // END CALL
      document.getElementById('btnEnd').onclick = function(){
        call.end();
      }
      this.utilityService.registCallEvent(call);
    });
  }
  */

  async onPanToCall(event: any) {
    console.log(event);
    console.log('onPanToCall');

    let element = document.getElementById("slideToCallActionBar");
    let elementPadding = 32;
    let width = element.clientWidth; // Width of circle element + adding of slide to call action bar

    /*
      Calculate the effective width of #slideToCallActionBar to account for the width of the slider image, ensuring that the scroll action is considered complete when the slider image reaches the end of the scroll bar.
      - 'elementPadding': Padding of #slideToActionBar
      - '80': Width of the slider image
    */
    let widthToRemove = 80 + elementPadding;
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

            // MAKE CALL
            this.onVideoCall();

            // Reset countdown timer to 3
            this.countdown = 3;
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
      - '80': Width of the slider image
    */
    let widthToRemove = 80 + elementPadding;
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
      - '80': Width of the slider image
    */
    let widthToRemove = 80 + elementPadding;
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
      - '80': Width of the slider image
    */
    let widthToRemove = 80 + elementPadding;
    width = width - widthToRemove;
    return this.slideToCancelCallProgress * width;
  }

  // VIDEO CALL
  onVideoCall(){
    SendBirdCall.dial(this.dialParams, (call, error) => {
      if (error) {
        alert("Video Call Failed");
      }
      // CONSOLE
      console.log('Video calling ' + call.callee.nickname);

      this.utilityService.registCallEvent(call);
    });
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
