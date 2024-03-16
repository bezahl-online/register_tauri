import { PaymentCustomerAccount } from './model/mms/paymentCustomerAccount';
import { Payment } from './model/mms/payment';
import { AuthoriseResponseData } from './model/pt/authoriseResponseData';
import { CreditAccountLine } from './model/mms/creditAccountLine';
import { CustomerAccountBalance } from './model/mms/customerAccountBalance';
import axios, { AxiosResponse } from "axios";
import { ErrorType, SetError } from "./components/Error"
import { Company } from "./model/mms/company";
import { Customer } from "./model/mms/customer";
import { Receipt } from "./model/mms/receipt";
import { ReceiptType } from "./model/mms/receiptType";
import { Register } from "./model/mms/register";
import { RegisterConfigPop } from "./model/mms/registerConfigPop";
import type { RegisterState } from "./store/store";
import { authenticate } from './components/Register';
import { info } from "tauri-plugin-log-api";

// const url="http://localhost:8090"

export function addProductItem(
  barcode: string,
  store: RegisterState
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (store.mms.receipt &&
      store.mms.receipt.itemlist &&
      store.mms.receipt.itemlist.length > 18) {
      // FIXME: implement in mms or check if article in list
      reject(({ message: "code 418 max items reached" }))
      return;
    }
    post(
      "/add_receipt_item",
      {
        receiptcode: store.mms.receipt ? store.mms.receipt["code"] : "",
        register_id: store.registerID,
        item_code: barcode,
      },
      store
    )
      .then((result) => {
        resolve(result["data"]);
      })
      .catch((err) => {
        reject(err);
        console.dir(err);
      });
  });
}

export function stornoProductItem(
  item: object, //AddReceiptItemBody,
  store: RegisterState
): Promise<any> {
  return new Promise((resolve, reject) => {
    // item.registerId=store.registerID
    // item.qty=-item.qty
    post(
      "/add_receipt_item",
      {
        receiptcode: store.mms.receipt ? store.mms.receipt["code"] : "",
        register_id: store.registerID,
        item_code: item["product"]["code"],
        qty: -item["qty"],
      },
      store
    )
      .then((result: AxiosResponse<Receipt | any>) => {
        let data = result["data"];
        if (data.itemlist) {
          resolve(data);
        } else {
          resolve(null);
        }
      })
      .catch((err) => {
        reject(err);
        console.dir(err);
      });
  });
}

