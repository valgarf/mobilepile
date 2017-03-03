import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { Server } from '@root/server'
import * as Lib from '@root/lib'
import * as Pages from '@root/pages'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage = Pages.MailboxPage;
  menuPage = Pages.TagmenuPage;
  @ViewChild('rootNav') nav;

  activeLogin = false
  handleAuthNavigation(auth) {
    if (auth) {
      this.nav.pop();
      this.menuCtrl.enable(true);
    }
    else {
      this.nav.push(Pages.LoginPage)
      this.menuCtrl.enable(false);
    }
  }

  constructor(platform: Platform, private server: Server, private menuCtrl: MenuController) {
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
