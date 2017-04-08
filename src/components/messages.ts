import {Injectable} from '@angular/core'
import {ToastController, AlertController} from 'ionic-angular'

import * as Lib from '@root/lib'
import {Store, UIMessage, UIMessageType} from '@root/store'

@Injectable()
export class MessageHandler {
  // private _toastHidden: BehaviorSubject<boolean> = new BehaviorSubject(true)
  // private _queue: Subject<any> =  new Subject<any>()
  private _toast: any = null
  constructor(public toastCtrl: ToastController, public alertCtrl: AlertController, public store: Store) {
    Lib.bindMethods(this)
    this.store.state.messageObs.subscribe(this.showUIMessage)
    // this._queue.pausableBuffered(this._toastHidden)
  }

  showUIMessage(msg: UIMessage) {
    let cssClass = "toast-" + UIMessageType[msg.type]
    if (this._toast) {
      this._toast.dismiss()
    }
    this._toast = this.toastCtrl.create({
      message: msg.toString(),
      duration: 8000,
      showCloseButton: true,
      closeButtonText: 'Ok',
      cssClass: cssClass,
    })
    this._toast.onDidDismiss(() => {
      this._toast = null;
    })
    this._toast.present()
  }
}
