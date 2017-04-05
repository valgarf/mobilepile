
import {Observable, BehaviorSubject} from 'rxjs/Rx'
import {Injectable} from '@angular/core'
import {Http, Response, Headers, RequestOptions, URLSearchParams} from '@angular/http'
import {MessageHandler} from '@root/components'

import {observable} from 'mobx'
import {toStream} from 'mobx-utils'

import * as ServerInterfaces from './interfaces'
import * as Lib from '@root/lib'

@Injectable()
export class Server {
  url: string = ""; //"http://localhost:33411"
  password: string = "";
  api : string = "/api/0"

  jsonRequest: RequestOptions = new RequestOptions({ headers: new Headers({'Content-Type': 'application/json'}), withCredentials: true });
  plainRequest: RequestOptions = new RequestOptions({ withCredentials: true });

  private _lastPoll: number

  constructor(private http: Http) { //}, private msg: MessageHandler) {
    Lib.bindMethods(this)
    let self = this

    this._lastPoll = Date.now()/1000
    // this.poll()
  }

  async login(): Promise<boolean> {
    let self = this
    let body = new URLSearchParams();
    body.set('pass', this.password);
    let reply = await this.http.post(this.url+this.api+'/auth/login/', body, this.plainRequest).toPromise()
    var decoded: ServerInterfaces.IServerResponse
    try {
      decoded = reply.json()
      if (decoded.status == 'error') {
        throw new Lib.AuthenticationError(decoded.message)
      }
    }
    catch (SyntaxError) {} // Syntax error means we got back HTML instead of JSON -> login worked
    Lib.log.info(['login', 'authentication', 'success'], `Successful login to ${this.url}`)
    return true;
  }

  poll() {
    let self = this
    let observable = Observable.interval(500) // check every 500ms if last poll finished
        // .filter((evt) => self.authenticated) // IMPORTANT block polling if we are not authenticated
        .map((r) => {console.log('poll'); return r;}) //DEBUG write to console to show that we are still alive
        // .exhaustMap(() => {return this.http.get(this.url+this.api+'/eventlog/',  new RequestOptions({ withCredentials: true, search: body}))}) // exhaustMap: only poll if previous poll finished
        .exhaustMap(() => {
          let body = new URLSearchParams();
          body.set('wait', '30');
          body.set('since', self._lastPoll.toString());
          // console.log('Poll events')
          return this.http.get(this.url+'/logs/events/as.json',  new RequestOptions({ withCredentials: true, search: body}))
        }) // exhaustMap: only poll if previous poll finished
        // .let(self._handleConnectionError) // IMPORTANT
        .map( (res) => res.json())
        .do( (res) => {
          let events = res.result.events
          let last = events[events.length - 1]
          let date = new Date(last.date)
          this._lastPoll = date.valueOf()/1000
        }).take(5)
        .subscribe(Lib.logfunc)
  }

  async searchOnce(query: string = 'in:Inbox', order: string = 'rev-freshness', start:number = 0, end:number = 20): Promise<ServerInterfaces.IResultSearch> {
    let self = this
    let body = new URLSearchParams();
    body.set('q', query);
    body.set('order', order);
    body.set('start', start.toString());
    body.set('end', end.toString());
    let reply = await this.http.get(this.url+this.api+'/search/', new RequestOptions({ withCredentials: true, search: body})).toPromise()
    let replyJson = <ServerInterfaces.IServerResponse>reply.json()
    return <ServerInterfaces.IResultSearch>replyJson.result
  }

  async tagsOnce(): Promise<ServerInterfaces.IResultTags> {
    let self = this;
    let reply = await this.http.get(this.url+this.api+'/tags/', new RequestOptions({ withCredentials: true})).toPromise()
    let replyJson = <ServerInterfaces.IServerResponse>reply.json();
    return <ServerInterfaces.IResultTags>(replyJson.result)
  }

  async getMessage(mid: string): Promise<ServerInterfaces.IResultSearch>{
    var self = this
    let body = new URLSearchParams();
    body.set('mid', mid);
    let reply = await this.http.get(this.url+this.api+'/message/', new RequestOptions({ withCredentials: true, search: body})).toPromise()
    let replyJson = <ServerInterfaces.IServerResponse>reply.json()
    return <ServerInterfaces.IResultSearch>replyJson.result
  }
}
