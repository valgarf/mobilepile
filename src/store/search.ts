import {observable, computed, autorun, reaction, action, ObservableMap} from 'mobx'
import * as math from 'mathjs'

import {MailpileInterfaces, Server} from '@root/server'
import {Store} from './store'
import {Thread} from './threads'
import {Message} from './messages'


export class SearchManager {
  @observable all: ObservableMap<Search> = new ObservableMap<Search>();

  constructor(public store: Store, public server: Server) {
    autorun(() => {
      console.log("MOBX ADDRESSES:", this.all.toJS())
    })
  }

  public getByID(id: string): Search {
    return this.all.get(id)
  }
  public generateID(query: string, order: string) {
    return `<${query}> <${order}>`
  }

  @action public create(query: string, order: string, amount: number = 20, offset: number = 0) {
    let id = this.generateID(query, order)
    let search = this.getByID(id)
    if (search == null) {
      search = new Search(this, query, order)
      this.all.set(id, search)
    }
    if (amount != null) {
      search.amount = amount
    }
    if (offset != null) {
      search.offset = offset
    }
    search.activate()
    return search
  }

  @action public refresh(): Promise<boolean> {
    return Promise.all(this.all.values().map(search => search.refresh())).then(res => res.every(v => v))
  }
}

export class Search {

  @computed get ID(): string {
    return this.manager.generateID(this.query, this.order)
  }
  @observable offset: number = 0;
  @observable amount: number = 20;
  readonly step: number = 30 //maximum allowed by the server
  @observable private _active: number = 0;
  @computed get active() {
    return this._active > 0
  }
  @observable messageIDs: string[] = [];
  @computed get messages(): Message[] {
    return this.messageIDs.map(id => this.manager.store.messages.getByID(id))
  }
  @computed get threads(): Thread[] {
    return this.messages.map(msg => msg != null ? msg.thread : null)
  }
  private _handle = null;

  constructor(private manager: SearchManager, readonly query: string, readonly order: string) {
    autorun(() => {
      console.log('SEARCHED THREADS:', this.threads)
    })
    let i = 0
    this._handle = reaction((): any => {
      let result = {
        offset: this.offset,
        amount: this.amount,
        active: this.active
      };
      return result;
    }, this.refresh.bind(this))
  }

  @action public loadMore(num: number): Promise<boolean> {
    let promise = this.manager.server.searchOnce(this.query, this.order, this.offset + this.amount + 1, this.offset + this.amount + num)
      .then(action((res: MailpileInterfaces.IResultSearch) => {
        this.manager.store.updateStore(res.data)
        this.messageIDs = this.messageIDs.concat(res.thread_ids) // Inconsistency in the interfaces: the 'thread_ids' are actually message ids.
        this.amount += num
        return true;
      })).catch(() => false)
    return promise
  }
  @action public refresh(): Promise<boolean> {
    if (!this.active) {
      return Promise.resolve(true)
    }
    // // ---- CODE used for joining multiple requests, we can just make one request
    // let promise_list = []
    // let server = this.manager.server
    // for (let idx = 0; idx < this.amount; idx += this.step) {
    //   let start = this.offset + idx + 1
    //   let end = this.offset + math.min(idx+this.step, this.amount)
    //   promise_list.push(server.searchOnce(this.query, this.order, start, end))
    // }
    // Promise.all(promise_list)
    //   //update store? handle errors? how much should be done in Server?
    //   .then(action((searches: Server.IResultSearch[]) => {
    //     // Inconsistency in the interfaces: the 'thread_ids' are actually message ids.
    //     let tmpres = searches.map( search => search.thread_ids)
    //     this.messageIDs = [].concat(...tmpres)
    //     return true
    //   })).catch( () => {return false})
    // // ---- END
    return this.manager.server.searchOnce(this.query, this.order, this.offset + 1, this.offset + this.amount)
      .then(action((res: MailpileInterfaces.IResultSearch) => {
        this.manager.store.updateStore(res.data)
        this.messageIDs = res.thread_ids // Inconsistency in the interfaces: the 'thread_ids' are actually message ids.
        return true;
      })).catch(() => false)
  }

  @action public activate() {
    this._active += 1
  }

  @action public deactivate() {
    this._active = math.max(0, this._active - 1)
  }


}
