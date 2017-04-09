import {Component, ViewChild} from '@angular/core';
import {Platform, MenuController} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';
import {useStrict} from 'mobx'

import {Store} from '@root/store'
import * as Lib from '@root/lib'
import * as Pages from '@root/pages'
import * as Components from '@root/components'


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

  constructor(platform: Platform, private store: Store, private menuCtrl: MenuController, private msgHandler: Components.MessageHandler) {
    Lib.bindMethods(this)
    useStrict(true) //strict usage of actions in mobx are enforces
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      store.state.authenticatedObs.subscribe(this.handleAuthNavigation);
      Splashscreen.hide();
    });
  }
}
