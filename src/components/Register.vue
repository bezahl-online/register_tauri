<template lang="pug">
.register
  Payment.payment(
    :isModalVisible="paymentVisible"
    :payName="paymentName"
    @close="closePayment"
    @success="PTPaymentSuccess()"
    @pending=""
    @need_eod="startEndOfDay(store)"
    @abort="showAbort()"
  )
  Admin(:isModalVisible="store.customer.account && store.customer.account.type=='admin'"
    @close="closeAdmin").admin
  Storno.stornoModal(:isModalVisible="stornoModalVisible" @close="closeStorno" @storno="startCancelReceipt")
  ArticleButtons
  Receipt.receipt(@itemstorno="itemStorno")
  div.buttons
    //- button.hilfe(@click="admin") Hilfe
    //- button.storno(@click="showStorno" :disabled="buttonsDisabled") Storno
    //- button.zahlendisabled(@click="showPayments" :disabled="true")     
    //-   .buttontext2 andere Zahlung
    button.zahlen(id="bankomat" @click="startEC" :disabled="buttonsDisabled") 
      .buttontext Kartenzahlung
  div.version v1.2.3 build 12161550
  Scanner
  RFID
  teleport(to="#endofbody")
    ECDialog(
      v-show="store.pt.payment.message ? true : false"
      @abort="abortPayment(store)"
      :name="'Bankomat-Zahlung'" 
      :message="message()"
      :result="resultState" 
      :abortBtn="disableAbortButton")
  teleport(to="#endofbody")
    ErrorList(v-if="store.errorList.length>0")
  teleport(to="#endofbody")
    CustomerAccount(
      v-show="store.customer.account ? true : false"
      :name="'Kundenkonto'" 
      :result="resultState" 
      @close="closeCustomer"
      @payment_success="CreditPaymentSuccess()")
  teleport(to="#endofbody")
    Error
  teleport(to="#endofbody")
    Invoice.invoice(v-if="store.invoice.receiptCode")
    transition(name="fade")
      orbit-spinner.spinner(v-show="spinnerVisible"
        :animation-duration="1000"
        :size="400"
        color="#0038a0") 
</template>

<script setup lang="ts">
// FIXME: Invoice - print mulitple pages - design?

// reactive variables
import { ref, watchEffect, watch, inject } from "vue";

// Components
import ArticleButtons from "./ArticleButtons.vue";
import Receipt from "./Receipt.vue";
import Scanner from "./Scanner.vue";
import RFID from "./RFID.vue";
import Payment from "./Payment.vue";
import Storno from "./Storno.vue";
import Error from "./Error.vue";
import Invoice from "./Invoice.vue";
import Admin from "./Admin.vue";
import ECDialog from "./ECDialog.vue";
import CustomerAccount from "./CustomerAccount.vue";

// Modules
import { stornoItem, cancelReceipt, closeInvoice, resetIdleTimer } from "./Register";
import { ErrorType, SetError } from "./Error";
import {
  addCustomerAccountPaymentDB,
  addPaymentDB,
  closeReceipt,
  newReceipt,
} from "../mmsapi";
import { sendRegisterStatus } from "../mmsapi";
import { startEndOfDay } from "./Admin";
import type { RegisterState } from "../store/store";
import { CronJob } from "cron";
import { PTabort, PTinit, PTstart } from "./Payment";
import { PtResult } from "../model/pt/registerCompletionResponse";
import { PaymentType } from "../model/mms/paymentType";
import { ReceiptType } from "../model/mms/receiptType";
import ErrorList from "./ErrorList.vue";
import { OrbitSpinner } from "epic-spinners";
import { useSpinner } from "./useSpinner";

const spinner = useSpinner();
const spinnerVisible = spinner.visible;
const paymentVisible = ref(false);
const buttonsDisabled = ref(false);
const stornoModalVisible = ref(false);

//@ts-ignore
const store: RegisterState = inject<RegisterState>("store");

