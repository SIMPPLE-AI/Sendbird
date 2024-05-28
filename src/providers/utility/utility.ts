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
  url = "https://demo.simpple.app";
  robotUrl = "http://black-ugly:55555";
  // robotUrl = "http://10.7.5.88:8080"   // FOR TESTING

  constructor(private storage:Storage, private alertController:AlertController, public http: HttpClient, public events: Events) {
    console.log('Hello UtilityProvider Provider');
  }

  /* GET ROBOT STATUS */
  async getRobotStatusAPI(){
    console.log('getRobotStatusAPI')
    let self = this;
    return new Promise(function(resolve, reject) {
      self.http.get(self.robotUrl + '/gs-robot/data/device_status').subscribe(data => {
        if(data){
          console.log(`Successfully retrieved robot status at ${new Date().toLocaleString()}`);
          console.log(data['data']['charge']);
          if (data['data']['charge'] == false && (data['data']['manualCharging'] == false)){
            document.getElementById('patrolpage').removeAttribute('hidden');
            document.getElementById('chargingpage').setAttribute('hidden','true');
            // Check if robot is executing a task or in idle mode
            self.http.get(self.robotUrl + '/gs-robot/real_time_data/robot_status').subscribe(data => {
              if (data['data']['robotStatus']['workType'] == 'IDLE') {
                document.getElementById('robotStatusText').innerHTML = "Just Hanging Out In Chill Mode...";
              }
              else {
                document.getElementById('robotStatusText').innerHTML = "Vigilance Operations Are Currently Underway...";
              }
            })
          }
          else if (data['data']['charge'] == true || (data['data']['manualCharging'] == true)){
            document.getElementById('chargingpage').removeAttribute('hidden');
            document.getElementById('patrolpage').setAttribute('hidden','true');
            document.getElementById('robotStatusText').innerHTML = "Recharging my circuits, one electron at a time...";
          }
          resolve(true);
        }
        else{
          console.log("Unable to get robot status")
          resolve(false);
        }
      });
    });
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
                this.storage.remove('robot');
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
  registCallEvent(call:SendBirdCall.DirectCall){
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

      // Change User Interface 
      document.getElementById('local_video_element_id').removeAttribute('hidden');
      call.setRemoteMediaView(<HTMLVideoElement>document.getElementById('remote_video_element_id'));
      call.setLocalMediaView(<HTMLVideoElement>document.getElementById('local_video_element_id'));
      remote_video.muted = false;



      console.log('----TEST----');
      setTimeout(() => {
        console.log("1.5seconds delay");
        // Retrieve and display available audio input devices
        const audioInputDevices = SendBirdCall.getAvailableAudioInputDevices();
        console.log("Available audio input devices:", audioInputDevices);
        console.log("Number of available audio input devices:", audioInputDevices.length);
        if(audioInputDevices.length){
          SendBirdCall.selectAudioInputDevice(audioInputDevices[0]);
        }

        // Retrieve and display available audio output devices
        const audioOutputDevices = SendBirdCall.getAvailableAudioOutputDevices();
        console.log("Available audio output devices:", audioOutputDevices);
        console.log("Number of available audio output devices:", audioOutputDevices.length);
        if(audioOutputDevices.length){
          SendBirdCall.selectAudioOutputDevice(audioOutputDevices[0]);
        }
      },1500);
    }

    call.onEnded = (call) => {
      console.log("Call Ended");
      document.getElementById('loadcallpage').setAttribute('hidden','true');
      document.getElementById('idlepage').removeAttribute('hidden');
      document.getElementById('overallpage').removeAttribute('hidden');
      document.getElementById('videocall').setAttribute('hidden','true');
      this.events.publish('CallEndedEvent');

       // Resume Robot Task Queue
       console.log('resumeTaskQueueAPI')
       let self = this;
       new Promise(function(resolve, reject) {
         self.http.get(self.robotUrl + '/gs-robot/cmd/resume_task_queue').subscribe(data => {
           if(data){
             console.log(`Successfully resumed robot's task at ${new Date().toLocaleString()}`);
             resolve(true);
           }
           else{
             console.log("Unable to resume task");
             resolve(false);
           }
         });
       });

      // Retrieve Robot Status
      this.getRobotStatusAPI();
    }
    
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
