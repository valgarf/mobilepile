import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import * as Pages from '@root/pages';
import * as Components from '@root/components'
import * as Server from '@root/server';

@NgModule({
  declarations: [
    MyApp,
    Pages.LoginPage,
    Pages.MailboxPage,
    Pages.MailViewPage,
    Pages.TagmenuPage,
    Components.MailInfoComponent,
    Components.TaglistComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp)
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
    Server.DataStore,
    Server.Server,
    Components.MessageHandler
  ]
})
export class AppModule {}
