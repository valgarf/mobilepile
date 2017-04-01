import { Injectable, Inject, forwardRef } from '@angular/core'

import { Server, IData } from '@root/server'

import { TagManager } from './tags'
import { AddressManager } from './addresses'
import { MessageManager } from './messages'
import { ThreadManager } from './threads'


@Injectable()
export class Store {

  public addresses: AddressManager;
  public messages: MessageManager;
  public tags: TagManager;
  public threads: ThreadManager;

  constructor(@Inject(forwardRef(() => Server)) private server: Server) {
    this.tags = new TagManager(this)
    this.addresses = new AddressManager(this)
    this.messages = new MessageManager(this)
    this.threads = new ThreadManager(this)
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
}
