import { observable, computed, autorun, intercept, action, ObservableMap } from 'mobx'
// import {toStream} from 'mobx-utils'
import {Observable, Subject, BehaviorSubject, Observer} from 'rxjs/Rx'

import * as Server from '@root/server'
import {Store} from './store'

export class StateManager {

  @observable authenticated: boolean = false;
  authenticatedObs: BehaviorSubject<boolean>;
  pulse: Subject<boolean>;

  url: string = ""; //"http://localhost:33411"
  password: string = "";

  constructor(public store: Store, public server: Server.Server) {
    this.authenticatedObs = new BehaviorSubject(this.authenticated)
    this.pulse = new Subject<boolean>()
    // Observable.from(toStream(() => this.authenticated)).subscribe(this.authenticatedObs)

    // when authenticated turns true => next pulse, refresh store and start timer after refresh is done
    // timer hits => when authenticated, next pulse, ...
    // authenticated turns false => stop timer
    // this ensures that the pulse will have 20 second pauses between refreshing, which can take a few seconds itself.
    // If refreshing takes longer (i.e. slow internet connection) the pulse will slow down.
    let timeoutHandle = null;
    let heartbeat = () => {
      if (!this.authenticated)
        return;
      this.pulse.next(true)
      console.log('PULSE')
      this.store.refresh().then( () => {
        timeoutHandle = setTimeout(heartbeat, 20000)
      }).catch( (err) => { console.log('SHOULD NOT HAPPEN _TWO_', err); return false})
    }
    autorun( () => {
      this.authenticatedObs.next(this.authenticated)
      if (this.authenticated) {
        heartbeat();
      }
      else if (timeoutHandle != null) {
        clearTimeout(timeoutHandle)
      }
    })
  }

  login(): Promise<boolean> {
    this.server.url=this.url
    this.server.password=this.password
    return this.server.login().then( res => {
      this.authenticated = res;
      return res;
    }).catch( (err) => { console.log('SHOULD NOT HAPPEN _ONE_', err); return false})
  }

}
