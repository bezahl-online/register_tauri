import Dexie from "dexie";

export class EndOfDay {
  private timestamp: number;
  private data: string;

  constructor(data?: string) {
    this.timestamp = Date.now();
    this.data = data ? data : "";
    Object.defineProperties(this, {
      PTEndOfDay: { value: [], enumerable: false, writable: true },
    });
  }
}

class PTData extends Dexie {
  private endofday: Dexie.Table<EndOfDay, number>;

  constructor() {
    super("PTData");
    this.version(1).stores({
      endofday: "++id, timestamp, data",
    });

    this.endofday = this.table("endofday");
  }

  public newEndOfDay(data: string) {
    ptdb.endofday.put(new EndOfDay(data)).catch((err) => {
      console.log(err); // FIXME: error log to mms!
    });
  }
}

export var ptdb = new PTData();
