<template lang="pug">
Modal(v-show="true")
  template(#header)
    div.header Rechnung
  template(#body)
    div.pdf(id="pdfdiv" v-if="true")
      embed(:src="getLocalInvoiceURI(store)")
      Modal(v-show="displayInvoiceQR")
        template(#body)
          div.invoice_qr
            qr(:content="getRemoteInvoiceURI(store)")
        template(#footer)
          div.buttons
            button(@click='hideQR') Schließen

  template(#footer)
    div.buttons
      button(@click="printPDF") Drucken
      button(@click="showQR") Download
      button(@click='closeInvoice(store)') Schließen
  template

</template>
<script setup lang="ts">
// @ts-ignore
import Modal from "./Modal.vue";
import { inject, ref } from "vue";
import { printInvoice, getRemoteInvoiceURI, getLocalInvoiceURI } from "../printapi";
import qr from "./QRCode.vue";
import type { RegisterState } from "../store/store";
import { closeInvoice } from "./Register"
const store = inject<RegisterState>("store");
const displayInvoiceQR = ref(false);

function printPDF() {
  printInvoice(store)
    .catch(err => {
      store.error = {
        nr: 17,
        err: null,
      }
    })
    .then(() => {
      // store.error = { // just don't
      //   nr: 901,
      //   err: null,
      // }
      closeInvoice(store);
    });
}

function showQR() {
  displayInvoiceQR.value = true;
}

function hideQR() {
  displayInvoiceQR.value = false;
}

// function closeInvoice() {
//   store.mms.receipt = null;
//   store.invoice.receiptCode = null;
// }

</script>

<style scoped>
@import "Invoice.css";
</style>
