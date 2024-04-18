import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import * as SendBirdCall from 'sendbird-calls';
import { UtilityService } from '../../providers/utility/utility';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})



export class HomePage {

  callTriggered = true;

  constructor(private events:Events, public navCtrl: NavController, private utilityService:UtilityService) { 
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
    isVideoCall: false,
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
    await this.delay(300);
    if (this.callTriggered){
      this.callTriggered = false;
      // CHANGE PAGE
      document.getElementById('chargingpage').setAttribute('hidden','true');
      document.getElementById('loadcallpage').removeAttribute('hidden');
      
      // SHOW COUNTDOWN
      await this.delay(1000);
      document.getElementById('3').setAttribute('hidden','true');
      document.getElementById('2').removeAttribute('hidden');
      await this.delay(1000);
      document.getElementById('2').setAttribute('hidden','true');
      document.getElementById('1').removeAttribute('hidden');

      // MAKE CALL
      await this.delay(1000);
      this.onVideoCall();

      // RESEST COUNTDOWN NUMBER
      await this.delay(500);
      document.getElementById('1').setAttribute('hidden','true');
      document.getElementById('3').removeAttribute('hidden');
    }
  }

  // CANCEL CALL INITIATE
  onCancel() {
  //   if (this.callCancelTrigger) {
  //     this.events.publish('CancelCallTrigger', true);
  //     this.callCancelTrigger = false;
  //   }
  }

  // VIDEO CALL 
  onVideoCall(){
    this.dialParams.isVideoCall = true;
    this.dialParams.callOption.videoEnabled = true;
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