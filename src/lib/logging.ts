/**
 * @file Custom logging solution for logging to a console
 */

export enum LogLevel { TRACE, DEBUG, INFO, WARN, ERROR }


/**
 * The main class to handle loggin, only created ONCE in this file.
 */
class Log {

  private _filter: string[] = []
  public level: LogLevel = LogLevel.DEBUG;

  constructor() {
  }

  /**
   * The actual logging function
   *
   * @param  {LogLevel} level:
   * @param  {string} color: color to use for this entry (currently color corresponds to the log level)
   * @param  {string | string[]} tags: tags for this entry
   * @param  {any[]} msg: message(s) to log
   */
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

  /*
   * Logging functions for specific level, the actual public interface.
   */

  public error = (tags: string | string[], ...msg: any[]) => { this.log(LogLevel.ERROR, 'red', tags, ...msg) };
  public warn = (tags: string | string[], ...msg: any[]) => { this.log(LogLevel.WARN, '#e08e02', tags, ...msg) };
  public info = (tags: string | string[], ...msg: any[]) => { this.log(LogLevel.INFO, 'green', tags, ...msg) };
  public debug = (tags: string | string[], ...msg: any[]) => { this.log(LogLevel.DEBUG, 'blue', tags, ...msg) };
  public trace = (tags: string | string[], ...msg: any[]) => { this.log(LogLevel.TRACE, '#e3e301', tags, ...msg) };

  public clearFilter() {
    this._filter = []
  }

  /**
   * sets a filter on the logging mechanism, i.e. only log messages that have a specific tag.
   * TODO: expand this to something that also allows to sepcify which filters not to use or different combinations of tags.
   *
   * @param  {string | string[]} tags: the tags to show in the log
   */
  public setFilter(tags: string | string[]) {
    if (!Array.isArray(tags)) {
      tags = [tags]
    }
    this._filter = tags
  }
}

/**
 * global instance of the logger
 */
export const log = new Log()

/*
 * Exposing the logging object to the window
 */

function _window(): any {
  return window;
}
_window().log = log
_window().loglevel = LogLevel
