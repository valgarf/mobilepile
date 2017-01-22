
import {Observable, BehaviorSubject} from 'rxjs/Rx'
import {Injectable} from '@angular/core'
// import {Http, Headers, RequestOptions, URLSearchParams} from '@angular/http'
// import {MessageHandler} from '@root/components'

import * as ServerInterfaces from './interfaces'
import * as Lib from '@root/lib'

@Injectable()
export class DataStore {
  private _data: ServerInterfaces.IData = {
    addresses: {},
    messages: {},
    metadata: {},
    tags: {},
    threads: {}
  }

  get addresses(): { [aid:string]: ServerInterfaces.IAddress } {
    return this._data.addresses;
  }

  get messages(): { [mid:string]: ServerInterfaces.IMessage } {
    return this._data.messages;
  }

  get metadata(): { [mid:string]: ServerInterfaces.IMessageMetadata } {
    return this._data.metadata;
  }

  get tags(): { [aid:string]: ServerInterfaces.ITag } {
    return this._data.tags;
  }

  get threads(): { [aid:string]: ServerInterfaces.IMessageThread } {
    return this._data.threads;
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
