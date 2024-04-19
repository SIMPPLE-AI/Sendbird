import { Component, ChangeDetectorRef, ViewRef } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import * as SendBirdCall from 'sendbird-calls';
import { UtilityService } from '../../providers/utility/utility';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})



export class HomePage {
  callTriggered = true;
  progress = 0;
  callCountDownInterval:any;
  slideToCancelCallProgress = 0;
  countdown = 3;

  constructor(private events:Events, public navCtrl: NavController, private utilityService:UtilityService,private changeRef: ChangeDetectorRef) {
  }

  ionViewDidLoad(){
    console.log("ionViewDidLoad");
    this.events.subscribe('CallTriggerEnabler', (data) => {
      this.callTriggered = data;
    })
  }

  // KIOSK MODE SETTINGS
  exit() {
    this.utilityService.exit();
  }

  // DIRECT CALL | VOICE CALL
  dialParams:SendBirdCall.DialParams = {
    userId: 'user2',
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
    let width = element.clientWidth;

    let widthToRemove = document.getElementsByClassName('slideToCallACtionBarText')[0];
    width = width - widthToRemove.clientWidth;

    // Calculate the progress based on the distance and width
    let progress = event.distance / width;

    // If swiping towards the left, reduce the progress
    if (event.deltaX < 0) {
      this.progress -= progress;
    } else {
      this.progress = progress;
    }


    this.progress = Math.min(Math.max(this.progress, 0), 1);

    // Check if the pan gesture has ended
    if (event.isFinal) {
      if(this.progress == 1){
      document.getElementById('chargingpage').setAttribute('hidden','true');
      document.getElementById('loadcallpage').removeAttribute('hidden');

      // const timerElement = document.getElementById('3');
      // timerElement.innerText = `${count}`;
      this.callCountDownInterval = setInterval(() => {
        this.countdown --;
        console.log("Updating timerElement Text");
        if (this.countdown === 0) {
          // const timerElement = document.getElementById('3');
          // Reset back to 3 seconds
          // timerElement.setAttribute("src","../../assets/imgs/Count_3.png");
          this.countdown = 3;

          clearInterval(this.callCountDownInterval);

          console.log("MAKING CALL");
          // MAKE CALL
          this.onVideoCall();
        }
        else{
          // timerElement.setAttribute("src","../../assets/imgs/Count_"+ count +".png");
          if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
            this.changeRef.detectChanges();
          }
        }
      }, 1000);
      }
      console.log("EVENT IS FINAL");
      // Reset progress to 0 when the pan gesture ends
      this.progress = 0;
    }
  }

  async onPanToCancel(event : any){
    console.log(event);
    console.log('onPanToCancel');

    let element = document.getElementById("slideToCancelActionBar");
    let width = element.clientWidth;

    let widthToRemove = document.getElementsByClassName('slideToCancelActionBarText')[0];
    width = width - widthToRemove.clientWidth;

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
        console.log("Call cleared");
        clearInterval(this.callCountDownInterval);

        document.getElementById('chargingpage').removeAttribute('hidden');
        document.getElementById('loadcallpage').setAttribute('hidden','true');

        // const timerElement = document.getElementById('3');
        // Reset back to 3 seconds
        // timerElement.setAttribute("src","../../assets/imgs/Count_3.png");

        this.countdown = 3;
        // alert("Call cleared");
      }
      this.slideToCancelCallProgress = 0;
    }
  }


  getTranslateX(): number {
    let element = document.getElementById("slideToCallActionBar");
    let width = element.clientWidth;

    let widthToRemove = document.getElementsByClassName('slideToCallACtionBarText')[0];

    if(widthToRemove){
      width = width - widthToRemove.clientWidth;
      console.log("---slideActionBar---");
      console.log('width = ' +width);
      console.log('width to remove = ' +widthToRemove.clientWidth);
    }
    return this.progress * width;
  }

  getSlideToCancelTranslateX(): number {
    let element = document.getElementById("slideToCancelActionBar");
    let width = element.clientWidth;

    let widthToRemove = document.getElementsByClassName('slideToCancelActionBarText')[0];

    if(widthToRemove){
      width = width - widthToRemove.clientWidth;
      console.log("---slideToCancelActionBar---");
      console.log('width = ' +width);
      console.log('width to remove = ' +widthToRemove.clientWidth);
    }
    return this.slideToCancelCallProgress * width;
  }

  // async onSlider() {
  //   if (this.callTriggered){
  //     this.callTriggered = false;
  //     // CHANGE PAGE
  //     document.getElementById('chargingpage').setAttribute('hidden','true');
  //     document.getElementById('loadcallpage').removeAttribute('hidden');

  //     console.log('slide pls')
  //     // SHOW COUNTDOWN
  //     this.countdown = 3;
  //     // CHECK IF USER CANCELLED THE CALL
  //     this.events.subscribe('CancelCallTrigger', (data) => {
  //       if (data) {
  //         this.cancelCallTrigger = true;
  //       }
  //     });

  //     while (this.countdown != 1) {
  //       await this.delay(1000);
  //       this.countdown--;     // decrease counter by 1
  //       this.appRef.tick();   // refresh html page to update value
  //     }

  //     // MAKE CALL
  //     if (!this.cancelCallTrigger){
  //       this.onVideoCall();
  //     }
  //     else {
  //       document.getElementById('loadcallpage').setAttribute('hidden','true');
  //       document.getElementById('chargingpage').removeAttribute('hidden');
  //     }
  //   }
  // }

  // // CANCEL CALL INITIATE
  // onCancel() {
  //   if (this.callCancelled) {
  //     this.events.publish('CancelCallTrigger', true);
  //     this.callCancelled = false;
  //   }
  // }

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
