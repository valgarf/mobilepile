import {Component} from '@angular/core';

import {NavController, NavParams} from 'ionic-angular';

import {Server, DataStore, IMessageText} from '@root/server'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'

@Component({
  selector: 'page-mailview',
  templateUrl: 'mailview.html'
})
export class MailViewPage {
  public mid: string;
  public content: string;
  public subject: string;

  constructor(private params: NavParams, private server: Server, private data: DataStore) {
    this.mid = params.get('mid')
    let self = this
    this.server.getMessage(this.mid).then(Lib.logfunc).then( () => {
      let content = ""
      for (let text of self.data.messages[self.mid].text_parts) {
        content += text.data
      }
      self.content = content
      self.subject = self.data.metadata[self.mid].subject
    })
  }
}
