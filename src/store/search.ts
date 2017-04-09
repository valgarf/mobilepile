import {observable, computed, autorun, action, runInAction, reaction, ObservableMap} from 'mobx'
import * as math from 'mathjs'

import * as Lib from '@root/lib'
import {MailpileInterfaces, Server} from '@root/server'
import {Store} from './store'
import {Thread} from './threads'
import {Message} from './messages'


export class SearchManager {
  @observable all: ObservableMap<Search> = new ObservableMap<Search>();

  constructor(public store: Store, public server: Server) {
    autorun(() => {
      Lib.log.debug(['data', 'change', 'autorun', 'search'], "all searches:", this.all.toJS())
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

  @action public async refresh(): Promise<void> {
    await Promise.all(this.all.values().map(search => search.refresh()))
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
      Lib.log.debug(['data', 'change', 'autorun', 'search'], `threads for query '${query}' and order '${order}': `, this.threads)
    })
    //TODO maybe make 'amount' private? then we do not have to listen to it anymore. Currently the changes only become active with the next refresh...
    this._handle = reaction((): any => {
      let result = {
        offset: this.offset,
        // amount: this.amount,
        active: this.active
      };
      return result;
    }, (data) => {
      Lib.log.trace(['autorun', 'search'], `triggering reaction for query '${query}' and order '${order}'`, data)
      this.refresh().catch(this.manager.store.state.handleError)
    }, {
        compareStructural: true,
        fireImmediately: true
      })
  }

  @action public async loadMore(num: number): Promise<void> {
    runInAction(() => { this.amount += num })
    let res: MailpileInterfaces.IResultSearch = await this.manager.server.searchOnce(this.query, this.order, this.offset + this.amount - num + 1, this.offset + this.amount)
    let promise = this.manager.store.updateStore(res.data)
    if (this.messageIDs.length == this.amount - num) {
      runInAction(() => { this.messageIDs = this.messageIDs.concat(res.thread_ids) }) // Inconsistency in the interfaces: the 'thread_ids' are actually message ids.
    }
    else {
      Lib.log.warn(['search', 'loading'], `loadMore was beaten by the refresh method.num to fetch: ${num}, expected total of ${this.amount} messages.We already have ${this.messageIDs.length} messages`,
        this.messageIDs, res)
    }

    await promise;
  }
  @action public async refresh(): Promise<void> {
    if (!this.active) {
      return
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
    let res: MailpileInterfaces.IResultSearch = await this.manager.server.searchOnce(this.query, this.order, this.offset + 1, this.offset + this.amount)
    let promise = this.manager.store.updateStore(res.data)
    runInAction(() => { this.messageIDs = res.thread_ids }) // Inconsistency in the interfaces: the 'thread_ids' are actually message ids.
    await promise
  }

  @action public activate() {
    this._active += 1
  }

  @action public deactivate() {
    this._active = math.max(0, this._active - 1)
  }


}
