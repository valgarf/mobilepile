import {Component, ChangeDetectionStrategy} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {NavParams} from 'ionic-angular';
import {observable, computed, autorun} from 'mobx'

import {Store} from '@root/store'

/**
 * Shows a single mail in an iframe or as simple text
 */
@Component({
  selector: 'page-mailview',
  templateUrl: 'mailview.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MailViewPage {
  @observable messageID: string;
  @observable allow_html: boolean = true; //TODO: ask the user first? global settings?

  @computed get message() {
    return this.store.messages.getByID(this.messageID)
  }
  @computed get safe_html(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.message.html_complete)
  }
  @computed get show_html(): boolean {
    return this.allow_html && this.message.html_complete.length > 0
  }

  private _handle = null;
  constructor(private params: NavParams, private store: Store, private sanitizer: DomSanitizer) {
    this.messageID = params.get('mid')
    this._handle = autorun(() => { if (this.message != null) this.message.loadMessage().catch(this.store.state.handleError) })
  }

  public ionViewWillUnload() {
    this._handle()
  }
  // ngAfterViewInit() {
  //   var x = document.getElementById("mailframe");
  //   var y = (<HTMLIFrameElement> x).contentWindow.document;
  //   y.body.style.zoom = "50%";
  // }
}
