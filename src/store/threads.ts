import { observable, computed, autorun, intercept, action, ObservableMap } from 'mobx'

import * as Server from '@root/server'

import { Store } from './store'
import { Message } from './messages'

export class ThreadManager {
  @observable all: ObservableMap<Thread> = new ObservableMap<Thread>();

  constructor(public store: Store) {
    autorun( () => {
      console.log("MOBX THREADS:", this.all.toJS() )
    })
  }

  public getByID(id: string): Thread {
    return this.all.get(id)
  }

  @action public update( threadmap: { [id:string]: Server.IMessageThread }) {
    Object.keys(threadmap).forEach( id => {
      let threadobj = this.all.get(id)
      let new_thread = threadmap[id]
      if (threadobj == null) {
        threadobj = new Thread(id, this);
        this.all.set(id, threadobj);
      }
      threadobj.update(new_thread)
    })
  }
}

enum ThreadEntryType { single, top, middle, bottom}
class ThreadEntry {
  messageID: string
  type: ThreadEntryType
  message: Message

  constructor(public thread: Thread, threadEntry: Server.IMessageEntry) {
    this.messageID = threadEntry[0]
    switch( threadEntry[1] ) {
      case "": this.type = ThreadEntryType.single;
      case "r": this.type = ThreadEntryType.top;
      case "├": this.type = ThreadEntryType.middle;
      case "└": this.type = ThreadEntryType.bottom;
    }
    this.message = this.thread.manager.store.messages.getByID(this.messageID)
  }
}

export class Thread {

  @observable entries: ThreadEntry[] = []

  constructor(public ID: string, public manager: ThreadManager) {
  }

  update(thread: Server.IMessageThread) {
    this.entries = thread.map( entry => new ThreadEntry( this, entry) )
  }
}
