import { observable, computed, autorun, intercept, action, ObservableMap } from 'mobx'
// import {toStream} from 'mobx-utils'
import {Observable, Subject, BehaviorSubject, Observer} from 'rxjs/Rx'

import * as Server from '@root/server'
import * as Lib from '@root/lib'
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
    let heartbeat = async () => {
      if (!this.authenticated) {
        return;
      }
      try {
        Lib.log.debug(['pulse'],'PULSE')
        this.pulse.next(true)
        await this.store.refresh()
        timeoutHandle = setTimeout(heartbeat, 20000)
      }
      catch(err) {
        this.authenticated=false;
        Lib.log.error(['unexpected', 'pulse'], err);
      }
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

  async login(): Promise<boolean> {
    this.server.url=this.url
    this.server.password=this.password
    try {
      let result = await this.server.login()
      await Lib.delay(500)
      this.authenticated = result;
      return result;
    }
    catch (err) {
      this.authenticated = false;
      Lib.log.error(['login', 'authentication', 'unexpected'], err);
      return false
    }
  }

  private _handleError ( err: any ) {

  }

  handleErrors( errors: any[] ) {

  }

  //
  // _handleConnectionError(obs: Observable<Response>): Observable<Response> {
  //   let self = this
  //   return obs.catch( (err, obs) => {
  //     // console.log('CONNECTION ERROR:', err)
  //     if (err.status == 0 || err.status == 403) {
  //       // self.authenticated = false;
  //       return obs;
  //     }
  //     return Observable.throw(new Lib.ConnectionError(err.toString()));
  //   })
  //   // .retryWhen( errors => self._pulse)
  //   // .retryWhen( errors => return errors.delay(1500))
  // }
  //

}
