import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {observable, computed} from 'mobx'

import {Store, Thread, Message} from '@root/store'


/**
 * Shows information on a mail like sender, subject and start of the text. It is a list item and should be used inside of <ion-list>
 */
@Component({
  selector: 'mail-info',
  templateUrl: 'mail_info.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MailInfoComponent {
  @Output() open: EventEmitter<any> = new EventEmitter<any>(); //emitted when this Component is clicked, results in opening the mail, events are bubbled up to the page
  @Input() showThreadInfo: boolean = true; // wether or not this component represents a whole thread (using the latest mail) or just a single mail

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

  /**
   * to save space only relevant parts of the datetime are shown, that is: the time if it is today, otherwise just the day and month, as well as the year if it differs.
   */
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

  /**
   * Get the color corresponding to the mailbox this message belongs to  
   */
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
