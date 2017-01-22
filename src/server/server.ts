
import {Observable, BehaviorSubject} from 'rxjs/Rx'
import {Injectable} from '@angular/core'
import {Http, Headers, RequestOptions, URLSearchParams} from '@angular/http'
import {MessageHandler} from '@root/components'

import * as ServerInterfaces from './interfaces'
import * as Lib from '@root/lib'
import {DataStore} from './data'

@Injectable()
export class Server {
  // url : BehaviorSubject<string> = new BehaviorSubject('localhost:33411')
  // authenticated : BehaviorSubject<boolean> = new BehaviorSubject(false)
  url : string = "http://localhost:33411/"

  api : string = "/api/0"

  jsonRequest: RequestOptions = new RequestOptions({ headers: new Headers({'Content-Type': 'application/json'}), withCredentials: true });
  plainRequest: RequestOptions = new RequestOptions({ withCredentials: true });

  private _authenticated : BehaviorSubject<boolean> = new BehaviorSubject(false)
  get authenticated(): boolean {return this._authenticated.getValue()}
  set authenticated(value: boolean) {this._authenticated.next(value)}
  get authenticatedObs(): Observable<boolean> {return this._authenticated.distinct()}

  constructor(private http: Http, private msg: MessageHandler, public data: DataStore) {
    Lib.bindMethods(this)
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
        }
        catch (SyntaxError) {
          return res
        }
        if (decoded.status == 'error') {
          // console.log(decoded)
          throw new Lib.AuthenticationError(decoded.message)
        }
        return res;
      })
      .toPromise()


    promise.then((data) => {
        self.authenticated = true
      })
      .catch((err) => {
        self.authenticated = false
      })

    return promise;
  }

  search(query: string = 'in:Inbox', order: string = 'rev-freshness'): Observable<ServerInterfaces.IResultSearch> {
    let self = this
    let body = new URLSearchParams();
    body.set('q', query);
    body.set('order', order);
    console.log('query')
    return this.http.get(this.url+this.api+'/search/', new RequestOptions({ withCredentials: true, search: body}))
      .catch( (err) => {
        console.log('CONNECTION ERROR:', err)
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
