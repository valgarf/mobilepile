
import {Observable, BehaviorSubject} from 'rxjs/Rx'
import {Injectable} from '@angular/core'
import {Http, Headers, RequestOptions, URLSearchParams} from '@angular/http'
import {MessageHandler} from '@root/components'

import * as ServerInterfaces from './interfaces'
import * as Lib from '@root/lib'
import {DataStore} from './data'

@Injectable()
export class Server {
  url : string = "http://localhost:33411"
  api : string = "/api/0"

  jsonRequest: RequestOptions = new RequestOptions({ headers: new Headers({'Content-Type': 'application/json'}), withCredentials: true });
  plainRequest: RequestOptions = new RequestOptions({ withCredentials: true });

  private _pulse: Observable<boolean>
  private _lastPoll: number

  private _authenticated : BehaviorSubject<boolean> = new BehaviorSubject(false)
  get authenticated(): boolean {return this._authenticated.getValue()}
  set authenticated(value: boolean) {this._authenticated.next(value)}
  get authenticatedObs(): Observable<boolean> {return this._authenticated.distinct()}

  constructor(private http: Http, private msg: MessageHandler, public data: DataStore) {
    Lib.bindMethods(this)
    let clock = Observable.timer(0, 20000).share() // hot observable
    let evtstream = Observable.combineLatest([clock, this.authenticatedObs], (i,v) => v); // hot observable
    let buffer = new BehaviorSubject(false) // make a cold observable out of a hot one
    evtstream.subscribe(buffer)
    this._pulse = buffer.filter( v => v)
    this._lastPoll = Date.now()/1000
    this.poll()
  }

  login(pass : string): Promise<any> {
    let self = this
    let body = new URLSearchParams();
    body.set('pass', pass);
    let promise = this.http.post(this.url+this.api+'/auth/login/', body, this.plainRequest)
      .catch( (err) => {
        // console.log('CONNECTION ERROR:', err)
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
    // /api/0/eventlog/          [incomplete]/[wait]/[<count>]/[<field>=<val>/...]/
                          // ?private_data=[var:value]&source=[source class]&flag=[require a flag]&flags=[match all flags]&event_id=[an event ID]&since=[wait for new data?]&data=[var:value]&incomplete=[incomplete events only?]&wait=[seconds to wait for new data]
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
        .catch( (err, obs) => {
          console.log(err)
          return obs
        })
        .map( (res) => res.json())
        .do( (res) => {
          let events = res.result.events
          let last = events[events.length - 1]
          let date = new Date(last.date)
          this._lastPoll = date.valueOf()/1000
        }).take(5)
        .subscribe(Lib.logfunc)
  }

  search(query: string = 'in:Inbox', order: string = 'rev-freshness', start:number = 0, end:number = 20): Observable<ServerInterfaces.IResultSearch> {
    let self = this
    let body = new URLSearchParams();
    body.set('q', query);
    body.set('order', order);
    body.set('start', start.toString());
    body.set('end', end.toString());
    return this._pulse.exhaustMap( (evt) => this.http.get(this.url+this.api+'/search/', new RequestOptions({ withCredentials: true, search: body})))
      .catch( (err, obs) => {
        // console.log('CONNECTION ERROR:', err)
        if (err.status == 0 || err.status == 403) {
          self.authenticated = false;
          return obs;
        }
        return Observable.throw(new Lib.ConnectionError(err.toString()));
      })
      .map(res => <ServerInterfaces.IServerResponse>res.json())
      .map(res => <ServerInterfaces.IResultSearch>(res.result))
      .do(res => {
        this.data.updateData(res.data)
        // console.log('Query result:',res)
      })
  }
}
