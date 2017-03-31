import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { MobxAngularModule } from 'mobx-angular';

import * as Pages from '@root/pages';
import * as Components from '@root/components'
import { DataStore, Server } from '@root/server';
import { Store } from '@root/store'

@NgModule({
  declarations: [
    MyApp,
    Pages.LoginPage,
    Pages.MailboxPage,
    Pages.MailViewPage,
    Pages.TagmenuPage,
    Components.MailInfoComponent,
    Components.TagitemComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    MobxAngularModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Pages.LoginPage,
    Pages.MailboxPage,
    Pages.MailViewPage,
    Pages.TagmenuPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DataStore,
    Components.MessageHandler,
    Server,
    Store,
  ]
})
export class AppModule {}
