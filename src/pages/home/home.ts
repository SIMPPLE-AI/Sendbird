import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import * as SendBirdCall from 'sendbird-calls';
import { UtilityService } from '../../providers/utility/utility';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  constructor(public navCtrl: NavController, private utilityService:UtilityService, private alertController:AlertController) { 
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

      // INTERFACE SETTINGS
      // document.getElementById('btnDirectCall').setAttribute('hidden','true');
      document.getElementById('btnVideoCall').setAttribute('hidden','true');
      // document.getElementById('btnEnd').removeAttribute('hidden');
      document.getElementById('local_video_element_id').removeAttribute('hidden');
      document.getElementById('remote_video_element_id').removeAttribute('hidden');

      // END CALL
      // document.getElementById('btnEnd').onclick = function(){
      //   call.end();
      // }
      
      this.utilityService.registCallEvent(call);
    });
  }
}