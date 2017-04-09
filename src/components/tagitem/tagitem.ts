import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {action, computed} from 'mobx'

import {Tag} from '@root/store'

/**
 * Shows a single tag (icon + name) and its subtree recursively. It is an <ion-item> and should be used in an <ion-list>
 */
@Component({
  selector: 'tagitem',
  templateUrl: 'tagitem.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagitemComponent {
  @Input() tag: Tag;
  @Input() level: number; // depth level in the tag tree for indentation
  @Output() select: EventEmitter<Tag> = new EventEmitter<Tag>(); //emitted when the tag is clicked/opened

  constructor() {
  }

  /**
   * add padding to the left to indent subtrees
   */
  get leftPadding(): string {
    let ex = this.level * 1.5
    return ex.toString() + 'ex'
  }


  @computed get icon(): string {
    return 'assets/icon/' + this.tag.icon.substring(5) + '-inverted.svg'
  }

  @computed get arrow(): string {
    let arrtype = this.tag.open ? 'down' : 'right';
    return 'assets/icon/arrow-' + arrtype + '-inverted.svg'
  }

  @computed get visibility(): string {
    return this.tag.children.length > 0 ? 'visible' : 'hidden'
  }

  /**
   * action open - called when the arrow is clicked -> open or closes the subtree and stores the state in the store
   */
  @action open() {
    if (this.tag.children.length == 0) {
      this.tag.open = false
    }
    else {
      this.tag.open = !this.tag.open
    }
  }
}
