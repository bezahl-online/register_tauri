<script setup lang="ts">
import Modal from "./Modal.vue";
import { inject, watchEffect } from "vue";
import type { RegisterState } from "../store/store";
import { newCreditAccountLine } from "../mmsapi";
import type { CreditAccountLine } from "../model/mms/creditAccountLine";
import { PaymentType } from "../model/mms/paymentType";
import type { PaymentCustomerAccount } from "../model/mms/paymentCustomerAccount";
import { getDateFromTimestamp, getTimeFromTimestamp } from "../tools"
const emit = defineEmits(["close", "payment_success"]);
const props = defineProps({
  isModalVisible: Boolean,
  name: String,
  message: String,
  result: String,
});

function payButtonText(store) {
  if (payButtonDisabled(store)) {
    return "nicht genügend Guthaben";
  }
  return `<big>${getTotal()}</big> wird automatisch vom Guthaben abgezogen!`;
}

function getTotal() {
  if (!store.mms.receipt) return "---,--";
  var price = store.mms.receipt.total.price / 100;
  var str = "€ " + price.toFixed(2);
  return str.replace(".", ",");
}

function payButtonDisabled(store: RegisterState) {
  return store.customer.balance * 100 < store.mms.receipt.total.price;
}

function payWithCredit(store: RegisterState) {
  if (store.customer.countdown_interval)
    clearInterval(store.customer.countdown_interval);
  if (store.customer.paying) return;
  store.customer.paying = true;
  console.dir(store.customer)
  var line: CreditAccountLine = {
    customer_id: store.customer.account.id,
    amount: -store.mms.receipt.total.price,
    text: store.mms.receipt.code,
    receiptcode: store.mms.receipt.code,
  };
  newCreditAccountLine(store, line)
    .then((result) => {
      store.invoice.payment_type = PaymentType.Credit;
      var payment: PaymentCustomerAccount = {
        customer_id: line.customer_id,
        amount: -line.amount,
      };
      store.customer.payment = payment;
      emit("payment_success");
    })
    .catch((err) => {});
}

function getBalance() {
  if (!store.customer.balance) return "---,--";
  var str = "" + store.customer.balance.toFixed(2);
  return str.replace(".", ",");
}

function closeCustomer() {
  emit("close");
}

function stopPayment() {
  clearInterval(store.customer.countdown_interval);
  store.customer.account = null;
}

const store: RegisterState = inject("store");

watchEffect(() => {
  if (store && store.customer && store.customer.countdown == 0) {
    if (store.customer.countdown_interval)
      clearInterval(store.customer.countdown_interval);
    if (store.customer.countdown == 0 && store.customer.countdown_interval) {
      store.customer.countdown_interval=null;
      store.customer.countdown=null;
      payWithCredit(store);
    }
  }
});
</script>

<template lang="pug">
Modal(v-if="store.customer.account && store.customer.account.type!='admin'") 
  template(#header)
    .header {{ name }}
  template(#body)
    .Konto(v-if="store.customer.account")
      .details
        .card
          .line Schlüssel Nr.  
            div {{ store.customer.account.id }}
          .line Kontostand: EUR
            .bold {{ getBalance() }}
        .card
          div {{ store.customer.account.address.postal.name }}
          div {{ store.customer.account.address.postal.street }}
          div {{ store.customer.account.address.postal.zip }} {{ store.customer.account.address.postal.city }}
      .account(v-if="store.customer.creditLines")
        .accountHead
          .lineDate(style="text-align:center") Datum
          .lineTime Zeit
          .lineText Text
          .lineAmount Betrag
        .lines 
          .accountLine(v-for="(line,key) in store.customer.creditLines" :key="key" )
            .lineDate {{ getDateFromTimestamp(line.timestamp) }} 
            .lineTime {{ getTimeFromTimestamp(line.timestamp) }} 
            .lineText {{ line.text }} 
            .lineAmount(:class="[line.amount < 0 ? 'lineAmountRed' : '']") {{ (line.amount/100).toFixed(2) }}
    Modal(v-if="store.mms.receipt")
      template(#header)
        .zheader Zahlung mit Guhaben
      template(#body)
        .options
          .zahlen( 
            v-html="payButtonText(store)")
      template(#footer style="background:yellow")
        button.buttonPay(@click="payWithCredit(store)" v-if="!payButtonDisabled(store)"
          :disabled="store.customer.paying || payButtonDisabled(store)"
          ) {{ store.customer.countdown }}
        button.buttonCancel(@click="stopPayment") Abbrechen
  template(#footer)
    button.buttonClose(@click="closeCustomer") schließen
    
</template>

<style scoped>
@import "./CustomerAccount.css";
</style>
