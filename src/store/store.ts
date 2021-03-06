import {Injectable} from '@angular/core'

import {Server, MailpileInterfaces} from '@root/server'

import {TagManager} from './tags'
import {AddressManager} from './addresses'
import {MessageManager} from './messages'
import {ThreadManager} from './threads'
import {SearchManager} from './search'
import {StateManager} from './state'


/**
 * The store class handles all kinds of data returned form the server and stores parts of the current state of the App
 * Obtaining data from the server is also done within the store by using the server interface
 * The different mangers all use mobx, which makes it easy to listen to any changes in the data.
 */
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
    this.threads = new ThreadManager(this, server)
    this.search = new SearchManager(this, server)

  }

  async updateStore(data: MailpileInterfaces.IData): Promise<void> {
    this.addresses.update(data.addresses)
    this.tags.update(data.tags)
    this.messages.update(data.metadata)
    this.messages.update(data.messages)
    return await this.threads.update(data.threads)
  }

  async refresh(): Promise<void> {
    await Promise.all([
      this.tags.refresh(),
      this.search.refresh(),
    ])
  }
}
