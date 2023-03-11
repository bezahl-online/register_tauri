
<script setup lang="ts">
import axios, { AxiosResponse } from "axios";
import { inject } from "vue";
import type { RegisterState } from "../store/store";
import { ErrorType, setDeviceState, SetError } from "./Error";
import type { Customer } from "../model/mms/customer";
import CustomerAccountVue from "./CustomerAccount.vue";
import {
  getCustomerAccount,
  getCustomerAccountBalance,
  getCreditAccountLines,
} from "../mmsapi";
const store = inject<RegisterState>("store");
const DELAYDURATION = 500;
const WAITFORRECONNECTTIME = 10000;
const WAITTIME = 2000;
let delay = DELAYDURATION;
function getRFID(store: RegisterState) {
  axios
    .get(store.rfidURL)
    .then(async (result: AxiosResponse<string | any>) => {
      setDeviceState(store, "rfid", 0);
      store.loading = true;
      var key_uid: number = result.data;
      console.log(`keyUid: '${key_uid}'`);
      if (key_uid && key_uid > 0) {
        store.error = null;
        try {
          await getCustomerAccount(store, key_uid);
          console.log(`customer ID: ${store.customer.account.id}`);
          if (store.customer.account && store.customer.account.type != 'admin') {
            await getCustomerAccountBalance(store, store.customer.account.id);
            if (store.customer.account.type != 'admin') {
              store.customer.countdown = 5
              if (store.mms.receipt && store.customer.balance*100 >= store.mms.receipt.total.price) {
                store.customer.countdown_interval = setInterval(() => {
                  console.log(store.customer.countdown)
                  if (store.customer.countdown > 0) store.customer.countdown--;
                  else clearInterval(store.customer.countdown_interval)
                }, 1000)
              }
            }
            await getCreditAccountLines(store, store.customer.account.id);
          }
        } catch (err) { // TODO: send error as register status
          console.log(`no customer found for key uid "${key_uid}"`);
        }
      } else {
        delay = DELAYDURATION;
        store.customer.account = null;
      }
      store.loading = false;
      getRFID(store);
    })
    .catch(async (err) => {
      store.loading = false;
      if (!store.devices.rfid) {
        setDeviceState(store, "rfid", 1);
        store.customer.account = null;
        if (!store.error) {
          SetError(
            store,
            err,
            new Map([
              [ErrorType.E_NETWORK, 26],
              [ErrorType.E_NOTFOUND, 21],
            ])
          );
        }
      }
      delay = WAITFORRECONNECTTIME;
      await wait(delay);
      getRFID(store);
    });
}

function wait(delay: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}
async function start() {
  while (!store.registerID) {
    await wait(100);
  }
  console.log("listening to RFID");
  getRFID(store);
}
start();
</script>
<template lang="pug">
</template>