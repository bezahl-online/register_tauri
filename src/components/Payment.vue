<template lang="pug">
Modal(v-show="isModalVisible")
  template(#header)
    div.header Bitte wählen Sie eine Zahlungsart
  template(#body) 
    div.payments
      div.kundenkonto
      //- div.bluecode(@click="startBluecode")
      div.bankomat(@click="startEC")
    //- div.payments
    //-   div.payment3
  template(#footer)
    button.buttonAbort(@click="emit('close')") abbrechen      
</template>

<script setup lang="ts">
// @ts-ignore
import Modal from "./Modal.vue";
// @ts-ignore
import { defineComponent, inject, ref } from "vue";
import type { RegisterState } from "../store/store";
import { PTinit, PTstart } from "./Payment";
import { SetError, ErrorType, setDeviceState } from "./Error";
import { PtResult } from "../model/pt/registerCompletionResponse";
import { resetIdleTimer } from "./Register";
import { PaymentType } from "../model/mms/paymentType";

const props = defineProps({
  isModalVisible: Boolean,
  receipt: Object,
  payName: String,
});

const paymentName = ref(props.payName);
console.log(paymentName.value)
const ecPayment = ref(false);
const resultState = ref("");
const abortButton = ref(false);
const emit = defineEmits(["success", "abort", "close", "pending", "need_eod"]);


const store: RegisterState = inject("store");
// let transactionData;

// FIXME: click button -> PTabort 3 times and code 500



PTinit(store)

function startBluecode() {
  paymentName.value = "bluecode-Zahlung";
  store.pt.payment.message = "Bitte Bluecode scannen";
  store.invoice.payment_type = PaymentType.Bluecode;
}

// initiate by button click
function startEC() {
  // TODO: prime sign heath check (see API doc 2.5.2.)
  store.pt.busy = true;
  paymentName.value = "Bankomat-Zahlung";
  store.invoice.payment_type = PaymentType.Ec;
  PTstart(store)
    .then((result) => {
      setDeviceState(store, "pt", 0)
      if (result.transaction.result) {
        switch (result.transaction.result) {
          case PtResult.Success:
            emit("success", result);
            break;
          case PtResult.Abort:
            emit("abort");
            break;
          case PtResult.NeedEndOfDay:
            emit("need_eod");
        }
      }
      store.pt.busy = false;
      PTinit(store);
    })
    .catch((err) => {
      if (!store.devices.pt) {
        setDeviceState(store, "pt", 1)
        if (err == PtResult.NeedEndOfDay) { // FIXME: should be "SoftwareUpdate"
          store.error = {
            nr: 5,
            err: null,
          }
        } else {
          SetError(
            store,
            err,
            new Map([
              [ErrorType.E_NETWORK, 2],
              [ErrorType.E_UNAVAILABLE, 3],
              [ErrorType.E_CONFLICT, 7],
              [ErrorType.E_UNAUTHORIZED, 11],
              [ErrorType.E_DEPENDENCY, 14],
            ])
          );
        }
      }
      PTinit(store);
      store.pt.busy = false;
    });
}

function message() {
  if (!store.pt.payment.message) return null;
  let m = store.pt.payment.message;
  if (store.pt.payment.info && !store.pt.payment.info.includes(m)) {
    m += "\n" + store.pt.payment.info;
    console.log(m);
  }
  return m;
}
</script>

<style scoped>
@import "Payment.css";
</style>