const paymentName = ref("");
const ecPayment = ref(false);
const resultState = ref("");
const disableAbortButton = ref(false);
// store.soundEffect = new SoundEffect();
watchEffect(() => {
  buttonsDisabled.value = !(
    store.mms.receipt &&
    store.mms.receipt.itemlist &&
    store.mms.receipt.itemlist.length > 0
  );
});

function itemStorno(item: object): void {
  // store.soundEffect.Sniff.play();
  stornoItem(item, store);
}

watch(store.devices, () => {
  sendTheStatus();
});

function sendTheStatus() {
  sendRegisterStatus(store);
}

function closePayment() {
  paymentVisible.value = false;
  // store.soundEffect.KeyPress.play();
  resetIdleTimer(store);
}

function closeStorno() {
  stornoModalVisible.value = false;
}

function showPayments() {
  clearTimeout(store.idleTimer);
  store.pt.idleTimer = setTimeout(
    () => {
      closePayment();
    },
    store.pt.idle_timeout,
    store
  );
  paymentVisible.value = true;
  // store.soundEffect.KeyPress.play();
}

function abortPayment(store) {
  PTabort(store);
  disableAbortButton.value = true;
}

function showStorno() {
  stornoModalVisible.value = true;
  // store.soundEffect.KeyPress.play();
}

function closeCustomer() {
  clearTimeout(store.customer.idleTimer);
  store.customer.account = null;
  store.customer.creditLines = null;
  store.customer.balance = null;
  store.customer.paying = false;
}

// FIXME: duplicate in Payment.vue
function PTPaymentSuccess(): void {
  addPaymentDB(store.pt.payment.transactionData, store)
    .catch((err) => {
      SetError(
        store,
        err,
        new Map([
          [ErrorType.E_NETWORK, 8],
          [ErrorType.E_UNAVAILABLE, 9],
          [ErrorType.E_NOTFOUND, 9],
          [ErrorType.E_CONFLICT, 9],
          [ErrorType.E_UNAUTHORIZED, 11],
        ])
      );
    })
    .then((result) => {
      closeReceipt("payed", store).catch((err) => {
        console.dir(err);
        SetError(
          store,
          err,
          new Map([
            [ErrorType.E_NETWORK, 8],
            [ErrorType.E_UNAVAILABLE, 9],
            [ErrorType.E_NOTFOUND, 9],
            [ErrorType.E_CONFLICT, 9],
            [ErrorType.E_UNAUTHORIZED, 11],
          ])
        );
      });
      if (store.mms.receipt) store.invoice.receiptCode = store.mms.receipt["code"];
      store.mms.receipt = null;
      store.invoice.idleTimer = setTimeout(
        (store) => {
          closeInvoice(store);
        },
        store.invoice.idle_timeout,
        store
      );
      store.pt.payment.transactionData = null;
      paymentVisible.value = false;
      // store.soundEffect.Success.play();
    });
}

function CreditPaymentSuccess(): void {
  // @ts-ignore
  addCustomerAccountPaymentDB(store.customer.payment, store)
    .catch((err) => {
      SetError(
        store,
        err,
        new Map([
          [ErrorType.E_NETWORK, 8],
          [ErrorType.E_UNAVAILABLE, 9],
          [ErrorType.E_NOTFOUND, 9],
          [ErrorType.E_CONFLICT, 9],
          [ErrorType.E_UNAUTHORIZED, 11],
        ])
      );
    })
    .then((result) => {
      closeReceipt("payed", store).catch((err) => {
        console.dir(err);
        SetError(
          store,
          err,
          new Map([
            [ErrorType.E_NETWORK, 8],
            [ErrorType.E_UNAVAILABLE, 9],
            [ErrorType.E_NOTFOUND, 9],
            [ErrorType.E_CONFLICT, 9],
            [ErrorType.E_UNAUTHORIZED, 11],
          ])
        );
      });
      if (store.mms.receipt) store.invoice.receiptCode = store.mms.receipt["code"];
      store.mms.receipt = null;
      store.invoice.idleTimer = setTimeout(
        (store) => {
          closeInvoice(store);
        },
        store.invoice.idle_timeout,
        store
      );
      store.customer.account = null;
      store.customer.creditLines = null;
      store.customer.balance = null;
      store.customer.paying = false;
      paymentVisible.value = false;
      // store.soundEffect.Success.play();
    });
}

