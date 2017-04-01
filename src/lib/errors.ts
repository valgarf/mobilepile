
export class DerivedError extends Error {
  constructor(public message: string, public details: string = 'No further details available') {
    super(message)
    this.name =  this.constructor.name
    //.split(/(?=[A-Z])/).join(' ')  -> would put empty sapces in the name.
  }

  toString(): string {
    return this.name+ ': '+this.message
  }
}

export class RuntimeError extends DerivedError {};
export class ConnectionError extends DerivedError {};
export class AuthenticationError extends DerivedError {};
