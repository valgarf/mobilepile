import {observable, autorun, action, ObservableMap } from 'mobx'

import * as Lib from '@root/lib'
import {MailpileInterfaces} from '@root/server'
import {Store} from './store'

export class AddressManager {
  @observable all: ObservableMap<Address> = new ObservableMap<Address>();

  constructor(public store: Store) {
    autorun(() => {
      Lib.log.debug(['data', 'change', 'autorun', 'address'], "addresses:", this.all.toJS())
    })
  }

  public getByID(id: string): Address {
    return this.all.get(id)
  }

  @action public update(adrmap: { [id: string]: MailpileInterfaces.IAddress }) {
    Object.keys(adrmap).forEach(id => {
      let adrobj = this.all.get(id)
      let new_adr = adrmap[id]
      if (adrobj == null) {
        adrobj = new Address(id, this);
        this.all.set(id, adrobj);
      }
      adrobj.update(new_adr)
    })
  }
}

export class Address {

  @observable address: string;
  @observable name: string;

  constructor(public ID: string, private manager: AddressManager) {
  }

  update(adr: MailpileInterfaces.IAddress) {
    this.address = adr.address;
    this.name = adr.fn;
  }
}
