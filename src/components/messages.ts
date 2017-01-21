import {Injectable} from '@angular/core'
import {ToastController, AlertController} from 'ionic-angular'
// import {Observable, BehaviorSubject, Subject} from 'rxjs/Rx'

import 'rxjs/'
import * as Lib from '@root/lib'

@Injectable()
export class MessageHandler {
  // private _toastHidden: BehaviorSubject<boolean> = new BehaviorSubject(true)
  // private _queue: Subject<any> =  new Subject<any>()
  private _toast: any = null
  constructor (public toastCtrl: ToastController, public alertCtrl: AlertController,) {
    Lib.bindMethods(this)
    // this._queue.pausableBuffered(this._toastHidden)
  }

  test() {
    console.log('Hello Handler')
  }

  displayError(err: Error) {
    console.log('Display Error:', err)
    let self = this
    if (this._toast) {
      this._toast.dismiss()
    }
    this._toast = this.toastCtrl.create({
       message: err.toString(),
       duration: 8000,
       showCloseButton: true,
       closeButtonText: 'Ok',
       cssClass: 'toast-error'
    })
    this._toast.onDidDismiss( () => {
      self._toast = null;
    })
    this._toast.present()
  }
}
