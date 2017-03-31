
import {Observable, BehaviorSubject} from 'rxjs/Rx'
import {Injectable} from '@angular/core'
import {Http, Response, Headers, RequestOptions, URLSearchParams} from '@angular/http'
import {MessageHandler} from '@root/components'

import {observable} from 'mobx'
import {toStream} from 'mobx-utils'

import * as ServerInterfaces from './interfaces'
import * as Lib from '@root/lib'
import {DataStore} from './data'

@Injectable()
export class Server {
  url: string = ""; //"http://localhost:33411"
  password: string = "";
  api : string = "/api/0"

  jsonRequest: RequestOptions = new RequestOptions({ headers: new Headers({'Content-Type': 'application/json'}), withCredentials: true });
  plainRequest: RequestOptions = new RequestOptions({ withCredentials: true });

  private _pulse: Observable<boolean>
  private _lastPoll: number

  // private _authenticated : BehaviorSubject<boolean> = new BehaviorSubject(false)
  // get authenticated(): boolean {return this._authenticated.getValue()}
  // set authenticated(value: boolean) {this._authenticated.next(value)}
  // get authenticatedObs(): Observable<boolean> {return this._authenticated.distinctUntilChanged()}
  @observable authenticated: boolean = false;
  authenticatedObs: BehaviorSubject<boolean>;
  constructor(private http: Http, private msg: MessageHandler, public data: DataStore) {
    Lib.bindMethods(this)
    let self = this
    this.authenticatedObs = new BehaviorSubject(false);
    Observable.from(toStream(() => self.authenticated)).subscribe(this.authenticatedObs)

    let clock = Observable.timer(0, 20000).share() // hot observable
    let evtstream = Observable.combineLatest([clock, this.authenticatedObs], (i,v) => v); // hot observable
    let buffer = new BehaviorSubject(false) // make a cold observable out of a hot one
    evtstream.subscribe(buffer)
    this._pulse = buffer.filter( v => v)
    this._lastPoll = Date.now()/1000
    // this.poll()
  }

  login(): Promise<any> {
    let self = this
    let body = new URLSearchParams();
    body.set('pass', this.password);
    let promise = this.http.post(this.url+this.api+'/auth/login/', body, this.plainRequest)
      .catch( (err) => {
        return Observable.throw(new Lib.ConnectionError(err.toString()));
      })
      .map(res => {
        var decoded: ServerInterfaces.IServerResponse
        try {
          decoded = res.json()
          if (decoded.status == 'error') {
            throw new Lib.AuthenticationError(decoded.message)
          }
        }
        catch (SyntaxError) {} // Syntax error means we got back HTML instead of JSON -> login worked
        self.authenticated = true
        // --- test for correctly working pulse
        // Observable.timer(10000).subscribe( () => {
        //   console.log('subscribing')
        //   self._pulse.subscribe(() => {
        //     console.log("subscription called")
        //   })
        // })
        return res;
      })
      .catch( (err) => {
        self.authenticated = false;
        this.msg.displayError(err)
        return Observable.of({})
      })
      .toPromise()

    return promise;
  }

  poll() {
    let self = this
    let observable = Observable.interval(500) // check every 500ms if last poll finished
        .filter((evt) => self.authenticated) // block polling if we are not authenticated
        .map((r) => {console.log('poll'); return r;}) //DEBUG write to console to show that we are still alive
        // .exhaustMap(() => {return this.http.get(this.url+this.api+'/eventlog/',  new RequestOptions({ withCredentials: true, search: body}))}) // exhaustMap: only poll if previous poll finished
        .exhaustMap(() => {
          let body = new URLSearchParams();
          body.set('wait', '30');
          body.set('since', self._lastPoll.toString());
          // console.log('Poll events')
          return this.http.get(this.url+'/logs/events/as.json',  new RequestOptions({ withCredentials: true, search: body}))
        }) // exhaustMap: only poll if previous poll finished
        .let(self._handleConnectionError)
        .map( (res) => res.json())
        .do( (res) => {
          let events = res.result.events
          let last = events[events.length - 1]
          let date = new Date(last.date)
          this._lastPoll = date.valueOf()/1000
        }).take(5)
        .subscribe(Lib.logfunc)
  }

  _handleConnectionError(obs: Observable<Response>): Observable<Response> {
    let self = this
    return obs.catch( (err, obs) => {
      // console.log('CONNECTION ERROR:', err)
      if (err.status == 0 || err.status == 403) {
        self.authenticated = false;
        return obs;
      }
      return Observable.throw(new Lib.ConnectionError(err.toString()));
    })
    // .retryWhen( errors => self._pulse)
    // .retryWhen( errors => return errors.delay(1500))
  }

  _handleSearch(obs: Observable<Response>): Observable<ServerInterfaces.IResultSearch> {
    let self = this
    return obs.let(this._handleConnectionError)
    .map(res => <ServerInterfaces.IServerResponse>res.json())
    .map(res => <ServerInterfaces.IResultSearch>(res.result))
    .do(res => {
      self.data.updateData(res.data)
      // console.log('Query result:',res)
    })
  }

  search(query: string = 'in:Inbox', order: string = 'rev-freshness', start:number = 0, end:number = 20): Observable<ServerInterfaces.IResultSearch> {
    let self = this
    let body = new URLSearchParams();
    body.set('q', query);
    body.set('order', order);
    body.set('start', start.toString());
    body.set('end', end.toString());
    return this._pulse.exhaustMap( (evt) => this.http.get(this.url+this.api+'/search/', new RequestOptions({ withCredentials: true, search: body})))
      .let(this._handleSearch)
      // .do((data) => Lib.logfunc('search results:',data) )
  }

  tags(): Observable<ServerInterfaces.IResultTags> {
    let self = this;
    let result = this._pulse.exhaustMap( (evt) => this.http.get(this.url+this.api+'/tags/', new RequestOptions({ withCredentials: true})))
      .let(self._handleConnectionError)
      .map(res => <ServerInterfaces.IServerResponse>res.json())
      .map(res => <ServerInterfaces.IResultTags>(res.result))
      .distinctUntilChanged()
      .do(res => {
        let tagData: ServerInterfaces.IData = {
          addresses: {},
          messages: {},
          metadata: {},
          tags: {},
          threads: {}
        }
        for (let tag of res.tags) {
          tagData.tags[tag.tid] = tag
        }
        this.data.updateData(tagData)
      })
    // result.subscribe((data) => Lib.logfunc('tag data:',data) )
    return result
//       .map(res => <ServerInterfaces.IResultSearch>(res.result))
//       .do(res => {
//         this.data.updateData(res.data)
        // console.log('Query result:',res)
//       })
  }

  getMessage(mid: string): Promise<ServerInterfaces.IResultSearch>{
    var self = this
    let body = new URLSearchParams();
    body.set('mid', mid);
    return this.http.get(this.url+this.api+'/message/', new RequestOptions({ withCredentials: true, search: body}))
      .let(this._handleSearch)
      .toPromise()
  }
}
