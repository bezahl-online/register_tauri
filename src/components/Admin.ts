// admin.ts

import { saveEndOfDay } from "../mmsapi";
import { endOfDay, pollEndOfDay } from "../ptapi";
import { ptdb } from "../store/ptdata";
import { PtResult, RegisterState } from "../store/store";
import { ErrorType, SetError } from "./Error";

export function startEndOfDay(store: RegisterState) {
  store.pt.busy = true;
  PTendOfDay(store)
    .then((result) => {
      //@ts-ignore
      if (result["transaction"].result) {
        //@ts-ignore
        switch (result["transaction"].result) {
          case "success":
            ptdb.newEndOfDay(JSON.stringify(store.pt.endofday.transactionData))
            //@ts-ignore
            saveEndOfDay(store.pt.endofday.transactionData, store)
              .catch((err: string) => {
                store.pt.endofday.transactionData = null;
              })
              .then(() => {
                store.pt.endofday.transactionData = null;
              });
            break;
          case "abort":
        }
      }
      store.pt.busy = false;
    })
    .catch((err) => {
      // emit("abort");
      SetError(
        store,
        err,
        new Map([
          [ErrorType.E_NETWORK, 2],
          [ErrorType.E_UNAVAILABLE, 3],
        ])
      );
      store.pt.endofday.message = null;
      store.pt.busy = false;
    });
}

export function PTendOfDay(store: RegisterState) {
  return new Promise((resolve, reject) => {
    function poll(store: RegisterState) {
      pollEndOfDay(store)
        .then((result) => {
          processEndOfDayResult(result, store);
          result.transaction.result == PtResult.Pending
            ? poll(store)
            : resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    }
    endOfDay(store)
      .then((result) => {
        poll(store);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function processEndOfDayResult(result: Object, store: RegisterState) {
  if (result && result["message"].length > 0)
    store.pt.endofday.message = result["message"];
  let ptResult: PtResult = result["transaction"].result;

  store.pt.endofday.state = ptResult;
  switch (ptResult) {
    case PtResult.Pending:
      // console.log("still pending..");
      var transaction = result["transaction"].data;
      console.dir(transaction)
      console.dir(store.pt.endofday)
      if (transaction && !store.pt.endofday.transactionData) {
        store.pt.endofday.transactionData = transaction;
        //@ts-ignore
        store.pt.endofday.transactionData["register_id"] = store.registerID;
      }
      break;
    case PtResult.Abort:
      store.pt.endofday.message = "Tagesabschluss abgebrochen";
      store.pt.endofday.transactionData = null;
      waitClose(store);
      break;
    case PtResult.Success:
      store.pt.endofday.message = "Tagesabschluss erfolgreich";
      waitClose(store);
      break;
    case PtResult.NeedEndOfDay:
      store.pt.endofday.message = "Sofware-Update steht zur Verüfgung";
      store.pt.out_of_order = true;
  }
}

function waitClose(store: RegisterState) {
  setTimeout(
    function (store: RegisterState) {
      store.pt.endofday.message = null;
    },
    2000,
    store
  );
}
