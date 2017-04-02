import {Injectable} from '@angular/core'

import {Server, IData} from '@root/server'

import {TagManager} from './tags'
import {AddressManager} from './addresses'
import {MessageManager} from './messages'
import {ThreadManager} from './threads'
import {SearchManager} from './search'
import {StateManager} from './state'


@Injectable()
export class Store {

  public addresses: AddressManager;
  public messages: MessageManager;
  public tags: TagManager;
  public threads: ThreadManager;
  public search: SearchManager;
  public state: StateManager;

  constructor(private server: Server) {
    this.state = new StateManager(this, server)
    this.tags = new TagManager(this)
    this.addresses = new AddressManager(this)
    this.messages = new MessageManager(this, server)
    this.threads = new ThreadManager(this)
    this.search = new SearchManager(this, server)

    server.tags().map( (res) => res.tags)
      .distinctUntilChanged( (a,b) => JSON.stringify(a)== JSON.stringify(b) )
      .subscribe(this.tags.update.bind(this.tags))
    server.storeUpdateCallback = this.updateStore.bind(this)
  }

  updateStore(data: IData) {
    this.addresses.update(data.addresses)
    this.tags.update(data.tags)
    this.messages.update(data.metadata)
    this.messages.update(data.messages)
    this.threads.update(data.threads)
  }

  refresh(): Promise<boolean> {
    return this.search.refresh()
  }
}
