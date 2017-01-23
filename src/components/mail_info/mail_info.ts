import {Component, Input, Output, ChangeDetectionStrategy} from '@angular/core';
import {NavController, ToastController} from 'ionic-angular';
import {Observable, BehaviorSubject} from 'rxjs/Rx'

import {dateFormat} from 'dateformat'
import * as Server from '@root/server'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'

@Component({
  selector: 'mail-info',
  templateUrl: 'mail_info.html',
  // changeDetection:  ChangeDetectionStrategy.OnPush
})
export class MailInfoComponent {
  private _threadID: string;
  private _mid: string;
  public name: string;
  public subject: string;
  public snippet: string;
  public unread: boolean;
  public date: Date;
  public thread_length: number;


  public thread: Server.IMessageThread;
  public metadata: Server.IMessageMetadata;

  constructor(private data: Server.DataStore) {
  }

  get dateFormatString(): string {
    let now = new Date(Date.now())
    if (now.getFullYear() != this.date.getFullYear()) {
      return "dd.MM.yyyy";
    }
    if (now.getMonth() != this.date.getMonth() || now.getDate() != this.date.getDate()) {
      return "dd. MMM";
    }
    return "H:mm";
  }

  get threadID(): string {
      return this._threadID
  }

  @Input()
  set threadID(value: string) {
      this._threadID = value
      this.thread = this.data.threads[this._threadID]
      if (this.thread) {
        this._mid = this.thread[0][0]
        this.metadata = this.data.metadata[this._mid]
      }
      else {
        this._mid = undefined
        this.metadata = undefined
      }
      this.retrieveData()
  }

  get mid(): string {
      return this._mid
  }

  @Input()
  set mid(value: string) {
      this._mid = value
      this.metadata = this.data.metadata[this._mid]
      if (this.metadata) {
        this._threadID = this.metadata.thread_mid
        this.thread = this.data.threads[this._threadID]
      }
      else {
        this._threadID = undefined
        this.thread = undefined
      }
      this.retrieveData()
  }


  private retrieveData() {
    if (this.metadata) {
      this.name = this.metadata.from.fn
      this.subject = this.metadata.subject
      this.snippet = this.metadata.body.snippet
      this.date = new Date(this.metadata.timestamp*1000)
      this.unread = this.metadata.flags.unread
    }
    else {
      this.name = undefined
      this.subject = undefined
      this.snippet = undefined
      this.date = undefined
      this.unread = undefined
    }

    if (this.thread) {
      this.thread_length = this.thread.length
    }
    else {
      this.thread_length = undefined
    }
  }

}
