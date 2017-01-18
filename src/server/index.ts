
import {Observable, BehaviorSubject} from 'rxjs/Rx'
import 'rxjs/Rx'
import {Injectable} from '@angular/core'
import {Http, Headers, RequestOptions, URLSearchParams} from "@angular/http"



import * as Lib from '../lib'

@Injectable()
export class Server {
  // url : BehaviorSubject<string> = new BehaviorSubject('localhost:33411')
  // authenticated : BehaviorSubject<boolean> = new BehaviorSubject(false)
  url : string = "http://localhost:33411/"
  authenticated : boolean = false
  api : string = "/api/0"
  // password : string = 'password'
  jsonRequest: RequestOptions = new RequestOptions({ headers: new Headers({'Content-Type': 'application/json'}), withCredentials: true });
  plainRequest: RequestOptions = new RequestOptions({ withCredentials: false });

  constructor(private http: Http) {
    Lib.bindMethods(this)
  }

  login(pass : string): Observable<any> {
    // this.password = pass
    let self = this
    let body = new URLSearchParams();
    body.set('pass', pass);
    console.log(JSON.stringify(body));
    return this.http.post(this.url+this.api+'/auth/login/', body, this.plainRequest)
        .map(res => {
          try {
            res = res.json() // if that works, login failed -> display message as failure
          }
          catch (SyntaxError) {
            self.authenticated = true
            return res
          }
          self.authenticated = false
          throw res
        })
        .catch( (err) => {
          console.log('LOGGED ERROR:',err)
          if (err.status == 401) { //wrong password
            throw err
          }
          else { // could not connect
            throw err
          }
        })
//successfull login returns result with {status: 200, statusText: 'OK', ok: true}

  }




}
