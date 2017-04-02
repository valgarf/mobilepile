import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {NavController, ToastController} from 'ionic-angular';
import {Observable, BehaviorSubject} from 'rxjs/Rx'
import {observable, computed} from 'mobx'

import {dateFormat} from 'dateformat'
import * as Server from '@root/server'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'
import { Store, Thread, Message, Tag } from '@root/store'

@Component({
  selector: 'mail-info',
  templateUrl: 'mail_info.html',
  changeDetection:  ChangeDetectionStrategy.OnPush
})
export class MailInfoComponent {
  @Output() open: EventEmitter<any> = new EventEmitter<any>();

  @observable private _threadID: string;
  @observable private _messageID: string;
  get threadID(): string {
    return this._threadID
  }
  @Input() set threadID( value: string ) {
    this._threadID = value
    this._messageID = this.thread.entries[0].messageID
  }
  get messageID(): string {
    return this._messageID
  }
  @Input() set messageID( value: string ) {
    this._messageID = value
    this._threadID = this.message.threadID
  }
  @computed get thread(): Thread {
    return this.store.threads.getByID(this.threadID)
  }
  @computed get message(): Message {
    return this.store.messages.getByID(this.messageID)
  }
  @computed get thread_length(): number {
    return this.thread.entries.length
  }

  @computed get dateFormatString(): string {
    if (this.message == null) {
      return "dd.MM.yyyy";
    }
    let now = new Date(Date.now())
    let date = this.message.timestamp
    if (now.getFullYear() != date.getFullYear()) {
      return "dd.MM.yyyy";
    }
    if (now.getMonth() != date.getMonth() || now.getDate() != date.getDate()) {
      return "dd. MMM";
    }
    return "H:mm";
  }

  @computed get color(): string {
    for (let tag of this.message.tags) {
      if (tag != null && tag.is_mailbox && tag.is_root) {
        return tag.label_color
      }
    }
    return null
  }

  constructor(private store: Store) {

  }

}
