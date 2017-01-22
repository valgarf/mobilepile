import {Component, Input, Output, ChangeDetectionStrategy} from '@angular/core';
import {NavController, ToastController} from 'ionic-angular';
import {Observable, BehaviorSubject} from 'rxjs/Rx'

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
  public date: Date;
  public thread_length: number;

  public thread: Server.IMessageThread;
  public metadata: Server.IMessageMetadata;

  @Input()
  set threadID(value: string) {
      this._threadID = value
      this.thread = this.data.threads[this._threadID]
      if (this.thread) {
        this._mid = this.thread[0][0]
        this.metadata = this.data.metadata[this._mid]
        this.thread_length = this.thread.length
      }
      else {
        this._mid = undefined
        this.metadata = undefined
      }

      if (this.metadata) {
        this.name = this.metadata.from.fn
        this.subject = this.metadata.subject
        this.snippet = this.metadata.body.snippet
        this.date = new Date(this.metadata.timestamp)
      }
      else {
        this.name = undefined
        this.subject = undefined
        this.snippet = undefined
        this.date = undefined
      }
  }

  @Input()
  set mid(value: string) {
      this._mid = value
      this.metadata = this.data.metadata[this._mid]

      if (this.metadata) {
        this.name = this.metadata.from.fn
        this.subject = this.metadata.subject
        this.snippet = this.metadata.body.snippet
        this.date = new Date(this.metadata.timestamp)
        this._threadID = this.metadata.thread_mid
        this.thread = this.data.threads[this._threadID]
      }
      else {
        this.name = undefined
        this.subject = undefined
        this.snippet = undefined
        this.date = undefined
        this._threadID = undefined
        this.thread = undefined
      }

      if (this.thread) {
        this.thread_length = this.thread.length
      }
      else {
        this.thread_length = undefined
      }
  }

  get threadID(): string {
      return this._threadID
  }
  constructor(private data: Server.DataStore) {
    console.log(this.threadID)
  }

}
