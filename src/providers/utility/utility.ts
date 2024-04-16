import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as SendBirdCall from 'sendbird-calls';
import { Events, AlertController } from 'ionic-angular';

// PARAMETERS
declare let KioskPlugin: any;
let clickCount = 0;
let timeoutRef = null;

/*
  Generated class for the UtilityProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UtilityService {

  constructor(private alertController:AlertController, public http: HttpClient, public events: Events) {
    console.log('Hello UtilityProvider Provider');
  }

  /* EXIT EVENT HANDLER */
  exit() {
    // Increment the click count
    clickCount++;

    // Check if five clicks have occurred
    if (clickCount === 5) {
      // Reset the click count
      clickCount = 0;
      // Clear the timeout
      clearTimeout(timeoutRef);

      console.log("Five clicks detected!");
      
      // CREATE POP UP TO REQUEST FOR LOGOUT PASSWORD
      let alertControl = this.alertController.create({
        title: '<div style="text-align: center;">Exit</div>',
        cssClass: 'exitAlert',
        inputs: [
          {
            name: 'password',
            placeholder: 'Password',
            type: 'password'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Exit',
            handler: data => {
              if (data['password'] === "simpple") {
                // logged in!
                KioskPlugin.exitKiosk();	// REQUIRES ACTION BUTTON TO USE
              } else {
                alert("Wrong Password");
                // invalid login
                return false;
              }
            }
          }
        ]
      });
      alertControl.present();
    } else {
      // Set a timeout to reset the click count after 2 seconds
      timeoutRef = setTimeout(() => {
        clickCount = 0;
        console.log("Timeout reached. Resetting click count.");
      }, 2000);
    }
  }

  /* CALL EVENT HANDLER */
  registCallEvent(call:SendBirdCall.DirectCall){
    call.onEstablished = (call) => {
      console.log("Call is Established");
      // INTERFACE SETTINGS
      // document.getElementById('btnDirectCall').setAttribute('hidden','true');
      document.getElementById('btnVideoCall').setAttribute('hidden','true');
      // document.getElementById('btnAccept').setAttribute('hidden','true');
      // document.getElementById('btnEnd').removeAttribute('hidden');
      // CHECK IF CALL IS A VIDEO CALL
      if (call.isVideoCall){
        // INTERFACE SETTINGS
        document.getElementById('local_video_element_id').removeAttribute('hidden');
        document.getElementById('remote_video_element_id').removeAttribute('hidden');
        
        // VIDEO ELEMENT
        call.setLocalMediaView(<HTMLMediaElement>document.getElementById('local_video_element_id'));
        call.setRemoteMediaView(<HTMLMediaElement>document.getElementById('remote_video_element_id'));
        var local_video = <HTMLMediaElement>document.getElementById('local_video_element_id');
        local_video.muted = true;
      } else {
        // AUDIO ELEMENT [ONLY REQUIRED FOR VOICE CALL]
        /* call.setLocalMediaView(<HTMLMediaElement>document.getElementById('local_audio_element_id'));
        call.setRemoteMediaView(<HTMLMediaElement>document.getElementById('remote_audio_element_id')); */
      }

      // MUTE || UNMUTE
      /* document.getElementById('muteSwitch').onclick = function(){
        var muteSwitch: HTMLInputElement = document.getElementById('muteSwitch') as HTMLInputElement;
        if (muteSwitch.checked) {
          call.muteMicrophone();
        }
        else {
          call.unmuteMicrophone();
        }
      } */

      // ON || OFF CAMERA
      /* document.getElementById('videoSwitch').onclick = function(){
        var videoSwitch: HTMLInputElement = document.getElementById('videoSwitch') as HTMLInputElement;
        if (videoSwitch.checked) {
          call.startVideo();
        }
        else {
          call.stopVideo();
        }
      }*/
    }
  
    call.onEnded = (call) => {
      console.log("Call Ended");
      // INTERFACE SETTINGS
      // var muteSwitch: HTMLInputElement = document.getElementById('muteSwitch') as HTMLInputElement;
      // muteSwitch.checked = false;
      // var videoSwitch: HTMLInputElement = document.getElementById('videoSwitch') as HTMLInputElement;
      // videoSwitch.checked = true; 

      // document.getElementById('btnEnd').setAttribute('hidden','true');
      // document.getElementById('btnAccept').setAttribute('hidden','true');

      // document.getElementById('btnDirectCall').removeAttribute('hidden');
      document.getElementById('btnVideoCall').removeAttribute('hidden');

      document.getElementById('local_video_element_id').setAttribute('hidden','true');
      document.getElementById('remote_video_element_id').setAttribute('hidden','true');
    };
  
    call.onRemoteAudioSettingsChanged = (call) => {
      if(call.isRemoteAudioEnabled){
        console.log(`Remote Audio unmuted`);
      } else {
        console.log(`Remote Audio muted`);
      }
    };
  
    call.onRemoteVideoSettingsChanged = (call) => {
      if(call.isRemoteVideoEnabled){
        console.log(`Remote Video started`);
      } else {
        console.log(`Remote Video stopped`);
      }
    };
  }
}
