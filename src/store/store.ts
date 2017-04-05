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
    this.tags = new TagManager(this, server)
    this.addresses = new AddressManager(this)
    this.messages = new MessageManager(this, server)
    this.threads = new ThreadManager(this)
    this.search = new SearchManager(this, server)

  }

  updateStore(data: IData) {
    this.addresses.update(data.addresses)
    this.tags.update(data.tags)
    this.messages.update(data.metadata)
    this.messages.update(data.messages)
    this.threads.update(data.threads)
  }

  async refresh(): Promise<void> {
    await this.tags.refresh()
    await this.search.refresh()
  }
}
