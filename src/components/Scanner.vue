<template lang="pug">
</template>

<script setup lang="ts">
import axios, { AxiosResponse } from "axios";
import { inject, ref } from "vue";
import { addItem, authenticate } from "./Register";
import { enrollRegister, getCompanyData } from "../mmsapi";
import { regdb } from "../store/registerdata";
import { ErrorType, setDeviceState, SetError } from "./Error";
import type { Register } from "../model/mms/register";
import type { RegisterState } from "../store/store";
import type { Company } from "../model/mms/company";

const errorMap = new Map();
errorMap.set(ErrorType.E_NETWORK, 1);

const code = ref("");
const emit = defineEmits(["newbcode"]);
// time in ms to wait before trying to connect again
const DELAYDURATION = 500;
const MAXDELAY = 10000;
const WAITTIME = 2000;
let delay = DELAYDURATION;
let errorSince: Date | null;
let lastCode = "";
let lastCodeSince = new Date();
let sameCodeHold = false;
const store = inject<RegisterState>("store");

const originalConsoleLog = console.log;
console.log = function (message) {
  originalConsoleLog(message);
  // @ts-ignore
  window.__TAURI__.invoke("log_message", { message: message.toString() });
};

function getCode(store: RegisterState) {
  if (store.pt.busy || store.invoice.receiptCode) {
    console.log("payment in progress - no scanning");
    setTimeout(
      (store) => {
        getCode(store);
      },
      1000,
      store
    );
    return;
  }
  axios
    .get(store.gm65Url + "/read")
    .then(async (result: AxiosResponse<string | any>) => {
      setDeviceState(store, "scanner", 0);
      sameCodeHold = false;

      if (result.data.payload.length > 0) {
        if (lastCode == result.data.payload) {
          sameCodeHold = true;
          if (lastCodeSince.getTime() + WAITTIME < new Date().getTime()) {
            sameCodeHold = false;
            lastCodeSince = new Date();
          }
        }
        if (!sameCodeHold) {
          lastCode = result.data.payload;
          lastCodeSince = new Date();
          if (result.data.payload.length == 36) {
            enrollRegister(
              {
                tan: result.data.payload,
                public_key: JSON.stringify(store.auth.publicKey),
              },
              store
            )
              .then((register: Register) => {
                regdb.setRegisterID(register.id, register.name);
                authenticate(store).then((success) => {
                  store.error = {
                    nr: 13,
                    err: null,
                  };
                  getCompanyData(store, register.company_id)
                    .then((company: Company) => {
                      regdb.setCompanyID(company.id, company.name, company.address);
                      location.reload(); // gross but only on the first start necessary
                    })
                    .catch((err) => {
                      SetError(
                        store,
                        err,
                        new Map([
                          [ErrorType.E_NETWORK, 8],
                          [ErrorType.E_UNAVAILABLE, 13],
                          [ErrorType.E_NOTFOUND, 12],
                          [ErrorType.E_DEPENDENCY, 14],
                        ])
                      );
                    });
                });
              })
              .catch((err) => {
                SetError(
                  store,
                  err,
                  new Map([
                    [ErrorType.E_NETWORK, 8],
                    [ErrorType.E_UNAVAILABLE, 13],
                    [ErrorType.E_NOTFOUND, 12],
                    [ErrorType.E_DEPENDENCY, 14],
                  ])
                );
              });
          } else {
            addItem(lastCode, store);
          }
          // store.soundEffect.Plop.play();
        }
      }
      await wait(delay);
      getCode(store);
      delay = DELAYDURATION;
      errorSince = null;
    })
    .catch(async (err) => {
      if (!store.devices.scanner) {
        setDeviceState(store, "scanner", 1);
        if (!errorSince) {
          errorSince = new Date();
        }
        SetError(
          store,
          err,
          new Map([
            [ErrorType.E_NETWORK, 1],
            [ErrorType.E_NOTFOUND, 6],
          ])
        );
      }
      if (delay <= MAXDELAY) {
        delay *= 2;
      }
      await wait(delay);
      getCode(store);
    });
}

// function doEnrollRegister() {

// }

function wait(delay: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

getCode(store as RegisterState);
console.log("listening to scanner");
</script>
