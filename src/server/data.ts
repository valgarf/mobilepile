
import {Observable, BehaviorSubject} from 'rxjs/Rx'
import {Injectable} from '@angular/core'
// import {Http, Headers, RequestOptions, URLSearchParams} from '@angular/http'
// import {MessageHandler} from '@root/components'

import * as ServerInterfaces from './interfaces'
import * as Lib from '@root/lib'

@Injectable()
export class DataStore {
  _data: ServerInterfaces.IData = {
    addresses: {},
    messages: {},
    metadata: {},
    tags: {},
    threads: {}
  }

  updateData(newData: ServerInterfaces.IData) {
    for (let key in this._data) {
     if (this._data.hasOwnProperty(key) && newData.hasOwnProperty(key)) {
       let cur = this._data[key]
       let upd = newData[key]
       for (let prop in newData[key]) {
         cur[prop] = upd[prop]
       }
     }
   }
 }


}
