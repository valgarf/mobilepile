import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';

import {Server, DataStore} from '@root/server'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'

@Component({
  selector: 'page-tagmenu',
  templateUrl: 'tagmenu.html'
})
export class TagmenuPage {

  constructor(private server: Server, private data: DataStore) {
  }
}