export function addPaymentDB(authData: AuthoriseResponseData | null, store: RegisterState) {
  return new Promise((resolve, reject) => {
    post(
      "/payment",
      {
        //@ts-ignore
        receipt_code: store.mms.receipt["code"],
        starttime: parseInt(`${new Date().getTime() / 1000}`),
        type: store.invoice.payment_type,
        status: "success",
        data: "",
        ptdata: authData,
        //@ts-ignore
        amount: store.mms.receipt.total.price,
      },
      store
    )
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function addCustomerAccountPaymentDB(customerAccountPayment: PaymentCustomerAccount, store: RegisterState) {
  return new Promise((resolve, reject) => {
    var payment: Payment = {
      //@ts-ignore
      receipt_code: store.mms.receipt["code"],
      starttime: parseInt(`${new Date().getTime() / 1000}`),
      //@ts-ignore
      type: store.invoice.payment_type,
      status: "success",
      data: "",
      customer_account: customerAccountPayment,
      //@ts-ignore
      amount: store.mms.receipt.total.price,
    }
    post(
      "/payment",
      payment,
      store
    )
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function saveEndOfDay(data: object, store: RegisterState) {
  return new Promise((resolve, reject) => {
    post("/end_of_day", data, store)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.dir(err);
        reject(err);
      });
  });
}

export function newReceipt(type: ReceiptType, store: RegisterState) {
  return new Promise<AxiosResponse>((resolve, reject) => {
    post(
      "/receipt",
      {
        register_id: store.registerID,
        receipt_type: type,
      },
      store
    )
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function closeReceipt(status: string, store: RegisterState) {
  return new Promise((resolve, reject) => {
    patch(
      "/receipt",
      {
        //@ts-ignore
        code: store.mms.receipt["code"],
        status: status,
      },
      store
    )
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function enrollRegister(data: object, store: RegisterState): Promise<Register | any> {
  return new Promise<AxiosResponse>((resolve, reject) => {
    post("/enroll", data, store)
      .then((result: AxiosResponse<Register | any>) => {
        resolve(result.data);
      })
      .catch((err) => {
        console.dir(err);
        reject(err);
      });
  });
}

function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function sendRegisterStatus(store: RegisterState) {
  // TODO: error spooler
  if (!store.registerID) return
  return new Promise(async (resolve, reject) => {
    var e: string | null = null
    try {
      //@ts-ignore
      e = `url: ${store.error.err.config.url}, message: ${store.error.err.message}`
    } catch {
      // ok no error just send status
    }
    try {
      var result = await post(
        "/register_status",
        {
          register_id: store.registerID,
          devices: store.devices,
          error: e,
        },
        store
      )
      resolve(result);
    } catch (err) {
      console.log(`could not send error '${e}' to mms\n ${err}`)
    }
  });
}

export function getRegisterConfig(store: RegisterState): Promise<RegisterConfigPop | any> {
  return new Promise<RegisterConfigPop | any>((resolve, reject) => {
    var params = [`register_id=${store.registerID}`]
    get("/register_config", params, store)
      .then((config: RegisterConfigPop) => {
        store.buttons = config.buttons ? config.buttons : null;
        store.mms.url = config.api_url ? config.api_url
          : store.mms.url;
        store.invoice.remote = config.public_api_url ?
          `${config.public_api_url}/invoice_pdf?code=` : store.invoice.remote;
        resolve(config)
      })
      .catch(err => {
        SetError(
          store,
          err,
          new Map([
            [ErrorType.E_NETWORK, 8],
            [ErrorType.E_UNAVAILABLE, 16],
            [ErrorType.E_NOTFOUND, 16],
            [ErrorType.E_UNAUTHORIZED, 11],
          ])
        );
        reject(err)
      })
  })
}

export function getCompanyData(store: RegisterState, id: number): Promise<Company | any> {
  return new Promise<Company | any>((resolve, reject) => {
    var params = [`id=${id}`]
    get("/company", params, store)
      .then((company: Company) => {
        store.CompanyData.Name = company.name ? company.name : null;
        store.CompanyData.Address = company.address ? company.address : null;
        resolve(company)
      })
      .catch(err => {
        SetError(
          store,
          err,
          new Map([
            [ErrorType.E_NETWORK, 8],
            [ErrorType.E_UNAVAILABLE, 18],
            [ErrorType.E_NOTFOUND, 18],
            [ErrorType.E_UNAUTHORIZED, 11],
          ])
        );
        reject(err)
      })
  })
}

export function getCustomerAccount(store: RegisterState, key_uid: number) {
  return new Promise<Customer | any>((resolve, reject) => {
    var params = [`key_uid=${key_uid}`]
    get("/customer", params, store)
      .then((customer: Customer) => {
        store.customer.account = customer
        if (store.customer.idleTimer) {
          clearTimeout(store.customer.idleTimer)
        }
        store.customer.idleTimer = setTimeout(() => {
          store.customer.account = null
          store.customer.creditLines = null;
          store.customer.balance = null;
          store.customer.paying = false
        }, store.customer.idleTimeout, store)
        if (store.customer.countdown_interval) {
          clearInterval(store.customer.countdown_interval)
        }
        resolve(customer)
      })
      .catch(err => {
        store.customer.account = null
        store.customer.creditLines = null;
        store.customer.balance = null;
        store.customer.paying = false
        SetError(
          store,
          err,
          new Map([
            [ErrorType.E_NETWORK, 8],
            [ErrorType.E_UNAVAILABLE, 22],
            [ErrorType.E_NOTFOUND, 23],
            [ErrorType.E_UNAUTHORIZED, 11],
          ])
        );
        reject(err)
      })
  })
}

export function getCustomerAccountBalance(store: RegisterState, customerID: number) {
  return new Promise<CustomerAccountBalance | any>((resolve, reject) => {
    var params = [`customer_id=${customerID}`]
    get("/customer_account_balance", params, store)
      .then((balance: CustomerAccountBalance) => {
        store.customer.balance = balance.balance / 100
        resolve(balance)
      })
      .catch(err => {
        store.customer.balance = null
        SetError(
          store,
          err,
          new Map([
            [ErrorType.E_NETWORK, 8],
            [ErrorType.E_UNAVAILABLE, 25],
            [ErrorType.E_NOTFOUND, 24],
            [ErrorType.E_UNAUTHORIZED, 11],
            [ErrorType.E_SERVER_ERROR, 0],
          ])
        );
        reject(err)
      })
  })
}

export function getCreditAccountLines(store: RegisterState, customerID: number) {
  return new Promise<CustomerAccountBalance | any>((resolve, reject) => {
    var params = [`customer_id=${customerID}`]
    get("/customer_account", params, store)
      .then((lines: CreditAccountLine[]) => {
        store.customer.creditLines = lines
        resolve(lines)
      })
      .catch(err => {
        store.customer.creditLines = null
        SetError(
          store,
          err,
          new Map([
            [ErrorType.E_NETWORK, 8],
            [ErrorType.E_UNAVAILABLE, 25],
            [ErrorType.E_NOTFOUND, 24],
            [ErrorType.E_UNAUTHORIZED, 11],
            [ErrorType.E_SERVER_ERROR, 0],
          ])
        );
        reject(err)
      })
  })
}

export function newCreditAccountLine(store: RegisterState, line: CreditAccountLine) {
  return new Promise<CustomerAccountBalance | any>((resolve, reject) => {
    post("/credit_account_line", line, store)
      .then(async (result: AxiosResponse) => {
        //@ts-ignore
        await getCustomerAccountBalance(store, store.customer.account.id)
        resolve(result)
      })
      .catch(err => {
        store.customer.balance = null
        SetError(
          store,
          err,
          new Map([
            [ErrorType.E_NETWORK, 8],
            [ErrorType.E_UNAVAILABLE, 26],
            [ErrorType.E_NOTFOUND, 27],
            [ErrorType.E_UNAUTHORIZED, 11],
            [ErrorType.E_SERVER_ERROR, 0],
          ])
        );
        reject(err)
      })
  })
}

function get(path: string, params: string[], store: RegisterState): Promise<RegisterConfigPop | any> {
  return new Promise((resolve, reject) => {
    let paramString = "";
    if (params.length > 0) {
      for (var i in params) {
        paramString += paramString.length > 0 ? "&" : "?";
        paramString += params[i];
      }
    }
    authenticate(store).catch(e => reject(e))
      .then(success => {
        axios
          .get(`${store.mms.url}${path}${paramString}`, {
            auth: store.auth,
          })
          .then((result: AxiosResponse) => {
            resolve(result.data);
          })
          .catch((err) => {
            var errmes = err["message"] ? err["message"] : "no message in error"
            var servererror = errmes.includes("Network") || errmes.includes("code 500")
            if (servererror && store.failover_url) {
              axios
                .get(`${store.failover_url}${path}${paramString}`, {
                  auth: store.auth,
                })
                .then((result: AxiosResponse) => {
                  resolve(result.data);
                })
                .catch((err) => {
                  // if even failover failes, just show error message then
                  reject(err);
                });
            } else {
              reject(err);
            }
          });
      });
  });
}


function post(path: string, data: object, store: RegisterState) {
  return new Promise<AxiosResponse>(async (resolve, reject) => {
    if (store.registerID.length > 0) { await authenticate(store) }
    info(`post data:"${data}" to url:"${store.mms.url}"`)
    axios
      .post(`${store.mms.url}${path}`, data, {
        auth: store.auth,
      })
      .then((result) => {
        info(`success result:"${JSON.stringify(result)}"`)
        resolve(result);
      })
      .catch((err) => {
        var errmes = err["message"] ? err["message"] : "no message in error"
        var servererror = errmes.includes("Network") || errmes.includes("code 500")
        info(`failed result:"${JSON.stringify(errmes)}"`)
        if (servererror && store.failover_url) {
          axios
            .post(`${store.failover_url}${path}`, data, {
              auth: store.auth,
            })
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              // if even failover failes, just show error message then
              reject(err);
            });
        } else {
          reject(err);
        }
      });
  });
}

function patch(path: string, data: object, store: RegisterState) {
  return new Promise((resolve, reject) => {
    authenticate(store).catch(e => reject(e))
      .then(success => {
        axios
          .patch(`${store.mms.url}${path}`, data, {
            auth: store.auth,
          })
          .then((result) => {
            resolve(result);
          })
          .catch((err) => {
            var errmes = err["message"] ? err["message"] : "no message in error"
            var servererror = errmes.includes("Network") || errmes.includes("code 500")
            if (servererror && store.failover_url) {
              axios
                .post(`${store.failover_url}${path}`, data, {
                  auth: store.auth,
                })
                .then((result) => {
                  resolve(result);
                })
                .catch((err) => {
                  // if even failover failes, just show error message then
                  reject(err);
                });
            } else {
              reject(err);
            }
          });
      });
  });
}