function showAbort() {
  resetIdleTimer(store);
  paymentVisible.value = false;
  // store.soundEffect.Loose.play();
}

function resetRegister() {
  cancelReceipt(store)
    .catch((err) => {})
    .then(() => {});
  paymentVisible.value = false;
  stornoModalVisible.value = false;
}
function startCancelReceipt() {
  cancelReceipt(store)
    .then(() => {})
    .catch((err) => {});
  store.mms.receipt = null;
  // store.soundEffect.Throw.play();
}

const adminCount = ref(0);
const adminHandler = ref();
const adminTimeout = 800;
const adminVisible = ref(false);

const lastHeartBeat = ref(Date.now());

function admin() {
  if (adminHandler.value) {
    clearTimeout(adminHandler.value);
  }
  adminHandler.value = setTimeout(() => {
    adminCount.value = 0;
    // console.log("adminCount reset");
  }, adminTimeout);
  // console.log(adminCount.value);
  if (++adminCount.value > 8) {
    adminVisible.value = true;
  }
}

function closeAdmin() {
  store.customer.account = null;
}
var job1: CronJob | null = null;
var job2: CronJob | null = null;
var job3: CronJob | null = null;
function initCron() {
  job1 = new CronJob(
    "0 0 0 * * *",
    // @ts-ignore
    function () {
      startTheEndOfDay();
    },
    null,
    true,
    "Europe/Vienna"
  );
  job2 = new CronJob(
    "*/15 * * * *",
    // @ts-ignore
    function () {
      sendTheStatus();
    },
    null,
    true,
    "Europe/Vienna"
  );
  job3 = new CronJob(
    "0 0 0 1 * *",
    // @ts-ignore
    function () {
      newReceipt(ReceiptType.Zero, store);
    },
    null,
    true,
    "Europe/Vienna"
  );
}

function startTheEndOfDay() {
  startEndOfDay(store);
}
initCron();
// function startCron(store: RegisterState) {

//   var HEART_BEAT_DURATION = store.heartBeatDuration;
//   setInterval(function () {
//     let now = Date.now();
//     if (lastHeartBeat.value - now < HEART_BEAT_DURATION * 60 * 1000) {
//     }
//   }, store.cronIntervalMinutes * 1000);
// }
// startCron(store);

// TODO: create some statistical meaningfull information
// (like uptime, interactions, sales, ..) to be sent regularly

// FIXME: duplicate in Payment.vue
function startEC() {
  // TODO: prime sign heath check (see API doc 2.5.2.)
  clearTimeout(store.idleTimer);
  store.pt.busy = true;
  paymentName.value = "Bankomat-Zahlung";
  store.invoice.payment_type = PaymentType.Ec;
  PTstart(store)
    .then((result) => {
      if (result.transaction.result) {
        switch (result.transaction.result) {
          case PtResult.Success:
            PTPaymentSuccess();
            store.devices.pt = 0;
            break;
          case PtResult.Abort:
            store.devices.pt = 0;
            showAbort();
            break;
          case PtResult.NeedEndOfDay:
            startEndOfDay(store);
        }
      }
      store.pt.busy = false;
      PTinit(store);
    })
    .catch((err) => {
      store.devices.pt = 1;
      if (err == PtResult.NeedEndOfDay) {
        // FIXME: should be "SoftwareUpdate"
        store.error = {
          nr: 5,
          err: null,
        };
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
@import "Register.css";
</style>
