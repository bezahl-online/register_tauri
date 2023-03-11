// client for payment terminal API

import axios from "axios";
import { RegisterState } from "./store/store";

export function getRemoteInvoiceURI(store: RegisterState) {
  if (store.invoice.receiptCode) {
    return `${store.invoice.remote}${store.invoice.receiptCode}`;
  }
  return "";
}

export function getLocalInvoiceURI(store: RegisterState) {
  if (store.invoice.receiptCode) {
    return `${store.invoice.local}${store.invoice.receiptCode}#toolbar=0&navpanes=0&scrollbar=0`;
  }
  return "";
}

export function printInvoice(store: RegisterState): Promise<any> {
  return new Promise((resolve, reject) => {
    post(
      "/print",
      {
        pdf_url: getRemoteInvoiceURI(store),
      },
      store.printUrl
    )
      .then(() => {
        resolve("OK");
      })
      .catch((err) => {
        reject(err);
        console.dir(err);
      });
  });
}

function post(path: string, data: object, url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    axios
      .post(`${url}${path}`, data)
      .then((result) => {
        console.dir(result);
        resolve(result);
      })
      .catch((err) => {
        console.dir(err);
        reject(err);
      });
  });
}
