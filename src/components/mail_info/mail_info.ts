import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {observable, computed} from 'mobx'

import {Store, Thread, Message} from '@root/store'

@Component({
  selector: 'mail-info',
  templateUrl: 'mail_info.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MailInfoComponent {
  @Output() open: EventEmitter<any> = new EventEmitter<any>();
  @Input() showThreadInfo: boolean = true;

  @observable private _threadID: string = "";
  @observable private _messageID: string = "";
  get threadID(): string {
    return this._threadID
  }
  @Input() set threadID(value: string) {
    this._threadID = value
    if (this.thread != null)
      this._messageID = this.thread.entries[0].messageID
  }
  get messageID(): string {
    return this._messageID
  }
  @Input() set messageID(value: string) {
    this._messageID = value
    if (this.message != null) {
      this._threadID = this.message.threadID
    }
  }
  @computed get thread(): Thread {
    return this.store.threads.getByID(this.threadID)
  }
  @computed get message(): Message {
    return this.store.messages.getByID(this.messageID)
  }
  @computed get thread_length(): number {
    if (this.thread != null)
      return this.thread.entries.length
    return null
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
    if (this.message == null) {
      return 'black'
    }
    for (let tag of this.message.tags) {
      if (tag != null && tag.is_mailbox && tag.is_root) {
        return tag.label_color
      }
    }
    return 'black'
  }

  // private _handle
  constructor(private store: Store) {
    // this._handle = autorun( () )
  }

  public ionViewWillUnload() {
    // this._handle()
  }
}
