import {Component, ViewChild} from '@angular/core';
import {Platform, MenuController} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';
import {useStrict} from 'mobx'

import {Store} from '@root/store'
import * as Lib from '@root/lib'
import * as Pages from '@root/pages'
import * as Components from '@root/components'


/**
 * This is the main Component used for the application, all other pages are children.
 * It sets up the start page, global configurations, menus, etc.
 */
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage = Pages.MailboxPage;
  menuPage = Pages.TagmenuPage;
  @ViewChild('rootNav') nav; //get the navigation, cannot be injected here as the nav system is a child of this component

  activeLogin = false
  handleAuthNavigation(auth) { //if and only if not authenticated, show a login page
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
    useStrict(true) //strict usage of actions in mobx (values of observables can only be changed inside of actions)
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      store.state.authenticatedObs.subscribe(this.handleAuthNavigation);
      Splashscreen.hide();
    });
  }
}
