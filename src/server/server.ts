
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

  private _authenticated : BehaviorSubject<boolean> = new BehaviorSubject(false)
  get authenticated(): boolean {return this._authenticated.getValue()}
  set authenticated(value: boolean) {this._authenticated.next(value)}
  get authenticatedObs(): Observable<boolean> {return this._authenticated.distinct()}

  constructor(private http: Http, private msg: MessageHandler, public data: DataStore) {
    Lib.bindMethods(this)
    this._pulse = Observable.defer(this.createPulse)
  }

  private createPulse(): Observable<boolean> {
    return Observable.combineLatest([Observable.timer(0,5*60*1000), this.authenticatedObs], (i,v) => v).filter( v => v);
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

  search(query: string = 'in:Inbox', order: string = 'rev-freshness'): Observable<ServerInterfaces.IResultSearch> {
    let self = this
    let body = new URLSearchParams();
    body.set('q', query);
    body.set('order', order);
    return this._pulse.map( (evt) => this.http.get(this.url+this.api+'/search/', new RequestOptions({ withCredentials: true, search: body}))).exhaust()
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
        console.log('Query result:',res)
      })
  }
}
