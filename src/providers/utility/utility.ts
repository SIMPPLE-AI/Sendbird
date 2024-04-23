import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as SendBirdCall from 'sendbird-calls';
import { Events, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

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

  constructor(private storage:Storage, private alertController:AlertController, public http: HttpClient, public events: Events) {
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
        title: '<div style="text-align: center;">Logout</div>',
        cssClass: 'exitAlert',

        inputs: [
          {
            name: 'password',
            placeholder: 'Password',
            type: 'password',
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
                KioskPlugin.exitKiosk();
              } else {
                alert("Wrong Password");
                return false;
              }
            }
          },
          {
            text: 'Logout',
            handler: data => {
              if (data['password'] === "simpple") {
                this.storage.remove("login");   // Remove data
                this.events.publish('logout', true);  // Trigger event to say that user has logged out
                // KioskPlugin.exitKiosk();
              } else {
                alert("Wrong Password");
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
      }, 1500);
    }
  }

  /* CALL EVENT HANDLER */
  async registCallEvent(call:SendBirdCall.DirectCall){
    return new Promise(function(resolve, reject) {
      // DISPLAY VIDEO
      document.getElementById('videocall').removeAttribute('hidden');
      document.getElementById('overallpage').setAttribute('hidden','true');

      call.setRemoteMediaView(<HTMLVideoElement>document.getElementById('local_video_element_id'));
      call.setLocalMediaView(<HTMLVideoElement>document.getElementById('remote_video_element_id'));

      var local_video = <HTMLVideoElement>document.getElementById('local_video_element_id');
      var remote_video = <HTMLVideoElement>document.getElementById('remote_video_element_id');
      local_video.muted = true;
      remote_video.muted = true;


      call.onEstablished = (call) => {
        console.log("Call is Established");
        document.getElementById('local_video_element_id').removeAttribute('hidden');
        call.setRemoteMediaView(<HTMLVideoElement>document.getElementById('remote_video_element_id'));
        call.setLocalMediaView(<HTMLVideoElement>document.getElementById('local_video_element_id'));
        remote_video.muted = false;
      }

      call.onEnded = (call) => {
        console.log("Call Ended");
        document.getElementById('loadcallpage').setAttribute('hidden','true');
        document.getElementById('chargingpage').removeAttribute('hidden');
        document.getElementById('overallpage').removeAttribute('hidden');
        document.getElementById('videocall').setAttribute('hidden','true');
        this.events.publish('CallTriggerEnabler', true);
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

      resolve(true);
    });
  }
}
