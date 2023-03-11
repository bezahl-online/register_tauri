// client for payment terminal API

import axios, { AxiosResponse } from "axios";
import { RegisterState } from "./store/store";
import type { AuthCompletionResponse } from './model/pt/authCompletionResponse';

// authorisation
export function startpayment(store: RegisterState): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!(store.mms.receipt && store.mms.receipt["total"].price)) {
      reject("no amount available");
      return;
    }
    post(
      "/authorise",
      {
        amount: store.mms.receipt["total"].price,
        receipt_code: store.mms.receipt["code"],
      },
      store.pt.url
    )
      .then((result) => {
        resolve(result["data"]);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
// FIXME: type of promise to payment result object
export function pollpayment(store: RegisterState): Promise<AuthCompletionResponse | any > {
  return new Promise((resolve, reject) => {
    post(
      "/authorise_completion",
      {
        receipt_code: store.mms.receipt["code"],
      },
      store.pt.url
    )
      .then((result) => {
        resolve(result.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// display text
export function displayText(
  lines: Array<string>,
  store: RegisterState
): Promise<any> {
  return new Promise((resolve, reject) => {
    post(
      "/display_text",
      {
        lines: lines,
      },
      store.pt.url
    )
      .then(() => {
        resolve("OK");
      })
      .catch((err) => {
        reject(err);
        // console.dir(err);
      });
  });
}

// register
export function register(store: RegisterState): Promise<any> {
  return new Promise((resolve, reject) => {
    post("/register", null, store.pt.url)
      .then(() => {
        resolve("register started");
      })
      .catch((err) => {
        reject(err);
        // console.dir(err);
      });
  });
}
export function pollRegister(store: RegisterState): Promise<any> {
  return new Promise((resolve, reject) => {
    post("/register_completion", null, store.pt.url)
      .then((result) => {
        resolve(result["data"]);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// abort
export function abortPayment(store: RegisterState): Promise<any> {
  return new Promise((resolve, reject) => {
    post("/abort", null, store.pt.url)
      .then((result) => {
        resolve(result["data"]);
      })
      .catch((err) => {
        reject(err);
        // console.dir(err);
      });
  });
}

// end of day
export function endOfDay(store: RegisterState) {
  return new Promise((resolve, reject) => {
    post("/endofday", null, store.pt.url)
      .then((result) => {
        resolve("end of day started");
      })
      .catch((err) => {
        reject(err);
        // console.dir(err);
      });
  });
}
export function pollEndOfDay(store: RegisterState): Promise<any> {
  return new Promise((resolve, reject) => {
    post("/endofday_completion", null, store.pt.url)
      .then((result) => {
        resolve(result["data"]);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function post(path: string, data: object, url: string): Promise<AxiosResponse> {
  return new Promise<AxiosResponse>((resolve, reject) => {
    axios
      .post(`${url}${path}`, data)
      .then((result) => {
        // console.dir(result);
        resolve(result);
      })
      .catch((err) => {
        // console.dir(err);
        reject(err);
      });
  });
}
