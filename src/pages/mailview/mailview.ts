import {Component} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

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
  public content_text: string = "";
  public content_html: string = "";
  public safe_html: SafeHtml = "";
  public subject: string = "";
  public allow_html: boolean = true;

  get show_html(): boolean {
    return this.allow_html && this.content_html.length>0
  }
  constructor(private params: NavParams, private server: Server, private data: DataStore, private sanitizer: DomSanitizer) {
    this.mid = params.get('mid')
    let self = this
    this.server.getMessage(this.mid)
      // .then(Lib.logfunc)
      .then( () => {
        let content_text = ""
        let content_html = ""
        for (let text of self.data.messages[self.mid].text_parts) {
          content_text += text.data
        }
        for (let html of self.data.messages[self.mid].html_parts) {
          content_html += html.data
        }
        self.content_text = content_text
        self.content_html = content_html
        self.safe_html = sanitizer.bypassSecurityTrustHtml(self.content_html)
        self.subject = self.data.metadata[self.mid].subject
    })
  }
}
