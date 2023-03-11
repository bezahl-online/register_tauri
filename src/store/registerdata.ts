import Dexie from "dexie";
import { generateKeyPair } from "jose";
// @ts-ignore
import { KeyLike } from "jose/webcrypto/jwt/sign";
const version = 2
export class KeyStore {
  id: number;
  privateKey: KeyLike;
  publicKey: KeyLike;

  constructor(privateKey?: KeyLike, publicKey?: KeyLike) {
    this.id = 1;
    this.privateKey = privateKey ? privateKey : (null as unknown as KeyLike);
    this.publicKey = publicKey ? publicKey : (null as unknown as KeyLike);
    Object.defineProperties(this, {
      KeyStore: { value: [], enumerable: false, writable: true },
    });
  }

  generate() {
    console.log("generating new keypair");
    return new Promise<void>(async (resolve) => {
      const { publicKey, privateKey } = await generateKeyPair("ES256");
      this.id = 1;
      this.privateKey = privateKey;
      this.publicKey = publicKey;
      resolve();
    });
  }
}

export class Register {
  id: number;
  num: string;
  name: string;

  constructor(num?: string, name?: string) {
    this.id = 1;
    this.num = num ? num : "";
    this.name = name ? name : "";
    Object.defineProperties(this, {
      Register: { value: [], enumerable: false, writable: true },
    });
  }
}

export class Company {
  id: number;
  num: string;
  name: string;
  addr: string[];

  constructor(num?: string, name?: string, addr?: Array<string>) {
    this.id = 1;
    this.num = num ? num : "";
    this.name = name ? name : "";
    this.addr = addr ? addr : new Array<string>();
    Object.defineProperties(this, {
      Company: { value: [], enumerable: false, writable: true },
    });
  }
}

class RegisterData extends Dexie {
  private keys: Dexie.Table<KeyStore, number>;
  private register: Dexie.Table<Register, number>;
  private company: Dexie.Table<Company, number>;

  constructor() {
    super("RegisterData");
    this.version(version).stores({
      keys: "++id, privateKey, publicKey",
      register: "++id, num, name",
      company: "++id, num, name, addr"
    });
    this.keys = this.table("keys");
    this.register = this.table("register");
    this.company = this.table("company");
  }

  public setRegisterID(id: string, name: string) {
    let register = new Register(id, name);
    regdb.register.put(register);
  }

  public getRegister(): Promise<Register> {
    return new Promise((resolve, reject) => {
      let register = new Register();
      regdb.register
        .get(1)
        .catch((err) => reject(err))
        .then((reg) => {
          if (reg) {
            register.num = reg ? reg.num : "0";
            register.name = reg ? reg.name : "";
            resolve(register);
          } else reject(new Error("register not found"));
        });
    });
  }


  public async setCompanyID(id: string, name: string, addr: Array<string>) {
    let company = new Company(id, name, addr);
    await regdb.company.put(company);
  }


  public getCompany(): Promise<Company> {
    return new Promise((resolve, reject) => {
      let company = new Company();
      regdb.company
        .get(1)
        .catch((err) => reject(err))
        .then((comp) => {
          if (comp) {
            company.num = comp ? comp.num : "0";
            company.name = comp ? comp.name : "";
            company.addr = comp ? comp.addr : Array<string>();
            resolve(company);
          } else reject(comp);
        });
    });
  }

  public getKeyPair(): Promise<KeyStore> {
    // db.keys.clear()
    return new Promise((resolve, reject) => {
      regdb.keys
        .get(1)
        .catch((err) => reject(err))
        .then((keypair) => {
          // console.log(keypair);
          if (keypair) {
            // console.log("from db");
            resolve(keypair);
          } else {
            let keypair = new KeyStore();
            keypair
              .generate()
              .catch((err) => reject(err))
              .then(() => {
                regdb.keys.put(keypair);
                // console.log("newley created");
                resolve(keypair);
              });
          }
        });
    });
  }

}

export var regdb = new RegisterData();
