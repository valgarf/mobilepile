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

  messageObs: Subject<UIMessage>;

  constructor(public store: Store, public server: Server.Server) {
    Lib.bindMethods(this)
    this.authenticatedObs = new BehaviorSubject(this.authenticated)
    this.messageObs = new Subject()
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
        err = Lib.error.ensureErrorObject(err)
        if (err instanceof Lib.ConnectionError || err instanceof Lib.AuthenticationError) {
          this.authenticated=false;
        }
        Lib.error.attachTags(err, ['pulse'])
        this.handleError(err)
        if (this.authenticated) {
          timeoutHandle = setTimeout(heartbeat, 5000) //retry refresh after a short time
        }
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
      if (this.authenticated == false && result == true) {
        await Lib.delay(1000) // otherwise the following requests will fail, the server takes a while
      }
      this.authenticated = result;
      return result;
    }
    catch (err) {
      this.authenticated = false;
      Lib.error.attachTags(err, ['login', 'authentication'])
      throw err
    }
  }

  handleError( error: any ) {
    let tags = []
    if (error.tags != null) {
      tags = error.tags
    }
    if (error.details != null) {
      Lib.log.error(tags, error.toString(), error.details, error)
    }
    else {
      Lib.log.error(tags, error.toString(), error)
    }

    if (error instanceof Error) {
      let msg = UIMessage.fromError(error)
      console.log(msg)
      this.messageObs.next(msg)
    }
  }
}

export enum UIMessageType { info, warning, error}
export class UIMessage {
  readonly details: any[]
  constructor(readonly type: UIMessageType=UIMessageType.error, readonly title: string="", readonly description: string="",  ...details: any[]) {
    this.details = details
  }

  static info(title: string, description: string, ...details:any[]): UIMessage {
    return new UIMessage(UIMessageType.info, title, description, ...details)
  }

  static warning(title: string, description: string, ...details:any[]): UIMessage {
    return new UIMessage(UIMessageType.warning, title, description, ...details)
  }

  static error(title: string, description: string, ...details:any[]): UIMessage {
    return new UIMessage(UIMessageType.error, title, description, ...details)
  }

  static fromError(err: Error) {
    let name = err.name
    if (name == null) {
      name = err.constructor.name
    }
    let msg = err.message
    // put stacktrace into details?
    // let details = err.details
    // if (details == null)
    // {
      // details = []
    // }
    return UIMessage.error(name, msg)
  }

  toString(): string {
    return this.title+': '+this.description
  }
}
