import Dexie from "dexie";

export class Log {
  public timestamp: number;
  public message: string;
  public error: string;

  constructor(message?: string, error?: string) {
    this.timestamp = Date.now();
    this.message = message ? message : "ERROR";
    this.error = error ? error : "";
    Object.defineProperties(this, {
      ErrorLog: { value: [], enumerable: false, writable: true },
    });
  }
}

class LogData extends Dexie {
  private log: Dexie.Table<Log, number>;

  constructor() {
    super("LogData");
    this.version(1).stores({
      errorlog: "++id, timestamp, message, error",
    });
    this.log = this.table("errorlog");
  }

  public newError(message: string, error: string) {
    logdb.log.put(new Log(message, error)).catch((err) => {
      console.log(err);
    });
  }
  public newLog(message: string) {
    logdb.log.put(new Log(message)).catch((err) => {
      console.log(err);
    });
  }
  public getAll(arr: Array<Log>) {
    logdb.log.reverse().toArray().then(l=>l.forEach(log=>arr.push(log)))
  }
}


export var logdb = new LogData();
