// payment

import { AuthCompletionResponse } from './../model/pt/authCompletionResponse';
import { PtResult } from "../model/pt/registerCompletionResponse";
import {
  abortPayment,
  pollpayment,
  startpayment,
  register,
  pollRegister,
  displayText,
} from "../ptapi";
import type { RegisterState } from "../store/store";
import { ErrorType, setDeviceState, SetError } from "./Error";

export function PTinit(store: RegisterState) {
  PTregister(store).then(() => {
    setDeviceState(store, "pt", 0)
    let lines = [
      store.CompanyData.Name,
      store.CompanyData.Address[0],
      store.CompanyData.Address[1],
    ];
    PTdisplayText(lines, store);
  })
    .catch((err) => {
      setDeviceState(store, "pt", 1)
      SetError(
        store,
        err,
        new Map([
          [ErrorType.E_NETWORK, 2],
          [ErrorType.E_UNAVAILABLE, 3],
        ])
      );
    });
}

export function PTstart(store: RegisterState): Promise<any> {
  return new Promise((resolve, reject) => {
    if (store.pt.out_of_order) {
      reject(PtResult.NeedEndOfDay); // FIXME: or software_update??
      return;
    }
    store.pt.payment.state = PtResult.Pending;
    store.pt.payment.message = "EC Zahlung gestartet.."; // TODO: i18n better yet: icons/gifs!
    store.pt.payment.info = null;
    store.pt.payment.transactionData = null;
    function poll(store: RegisterState) {
      pollpayment(store)
        .then((result: AuthCompletionResponse) => {
          processPaymentResult(result, store);
          if (result.transaction.result == PtResult.NeedEndOfDay) {
            store.error = {
              nr: 15,
              err: null,
            }
          }
          result.transaction.result == PtResult.Pending
            ? poll(store)
            : resolve(result);
          return;
        })
        .catch((err) => {
          waitClose(store);
          reject(err);
        });
    }
    startpayment(store)
      .then((result) => {
        poll(store);
      })
      .catch((err) => {
        waitClose(store);
        reject(err);
      });
  });
}

function processPaymentResult(result: AuthCompletionResponse, store: RegisterState) {
  // if (result && result["message"].length > 0)
  //   store.pt.payment.message = result["message"];
  let t = result.transaction
  store.pt.payment.state = t.result;
  if (t.data && t.data.info) {
    store.pt.payment.info = t.data.info;
  }
  switch (t.result) {
    case PtResult.Pending:
      // console.log("still pending..");
      if (t.data && !store.pt.payment.transactionData) {
        store.pt.payment.transactionData = t.data;
      }
      break;
    case PtResult.Abort:
      store.pt.payment.message = "Zahlung abgebrochen"; // TODO: i18n
      store.pt.payment.transactionData = null;
      waitClose(store);
      break;
    case PtResult.Success:
      store.pt.payment.message = "Zahlung erfolgreich";
      waitClose(store);
      break;
    case PtResult.NeedEndOfDay:
      store.pt.payment.message = "Tagesabschluss notwendig";
      waitClose(store);
      break;
  }
}

function waitClose(store: RegisterState) {
  setTimeout(
    function (store: RegisterState) {
      store.pt.payment.message = null;
      store.pt.payment.info = null;
    },
    2000,
    store
  );
}

export function PTabort(store: RegisterState) {
  store.pt.payment.message = "Zahlung wird abgebrochen"; // TODO: i18n
  abortPayment(store).then(() => setDeviceState(store, "pt", 0))
  .catch((err) => {
    SetError(
      store,
      err,
      new Map([
        [ErrorType.E_NETWORK, 2],
        [ErrorType.E_UNAVAILABLE, 3],
      ])
    );
  });
}

export function PTregister(store: RegisterState) {
  return new Promise((resolve, reject) => {
    store.pt.payment.state = PtResult.Pending;
    function doPoll(store: RegisterState) {
      pollRegister(store)
        .then((result) => {
          setDeviceState(store, "pt", 0)
          processRegisterResult(result, store);
          result.transaction.result == PtResult.Pending
            ? doPoll(store)
            : resolve(result);
        })
        .catch((err) => {
          setDeviceState(store, "pt", 1)
          reject(err);
        });
    }
    register(store)
      .then((result) => {
        doPoll(store);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function processRegisterResult(result: object, store: RegisterState) {
  if (result && result["message"].length > 0)
    store.pt.register.message = result["message"];
  let t = result["transaction"];
  store.pt.register.state = t.result;
  if (t.data && t.data.info) store.pt.payment.info = t.data.info;
  switch (t.result) {
    case PtResult.Pending:
      // console.log("still pending..");
      if (t.data && !store.pt.register.transactionData) {
        store.pt.register.transactionData = t.data;
      }
      break;
    case PtResult.Abort:
      // store.pt.register.message = "BZT Initialierung abgebrochen";
      store.pt.register.transactionData = null;
      waitClose(store);
      break;
    case PtResult.Success:
      // store.pt.register.message = "BZT Initialierung erfolgreich";
      waitClose(store);
      break;
  }
}

export function PTdisplayText(lines: Array<string>, store: RegisterState) {
  displayText(lines, store).then(() => setDeviceState(store, "pt", 0))
    .catch((err) => {
      setDeviceState(store, "pt", 1)
      SetError(
        store,
        err,
        new Map([
          [ErrorType.E_NETWORK, 2],
          [ErrorType.E_UNAVAILABLE, 3],
        ])
      );
    });
}

