import {action, runInAction, computed, autorun} from 'mobx'
import {Subject, BehaviorSubject} from 'rxjs/Rx'

import * as Lib from '@root/lib'
import {Server} from '@root/server'
import {Store} from './store'


/**
 * This handles internal state of the App and also works as a controller.
 *  - refreshes the store in regular intervals, emits a 'pulse' observable.
 *  - handles errors
 *  - handles login
 *  - handles UIMessages (typically errors that are shown in the UI, like "wrong password")
 */
export class StateManager {

  @computed get authenticated(): boolean {
    return this.server.authenticated
  }
  set authenticated(value: boolean) {
    this.server.authenticated = value
  }

  authenticatedObs: BehaviorSubject<boolean>;
  pulse: Subject<boolean>;

  url: string = ""; //"http://localhost:33411"
  password: string = "";

  messageObs: Subject<UIMessage>;

  constructor(public store: Store, public server: Server) {
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
      if (!this.authenticated) { // no connection to the server, no hearbeat (we died :( )
        return;
      }
      try { // refresh the store and call this function again in some time
        Lib.log.debug(['pulse'], 'PULSE')
        this.pulse.next(true) // emit observable pulse
        await this.store.refresh()
        timeoutHandle = setTimeout(heartbeat, 20000)
      }
      catch (err) { // refreshing did not work as expected, check if we are still connected
        err = Lib.error.ensureErrorObject(err)
        if (err instanceof Lib.ConnectionError || err instanceof Lib.AuthenticationError || (err.tags != null && err.tags.includes("connection"))) {
          // too bad connection or authentication seems to be lost
          runInAction(() => { this.authenticated = false })
        }
        Lib.error.attachTags(err, ['pulse'])
        this.handleError(err)
        if (this.authenticated) { //some not connection related error appeared, retry after a shorter time (beat faster!)
          timeoutHandle = setTimeout(heartbeat, 5000)
        }
      }
    }
    autorun(() => { //automatically run if this.authenticated changes
      this.authenticatedObs.next(this.authenticated)
      if (this.authenticated) {
        heartbeat();
      }
      else if (timeoutHandle != null) { //not authenticated anymore, stop the heartbeat
        clearTimeout(timeoutHandle)
      }
    })
  }

  @action async login(): Promise<boolean> {
    this.server.url = this.url
    this.server.password = this.password
    try {
      let result = await this.server.login()
      if (this.authenticated == false && result == true) {
        await Lib.delay(1000) // otherwise the following requests will fail, the server takes a while
      }
      runInAction(() => { this.authenticated = result })
      return result;
    }
    catch (err) {
      runInAction(() => { this.authenticated = false })
      Lib.error.attachTags(err, ['login', 'authentication'])
      throw err
    }
  }

  /**
   * handles errors, typically by logging or showing them to the user or both.
   *
   * @param  {any} error: the error object
   */
  handleError(error: any) {
    let tags = []
    if (error.tags != null) {
      tags = error.tags
    }

    if (error.log == null || error.log == true) {
      if (error.details != null) {
        Lib.log.error(tags, error.toString(), error.details, error)
      }
      else {
        Lib.log.error(tags, error.toString(), error)
      }
    }

    if (error.show == null || error.show == true) {
      if (error instanceof Error) {
        let msg = UIMessage.fromError(error)
        this.messageObs.next(msg)
      }
      else if (error.log == null || error.log == true) {
        Lib.log.warn(['follow-up'], 'Not an Error object, not showing a UI message')
      }
    }
  }
}


export enum UIMessageType { info, warning, error }
export class UIMessage {
  readonly details: any[]
  constructor(readonly type: UIMessageType = UIMessageType.error, readonly title: string = "", readonly description: string = "", ...details: any[]) {
    this.details = details
  }

  static info(title: string, description: string, ...details: any[]): UIMessage {
    return new UIMessage(UIMessageType.info, title, description, ...details)
  }

  static warning(title: string, description: string, ...details: any[]): UIMessage {
    return new UIMessage(UIMessageType.warning, title, description, ...details)
  }

  static error(title: string, description: string, ...details: any[]): UIMessage {
    return new UIMessage(UIMessageType.error, title, description, ...details)
  }

  static fromError(err: Error) {
    let name = err.name
    if (name == null) {
      name = err.constructor.name
    }
    let msg = err.message
    let details = (err as any).details
    // TODO put stacktrace into details?
    if (details != null) {
      return UIMessage.error(name, msg, details)
    }
    else {
      return UIMessage.error(name, msg)
    }
  }

  toString(): string {
    return this.title + ': ' + this.description
  }
}
