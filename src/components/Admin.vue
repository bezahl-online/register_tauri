<template lang="pug">
Modal(v-show="isModalVisible")
  template(#header)
    .header Administration
  template(#body) 
    .functions
      button.EndOfDay(@click="errorList") Fehlerliste <br/>
      button.EndOfDay(@click="reload") Reload <br/>
      button.EndOfDay(@click="startEndOfDay(store)") Tagesabschluss <br/>
      button(@click="zeroreceipt") Nullbeleg <br/>
  template(#footer)
    button.buttonAbort(@click="emit('close')") schließen
    teleport(to="#endofbody")
      Modal(v-show="displayRKSVQR")
        template(#body)
          .rksv_qr
            qr(:content="getRKSVRep()")
        template(#footer)
          .buttons(style="width: 100%")
            button(@click="hideQR") Schließen
      ECDialog(
        v-show="store.pt.endofday.message ? true : false",
        :name="'Tagesabschluss'",
        :message="message()",
        :result="resultState",
        :abortBtn="abortButton"
      )
</template>

<script setup lang="ts">
import type { RegisterState } from "../store/store";
import qr from "./QRCode.vue";
import { inject, ref } from "vue";
import { newReceipt, closeReceipt } from "../mmsapi";
import { startEndOfDay } from "./Admin";
import { ReceiptType } from "../model/mms/receiptType";
import type { Receipt } from "../model/mms/receipt";
import { decode as base64URLdecode } from "universal-base64url";
import { decode, encode } from "universal-base64";
import { logdb } from "../store/logdata";
import Modal from "./Modal.vue";
import ECDialog from "./ECDialog.vue";
const props = defineProps({
  isModalVisible: Boolean,
  receipt: Object,
});
function reload() {
  location.reload();
}
//@ts-ignore
const store: RegisterState = inject("store");
let resultState = ref("");
let abortButton = ref(false);
let functionName = ref("Admin Function");
let displayRKSVQR = ref(false);
const emit = defineEmits(["success", "abort", "close", "pending"]);
// let transactionData;

function errorList() {
  logdb.getAll(store.errorList);
}

function hideQR() {
  displayRKSVQR.value = false;
  store.mms.receipt = null;
}

function zeroreceipt() {
  newReceipt(ReceiptType.Zero, store)
    .catch((err) => {
      console.log(err); // FIXME: error dialog!
      closeReceipt("abort", store);
      store.mms.receipt = null;
    })
    .then((result: Receipt | any) => {
      store.mms.receipt = result ? result.data : null;
      displayRKSVQR.value = true;
      closeReceipt("payed", store);
    });
}

function getRKSVRep() {
  if (!displayRKSVQR.value) return "";
  if (store.mms.receipt) {
    //@ts-ignore
    var payment = store.mms.receipt.payments[0];
    var jwt = payment.rksv_jwt ? payment.rksv_jwt : "";
    var payload_enc = jwt.split(".")[1];
    var payload = base64URLdecode(payload_enc);
    var signing_enc = jwt.split(".")[2];
    // FIXME: atob / btoa
    var signing = atob(signing_enc.replace(/\-/g, "+").replace(/_/g, "/"));
    var signingBase64 = btoa(signing);
    return `${payload}_${signingBase64}`;
  }
}

function message() {
  let m = store.pt.endofday.message;
  if (store.pt.endofday.info) {
    m += "\n" + store.pt.endofday.info;
    console.log(m);
  }
  return m;
}
</script>

<style scoped>
@import "./Admin.css";
</style>
