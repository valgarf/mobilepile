
export class DerivedError extends Error {
  constructor(public message: string, public details: any = 'No further details available', public tags: string[] = []) {
    super(message)
    this.name = this.constructor.name
    console.log('Concluded name:', this.name)
    let defaultTags = _defaultTags[this.constructor.name]
    if (defaultTags != null) {
      this.tags = this.tags.concat(defaultTags)
    }
    //.split(/(?=[A-Z])/).join(' ')  -> would put empty sapces in the name.
  }

  toString(): string {
    return this.name + ': ' + this.message
  }
}

const _defaultTags = {
  RuntimeError: ['runtime'],
  ConnectionError: ['connection'],
  AuthenticationError: ['authentication'],
};

export class RuntimeError extends DerivedError { };
export class ConnectionError extends DerivedError { };
export class AuthenticationError extends DerivedError { };
export class WrappingError extends DerivedError {
  constructor(public message: string, public details: any = 'No further details available', name: string = null, public tags: string[] = []) {
    super(message, details, tags)
    if (name != null) {
      this.name = name
    }
  }
};

export namespace error {
  export function attachTags(err, tags: string[]) {
    if (err.tags == null) {
      err.tags = []
    }
    err.tags = err.tags.concat(tags)
  }

  export function ensureErrorObject(err) {
    if (err instanceof Error) {
      return err;
    }
    let message = 'wrapping error object that is not of type "Error"'
    let name = err.name
    if (err.message != null) {
      message = err.message
    }
    return new WrappingError(message, err, name)
  }
}
