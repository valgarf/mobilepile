import {NgModule, ErrorHandler} from '@angular/core';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {MobxAngularModule} from 'mobx-angular';

import * as Pages from '@root/pages';
import * as Components from '@root/components'
import {Server} from '@root/server';
import {Store} from '@root/store'
import {MyApp} from './app.component';


/**
 * This is the main module of the application, it makes all necessary pages, components and providers available and loads the root component (MyApp)
 */
@NgModule({
  declarations: [
    MyApp,
    Pages.LoginPage,
    Pages.MailboxPage,
    Pages.MailViewPage,
    Pages.TagmenuPage,
    Pages.ThreadViewPage,
    Components.MailInfoComponent,
    Components.TagitemComponent,
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    MobxAngularModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Pages.LoginPage,
    Pages.MailboxPage,
    Pages.MailViewPage,
    Pages.TagmenuPage,
    Pages.ThreadViewPage,
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Components.MessageHandler, // for showing Toasts on erros
    Server, // abstraction of actual http requests
    Store, // local storage and cache for server data and local state
  ]
})
export class AppModule { }
