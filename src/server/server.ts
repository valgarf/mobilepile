
import {Observable, BehaviorSubject} from 'rxjs/Rx'
import 'rxjs/Rx'
import {Injectable} from '@angular/core'
import {Http, Headers, RequestOptions, URLSearchParams} from '@angular/http'
import {MessageHandler} from '@root/components'

import * as ServerInterfaces from './interfaces'
import * as Lib from '@root/lib'

@Injectable()
export class Server {
  // url : BehaviorSubject<string> = new BehaviorSubject('localhost:33411')
  // authenticated : BehaviorSubject<boolean> = new BehaviorSubject(false)
  url : string = "http://localhost:33411/"

  api : string = "/api/0"

  jsonRequest: RequestOptions = new RequestOptions({ headers: new Headers({'Content-Type': 'application/json'}), withCredentials: true });
  plainRequest: RequestOptions = new RequestOptions({ withCredentials: false });

  private _authenticated : BehaviorSubject<boolean> = new BehaviorSubject(false)
  get authenticated(): boolean {return this._authenticated.getValue()}
  set authenticated(value: boolean) {this._authenticated.next(value)}
  get authenticatedObs(): Observable<boolean> {return this._authenticated.distinct()}

  constructor(private http: Http, private msg: MessageHandler) {
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
        var decoded: ServerInterfaces.ServerResponse
        try {
          decoded = res.json() // if that works, login failed -> display message as failure
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
}
