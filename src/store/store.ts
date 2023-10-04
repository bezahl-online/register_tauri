import { CreditAccountLine } from './../model/mms/creditAccountLine';
import { PaymentCustomerAccount } from './../model/mms/paymentCustomerAccount';
import { CustomerAccountBalance } from './../model/mms/customerAccountBalance';
import { exportJWK, JWK, KeyLike } from "jose";
import { reactive, ref } from "vue";
import { Button } from "../model/mms/button";
import { Receipt } from "../model/mms/receipt";
import { Customer } from "../model/mms/customer";
import { RegisterDevices } from "../model/mms/registerDevices";
import { PtResult } from "../model/pt/registerCompletionResponse";
import { AuthoriseResponseData } from '../model/pt/authoriseResponseData';
import { PaymentType } from '../model/mms/paymentType';
import { Log } from './logdata';

// @ts-ignore
var env_prod = process.env.NODE_ENV == "production";
// @ts-ignore
var mms_start_url = import.meta.env.VITE_MMS_START_URL;

interface Authentication {
  username: string;
  password: string;
  publicKey: JWK | null;
}

interface ptapiData {
  state: PtResult | null;
  info: string | null;
  message: string | null;
  transactionData: AuthoriseResponseData | null;
}

interface invoiceData {
  payment_type: PaymentType | null;
  remote: string;
  local: string;
  receiptCode: string | null;
  idleTimer: any;
  idle_timeout: number;
}
interface Err {
  nr: number;
  err: any | null;
}
interface RegisterState {
  failover_url: string;
  idleTimer: any;
  idle_timeout: number;
  loading: boolean;
  buttons: Button[] | null;
  heartBeatDuration: number;
  cronIntervalMinutes: number;
  auth: Authentication;
  registerID: string;
  CompanyData: {
    Name: string;
    Address: string[];
  };
  devices: RegisterDevices;
  error: Err | null;
  errorIdleTimer: any;
  error_idle_timeout: number;
  errorList: Log[];
  mms: {
    url: string;
    receipt: Receipt | null;
    // lastReceipt: object;
  };
  invoice: invoiceData;
  pt: {
    url: string;
    payment: ptapiData;
    endofday: ptapiData;
    register: ptapiData;
    busy: boolean;
    out_of_order: boolean;
    idleTimer: any;
    idle_timeout: number;
  };
  customer: {
    payment: PaymentCustomerAccount | null;
    balance: number | null;
    account: Customer | null;
    creditLines: CreditAccountLine[] | null;
    countdown: number;
    countdown_interval: any;
    idleTimer: any;
    idleTimeout: number;
    paying: boolean;
  };
  rfidURL: string;
  gm65Url: string;
  printUrl: string;
  soundEffect: any | null;
  setPublicKey: (key: KeyLike) => void;
}

var rState: RegisterState = {
  failover_url:  "https://www.greisslomat.at:444",
  // should be minimum 1 Minute or we risk duplicate receipt code
  idle_timeout: 5 * 60 * 1000, // 5 minutes
  idleTimer: null,
  loading: false,
  buttons: null, // should be set on startup by getting config from API
  heartBeatDuration: 5,
  cronIntervalMinutes: 5,
  auth: {
    username: "",
    password: "",
    publicKey: null,
  },
  registerID: "",
  CompanyData: {
    // HARDCODED: into DB
    Name: "Greisslomat e.U.",
    Address: ["Dorf 122", "6645 Vorderhornbach"],
  },
  devices: { scanner: 0, pt: 0, rfid: 0 },
  error: null,
  errorIdleTimer: null,
  error_idle_timeout: 8000,
  errorList: [],
  soundEffect: null,
  mms: { // default value should be overwitten on startup getting config from API
    url: env_prod ? (mms_start_url ? mms_start_url :
      "https://register2.bezahl.online") :
      // "https://localhost:8090") :
      "http://localhost:8090",
    receipt: null,
    // lastReceipt: null,
  },
  invoice: {
    payment_type: null,
    remote: env_prod // default value should be overwitten on startup getting config from API
    ? "https://rksv.greisslomat.at/invoice_pdf?code="
    : "http://192.168.30.114:8090/invoice_pdf?code=",
    local: env_prod // FIXME: set with env vars
      ? "https://localhost:8050/invoice?code="
      : "http://localhost:8050/invoice?code=",
    receiptCode: null,
    idleTimer: null,
    idle_timeout: 2 * 60 * 1000, // 2 minutes    
  },
  pt: {// HARDCODED // FIXME: set with env vars
    url: env_prod ? "https://localhost:8060" : "http://localhost:8060",
    payment: {
      state: null,
      info: null,
      message: null,
      transactionData: null,
    },
    endofday: {
      state: null,
      info: null,
      message: null,
      transactionData: null,
    },
    register: {
      state: null,
      info: null,
      message: null,
      transactionData: null,
    },
    busy: false,
    out_of_order: false,
    idleTimer: null,
    idle_timeout: 2 * 60 * 1000, // 2 minutes
  },
  customer: {
    payment: null,
    balance: 0,
    account: null,
    creditLines: null,
    countdown: 5,
    countdown_interval: null,
    idleTimer: null,
    idleTimeout: 30 * 1000, // 30 seconds
    paying: false
  },
  // HARDCODED driver urls and ports
  rfidURL: env_prod ? "https://localhost:8040" : "http://localhost:8040",
  gm65Url: env_prod ? "https://localhost:8070" : "http://localhost:8070",
  printUrl: env_prod ? "https://localhost:8050" : "http://localhost:8050",
  setPublicKey: function (key: KeyLike) {
    exportJWK(key).then((jwkkey) => {
      this.auth.publicKey = jwkkey;
    });
  },
};
var store = reactive<RegisterState>(rState);

export { store, Err, RegisterState, PtResult }
