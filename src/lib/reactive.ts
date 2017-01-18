
// import {BehaviorSubject} from 'rxjs'
//
// // const behaviourSubjectMetadataKey = Symbol("BehaviorSubjectMetadata");
//
// export class ReactingClass {
//   _behaviorSubjects: { [key:string]: BehaviorSubject<any> }
//   public getSubject(key: string) : BehaviorSubject<any> {
//     return this._behaviorSubjects[key]
//   }
//
//   constructor() {
//
//   }
// }
//
//
// export function reactify(prototype: Object, propertyKey: string) {
//  // property value
//  // var property = this[propertyKey];
//  var property = new BehaviorSubject(this[propertyKey])
//  this._behaviorSubjects[propertyKey] = property
//
//  // property getter
//  var getter = function () {
//    return property.getValue()
//  };
//
//  // property setter
//  var setter = function (newVal: any) {
//    property.next(newVal);
//  };
//
//  // Delete property.
//  if (delete this[propertyKey]) {
//    // Create new property with getter and setter
//    Object.defineProperty(prototype, propertyKey, {
//      get: getter,
//      set: setter,
//      enumerable: true,
//      configurable: true
//    });
//
//  }
//
// }
