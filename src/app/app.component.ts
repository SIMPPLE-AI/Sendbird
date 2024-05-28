import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NavigationBar } from '@ionic-native/navigation-bar';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from '../providers/utility/utility';
import * as SendBirdCall from 'sendbird-calls';
import { LoginPage } from '../pages/login/login';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = LoginPage;

  robotUrl = "http://black-ugly:55555";
  // robotUrl = "http://10.7.5.88:8080"   // FOR TESTING

  authOption = { userId: '', accessToken: '' };
  acceptParams = {
    callOption: {
      audioEnabled: true,
      videoEnabled: true
    }
  };

  constructor(public http:HttpClient, screenOrientation:ScreenOrientation, navigationbar: NavigationBar, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private utilityService: UtilityService, public events:Events) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // HIDE NAVIGATION BAR
      navigationbar.setUp(true);

      // SCREEN ORIENTATION LOCK
      screenOrientation.lock(screenOrientation.ORIENTATIONS.PORTRAIT);
    })

    // SENDBIRD INIT & AUTHENTICATE
    this.events.subscribe('init', (data) => {
      if (data != null){
        console.log('--initEventHandler---')
        console.log(data);
        this.authOption.userId = data['sendbird_user_account_id'];
        SendBirdCall.init(data['clients']['sendbird_application_id']);
        this.registSendBirdEventHandler();
        SendBirdCall.authenticate(this.authOption, (result, error) => {
          if (error) {
            alert("Authentication Error. Please try again.");
          }
          else {
            console.log('AUTHENTICATION SUCCESSFUL');
            SendBirdCall.connectWebSocket()
            .then(/* Succeeded to connect */)
            .catch(/* Failed to connect */);
          }
        });
      }
    })
  }

  // RECEIVE A CALL
  registSendBirdEventHandler(){
    let uniqueid = "unique-id";

    SendBirdCall.addListener(uniqueid, {
      onRinging: (call) => {

        let onGoingCallCount = SendBirdCall.getOngoingCallCount();
        console.log("---Get ongoing call count---");
        console.log(SendBirdCall.getOngoingCallCount());

        /*
        If there is currently no ongoing calls, then handle the call accordingly
        Else if there is an ongoing call, block out all other calls

        callCount refers to number of incoming calls, don't have to be answered calls
        callCount == 0 means call was ended
        callCount == 1 means 1 incoming call
        callCount >= 1 means X number of incoming calls
        */
        if(onGoingCallCount < 2){
          if (!call.isEnded){
            call.isVideoCall? console.log(call.caller.nickname + " is video calling") : console.log(call.caller.nickname + " is voice calling");
            // AUTO ACCEPT A CALL
            call.accept(this.acceptParams);

            // Pause Robot Task Queue
            console.log('pauseTaskQueueAPI')
            let self = this;
            new Promise(function(resolve, reject) {
              self.http.get(self.robotUrl + '/gs-robot/cmd/pause_task_queue').subscribe(data => {
                if(data){
                  console.log(`Successfully paused robot's task at ${new Date().toLocaleString()}`);
                  resolve(true);
                }
                else{
                  console.log("Unable to pause task");
                  resolve(false);
                }
              });
            });
            
            this.utilityService.registCallEvent(call);
          }
        }
        else{
          console.log("***ALREADY HAVE ACTIVE CALL****");
          call.end();
        }
      }
    });
  }
}
