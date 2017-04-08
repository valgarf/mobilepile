
export enum LogLevel { TRACE, DEBUG, INFO, WARN, ERROR }

class Log {

  private _filter: string[] = []
  public level: LogLevel = LogLevel.DEBUG;

  constructor() {
  }

  private log(level: LogLevel, color: string, tags: string | string[], ...msg: any[]) {
    if (level < this.level) {
      return
    }

    let tagstr: string = ""
    if (tags != null) {
      if (!Array.isArray(tags)) {
        tags = [tags]
      }
      tagstr = tags.sort().toString()
    }
    let filter = false
    if (this._filter.length == 0) {
      filter = true
    }
    else {
      for (let tag of tags) {
        if (this._filter.indexOf(tag) > -1) {
          filter = true
        }
      }
    }
    if (!filter) {
      return
    }

    let date = new Date()
    console.log(`%c ${date.toLocaleString()} ${LogLevel[level]} [${tagstr}]`, `color:${color};`, ...msg, )
  }

  public error = (tags: string | string[], ...msg: any[]) => { this.log(LogLevel.ERROR, 'red', tags, ...msg) };
  public warn = (tags: string | string[], ...msg: any[]) => { this.log(LogLevel.WARN, '#e08e02', tags, ...msg) };
  public info = (tags: string | string[], ...msg: any[]) => { this.log(LogLevel.INFO, 'green', tags, ...msg) };
  public debug = (tags: string | string[], ...msg: any[]) => { this.log(LogLevel.DEBUG, 'blue', tags, ...msg) };
  public trace = (tags: string | string[], ...msg: any[]) => { this.log(LogLevel.TRACE, '#e3e301', tags, ...msg) };

  public clearFilter() {
    this._filter = []
  }

  public setFilter(tags: string | string[]) {
    if (!Array.isArray(tags)) {
      tags = [tags]
    }
    this._filter = tags
  }
}

export const log = new Log()
function _window(): any {
  return window;
}
_window().log = log
_window().loglevel = LogLevel
_window().logtest = () => {
  let testobj = { a: 1, b: { c: 2 } };
  log.error('test', 'something very bad happened!', testobj)
  log.warn('test', 'something bad happened!', testobj)
  log.info(['test', 'connection'], 'something happened!', testobj)
  log.debug('test-other', 'something happened that I want to know.', testobj)
  log.trace('notest', 'something uninteresting happened', testobj)
}
