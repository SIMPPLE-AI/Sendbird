import { Component, ApplicationRef } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import * as SendBirdCall from 'sendbird-calls';
import { UtilityService } from '../../providers/utility/utility';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})



export class HomePage {

  callTriggered = true;
  callCancelled = false;
  cancelCallTrigger = false;
  public countdown = 3;

  constructor(public appRef:ApplicationRef, private events:Events, public navCtrl: NavController, private utilityService:UtilityService) { 
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

  async onSlider() {
    if (this.callTriggered){
      this.callTriggered = false;
      // CHANGE PAGE
      document.getElementById('chargingpage').setAttribute('hidden','true');
      document.getElementById('loadcallpage').removeAttribute('hidden');
      
      console.log('slide pls')
      // SHOW COUNTDOWN
      this.countdown = 3;
      // CHECK IF USER CANCELLED THE CALL
      this.events.subscribe('CancelCallTrigger', (data) => {
        if (data) {
          this.cancelCallTrigger = true;
        }
      });

      while (this.countdown != 1) {
        await this.delay(1000);
        this.countdown--;     // decrease counter by 1
        this.appRef.tick();   // refresh html page to update value
      }

      // MAKE CALL
      if (!this.cancelCallTrigger){
        this.onVideoCall();
      }
      else {
        document.getElementById('loadcallpage').setAttribute('hidden','true');
        document.getElementById('chargingpage').removeAttribute('hidden');
      }
    }
  }

  // CANCEL CALL INITIATE
  onCancel() {
    if (this.callCancelled) {
      this.events.publish('CancelCallTrigger', true);
      this.callCancelled = false;
    }
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