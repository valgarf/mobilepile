import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import * as Pages from '@root/pages';
import * as Components from '@root/components'
import { Server } from '@root/server';

@NgModule({
  declarations: [
    MyApp,
    Pages.LoginPage,
    Pages.MailboxPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Pages.LoginPage,
    Pages.MailboxPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Server,
    Components.MessageHandler
  ]
})
export class AppModule {}
