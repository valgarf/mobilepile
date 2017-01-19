
import {Observable, BehaviorSubject} from 'rxjs/Rx'
import 'rxjs/Rx'
import {Injectable} from '@angular/core'
import {Http, Headers, RequestOptions, URLSearchParams} from "@angular/http"



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

  private _errorMessage : BehaviorSubject<string> = new BehaviorSubject('')
  get errorMessage(): string {return this._errorMessage.getValue()}
  set errorMessage(value: string) {this._errorMessage.next(value)}
  get errorMessageObs(): Observable<string> {return this._errorMessage}

  constructor(private http: Http) {
    Lib.bindMethods(this)
  }

  login(pass : string) {
    let self = this
    let body = new URLSearchParams();
    body.set('pass', pass);
    this.http.post(this.url+this.api+'/auth/login/', body, this.plainRequest)
        .map(res => {
          try {
            res = res.json() // if that works, login failed -> display message as failure
          }
          catch (SyntaxError) {
            return res
          }
          throw res
        })
        .toPromise()
        .then((data) => {
          self.errorMessage = ''
          self.authenticated = true
        })
        .catch((err) => {
          if (! err) {
            self.errorMessage = 'Unknown connection error'
          }
          else if (err.ok == false) {
            self.errorMessage = err.statusText + ' (' + err.status + ')'
          }
          else {
            self.errorMessage = err.message
          }
          self.authenticated = false
        })
        // .catch( (err) => {
          // console.log('LOGGED ERROR:',err)
          // if (err.status == 401) { //wrong password
          //   // throw err
          // }
          // else { // could not connect
          //   // throw err
          // }
        // })
//successfull login returns result with {status: 200, statusText: 'OK', ok: true}

  }




}
