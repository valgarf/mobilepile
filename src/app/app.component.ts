import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { Server } from '@root/server'
import * as Lib from '@root/lib'
import * as Pages from '@root/pages'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage = Pages.MailboxPage;
  @ViewChild('rootNav') nav;

  activeLogin = false
  handleAuthNavigation(auth) {
    if (auth) {
      this.nav.pop();
    }
    else {
      this.nav.push(Pages.LoginPage)
    }
  }

  constructor(platform: Platform, private server: Server) {
    let self = this;
    Lib.bindMethods(this)
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      server.authenticatedObs.subscribe(self.handleAuthNavigation);
      Splashscreen.hide();
    });
  }
}
