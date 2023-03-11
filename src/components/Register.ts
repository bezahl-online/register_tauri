// register

import {
  addProductItem,
  stornoProductItem,
  closeReceipt,
} from "../mmsapi";

import { RegisterState } from "../store/store";
import { SignJWT } from "jose";
import { regdb, KeyStore } from "../store/registerdata";
import { ErrorType, SetError } from "./Error";

export function authenticate(store: RegisterState): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    await regdb
      .getRegister()
      .catch((err) => reject(err))
      .then(async (register) => {
        store.registerID = register ? register.num : "";
        // we use register id as a username for the API
        store.auth.username = register
          ? register.num
          : "not defined";
        await regdb
          .getKeyPair()
          .catch((err) => reject(err))
          .then((keypair) => {
            if (keypair) {
              store.setPublicKey(keypair.publicKey);
              sign(keypair, store.registerID)
                .then((token) => {
                  store.auth.password = token;
                  resolve(true);
                })
                .catch((err) => reject(err));
            } else {
              resolve(false);
            }
          });
      });
  });
}

function sign(keypair: KeyStore, registerID: string): Promise<string> {
  return new Promise((resolve, reject) => {
    new SignJWT({ "urn:example:claim": true })
      .setProtectedHeader({ alg: "ES256", kid: registerID })
      .setIssuedAt()
      .setIssuer("bezahl.online")
      .setAudience("greisslomat.at")
      .setExpirationTime((new Date().getTime()/1000)+30)
      .sign(keypair.privateKey)
      .catch((err) => reject(err))
      .then((token) => resolve(token ? token : ""));
  });
}

export function resetIdleTimer(store:RegisterState) {
  if (store.idleTimer) clearTimeout(store.idleTimer)
  store.idleTimer=setTimeout(()=>{showCancleReceipt(store)},store.idle_timeout,store)
}
function showCancleReceipt(store: RegisterState) {
  // FIXME: show Dialog
  cancelReceipt(store); store.mms.receipt=null;
}

export function addItem(barcode: string, store: RegisterState) {
  resetIdleTimer(store); 
  store.loading=true;
  addProductItem(barcode, store)
    .then((result: any) => {
      store.mms.receipt = result;
      store.loading=false;
    })
    .catch((err: any) => {
      store.loading=false;
      if (err.message.includes("code 404")) {
        err.message=`${err.message} - EAN: '${barcode}'`
      }
      SetError(
        store,
        err,
        new Map([
          [ErrorType.E_NETWORK, 8],
          [ErrorType.E_UNAVAILABLE, 9],
          [ErrorType.E_NOTFOUND, 10],
          [ErrorType.E_UNAUTHORIZED, 11],
          [ErrorType.E_DEPENDENCY, 14],
          [ErrorType.E_MAX_ARTICLE_COUNT, 19],
        ])
      );
    });
}

export function stornoItem(item: object, store: RegisterState) {
  store.loading=true;
  stornoProductItem(item, store)
    .then((result: any) => {
      store.mms.receipt = result;
      store.loading=false;
    })
    .catch((err: any) => {
      store.loading=false;
      SetError(
        store,
        err,
        new Map([
          [ErrorType.E_NETWORK, 8],
          [ErrorType.E_UNAVAILABLE, 9],
          [ErrorType.E_NOTFOUND, 9],
          [ErrorType.E_UNAUTHORIZED, 11],
        ])
      );
    });
}

export function closeInvoice(store: RegisterState) {
  store.mms.receipt = null;
  store.invoice.receiptCode = null;
  clearTimeout(store.invoice.idleTimer);
  resetIdleTimer(store);
}


export function cancelReceipt(store: RegisterState): Promise<string> {
  return new Promise((resolve, reject) => {
    store.loading=true;
    if (!store.mms.receipt) resolve("OK"); // if there is no receipt we can't cancel it
    closeReceipt("cancelled", store)
      .catch((err) => {
        store.loading=false;
        SetError(
          store,
          err,
          new Map([
            [ErrorType.E_NETWORK, 8],
            [ErrorType.E_UNAVAILABLE, 9],
            [ErrorType.E_NOTFOUND, 9],
            [ErrorType.E_UNAUTHORIZED, 11],
          ])
        );
        reject(err);
      })
      .then(() => {
        store.loading=false;
        resolve("OK");
      });
  });
}

