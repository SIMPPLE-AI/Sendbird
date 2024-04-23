import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NavigationBar } from '@ionic-native/navigation-bar';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { UtilityService } from '../providers/utility/utility';
import * as SendBirdCall from 'sendbird-calls';
import { LoginPage } from '../pages/login/login';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = LoginPage;

  authOption = { userId: '', accessToken: '' };

  constructor(screenOrientation:ScreenOrientation, navigationbar: NavigationBar, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private utilityService: UtilityService, public events:Events) {
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
        console.log(data);
        this.authOption.userId = data;
        SendBirdCall.init('15A8BF54-BF4F-44D6-8636-786F169BB2D4');
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
  async registSendBirdEventHandler(){
    let uniqueid = "unique-id";
    let acceptParams = {
      callOption: {
        remoteMediaView: <HTMLMediaElement>document.getElementById('remote_video_element_id'),
        localMediaView:  <HTMLMediaElement>document.getElementById('local_video_element_id'),
        audioEnabled: true,
        videoEnabled: true
      },
      holdActiveCall: true
    };

    SendBirdCall.addListener(uniqueid, {
      onRinging: async (call) => {
        if (!call.isEnded){
          call.isVideoCall? console.log(call.caller.nickname + " is video calling") : console.log(call.caller.nickname + " is voice calling");
        }

        // AUTO ACCEPT A CALL
        call.accept(acceptParams);
        document.getElementById('local_video_element_id').removeAttribute('hidden');

        await this.utilityService.registCallEvent(call);
      }
    });
  }
}
