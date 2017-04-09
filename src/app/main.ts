/**
 * @file entry point of the application, just bootstraps the app using the AppModule
 */

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
