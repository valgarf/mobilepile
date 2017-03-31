import { Injectable, Inject, forwardRef } from '@angular/core'

import { Server } from '@root/server'

import { TagManager } from './tags'


@Injectable()
export class Store {

  public tags: TagManager;

  constructor(@Inject(forwardRef(() => Server)) private server: Server) {
    this.tags = new TagManager()
    server.tags().map( (res) => res.tags).distinctUntilChanged( (a,b) => JSON.stringify(a)== JSON.stringify(b) ).do(console.log.bind(console)).subscribe(this.tags.update.bind(this.tags))
  }
}
