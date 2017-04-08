
import {Injectable} from '@angular/core'
import {Http, Response, Headers, RequestOptions, URLSearchParams} from '@angular/http'
import {Observable} from 'rxjs/Rx'

import * as Lib from '@root/lib'
import {MailpileInterfaces} from './interfaces'

@Injectable()
export class Server {
  url: string = ""; //"http://localhost:33411"
  password: string = "";
  api: string = "/api/0"

  jsonRequest: RequestOptions = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' }), withCredentials: true });
  plainRequest: RequestOptions = new RequestOptions({ withCredentials: true });

  private _lastPoll: number

  constructor(private http: Http) { //}, private msg: MessageHandler) {
    Lib.bindMethods(this)

    this._lastPoll = Date.now() / 1000
    // this.poll()
  }

  private async _requestErrorHandling(req: Observable<Response>): Promise<any> {
    try {
      let reply = await req.toPromise();
      return reply.json()
    }
    catch (err) {
      if (err instanceof Error) {
        Lib.error.attachTags(err, ['connection'])
      }
      else {
        err = new Lib.ConnectionError(err.toString(), err)
      }
      throw err
    }
  }

  private async _request(url: string, body: RequestOptions | URLSearchParams = null): Promise<MailpileInterfaces.IServerResponse> {
    if (body == null) {
      body = new RequestOptions({ withCredentials: true })
    }
    else if (body instanceof URLSearchParams) {
      body = new RequestOptions({ withCredentials: true, search: body })
    }
    return await this._requestErrorHandling(this.http.get(this.url + this.api + `/${url}/`, body))
  }

  async login(): Promise<boolean> {
    let body = new URLSearchParams();
    body.set('pass', this.password);
    try {
      var decoded: MailpileInterfaces.IServerResponse = await this._requestErrorHandling(this.http.post(this.url + this.api + '/auth/login/', body, this.plainRequest))
      if (decoded.status == 'error') {
        throw new Lib.AuthenticationError(decoded.message, decoded)
      }
    }
    catch (e) {
      if (!(e instanceof SyntaxError)) throw e;
    } // Syntax error means we got back HTML instead of JSON -> login worked
    Lib.log.info(['login', 'authentication', 'success'], `Successful login to ${this.url}`)
    return true;
  }

  poll() {
    let self = this
    let observable = Observable.interval(500) // check every 500ms if last poll finished
      // .filter((evt) => self.authenticated) // IMPORTANT block polling if we are not authenticated
      .map((r) => { console.log('poll'); return r; }) //DEBUG write to console to show that we are still alive
      // .exhaustMap(() => {return this.http.get(this.url+this.api+'/eventlog/',  new RequestOptions({ withCredentials: true, search: body}))}) // exhaustMap: only poll if previous poll finished
      .exhaustMap(() => {
        let body = new URLSearchParams();
        body.set('wait', '30');
        body.set('since', self._lastPoll.toString());
        // console.log('Poll events')
        return this.http.get(this.url + '/logs/events/as.json', new RequestOptions({ withCredentials: true, search: body }))
      }) // exhaustMap: only poll if previous poll finished
      // .let(self._handleConnectionError) // IMPORTANT
      .map((res) => res.json())
      .do((res) => {
        let events = res.result.events
        let last = events[events.length - 1]
        let date = new Date(last.date)
        this._lastPoll = date.valueOf() / 1000
      }).take(5)
      .subscribe(Lib.logfunc)
    return observable
  }

  async searchOnce(query: string = 'in:Inbox', order: string = 'rev-freshness', start: number = 0, end: number = 20): Promise<MailpileInterfaces.IResultSearch> {
    let body = new URLSearchParams();
    body.set('q', query);
    body.set('order', order);
    body.set('start', start.toString());
    body.set('end', end.toString());
    let reply = await this._request('search', body)
    return <MailpileInterfaces.IResultSearch>reply.result
  }

  async tagsOnce(): Promise<MailpileInterfaces.IResultTags> {
    let reply = await this._request('tags')
    return <MailpileInterfaces.IResultTags>(reply.result)
  }

  async getMessage(mid: string): Promise<MailpileInterfaces.IResultSearch> {
    let body = new URLSearchParams();
    body.set('mid', mid);
    let reply = await this._request('message', body)
    return <MailpileInterfaces.IResultSearch>reply.result
  }
}
