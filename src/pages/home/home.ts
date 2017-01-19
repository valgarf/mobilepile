import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

// import {ReactingClass, reactify} from '../../lib';
import { Server } from '@root/server'

// class TestClass extends ReactingClass {
//   constructor() {
//     super();
//   }
//   @reactify test: string;
// }

import {BehaviorSubject} from 'rxjs/Rx'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, private server: Server) {

    // let obj = new TestClass();
    // obj.getSubject('test').subscribe(console.log.bind(console));

    server.url= 'url'
    server.login('pass').subscribe((res) => console.log(res))
  }

}
