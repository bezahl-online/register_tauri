<script setup lang="ts">
import type { RegisterState } from "../store/store";
import { getDateFromTimestamp, getTimeFromTimestamp } from "../tools"
import { inject, ref } from "vue";
import { logdb } from "../store/logdata";
import Modal from "./Modal.vue";
const errorDetail=ref()
//@ts-ignore
const store: RegisterState = inject("store");
function errorDetailNow(data){
  errorDetail.value=JSON.stringify(JSON.parse(data),undefined,3)
}
</script>
<template lang="pug">
Modal(v-show="true")
  template(#header)
    .header Fehlerliste
  template(#body)
    .list
        .errorLine(v-for="err in store.errorList" @click="errorDetailNow(err.error)")
            .errDate {{ getDateFromTimestamp(err.timestamp/1000) }} 
            .errTime {{ getTimeFromTimestamp(err.timestamp/1000) }} 
            .errText {{ err.message }}
    Modal(v-if="errorDetail")
      template(#header)
      template(#body)
        pre.errorDetail {{ errorDetail }}
      template(#footer)
        button.buttonClose(@click="errorDetail=null") Schließen
  template(#footer)
    button.buttonClose(@click="store.errorList=[]") Schließen
</template>
<style scoped>
.header {
  color: #1e2549;
  font-size: var(--dialog-message-font-size);
  width: 100%;
  padding: 8px;
  background-repeat: no-repeat;
  background-position: left;
  background-size: contain;
  text-align: center;
}

.list{
  height: 1470px;
  overflow-y: scroll;
  font-size: 35px;
}
.errorDetail{
  height: 1500px;
  width: 900px;
  overflow-y: scroll;
  font-size: 35px;
  line-height: 1.5;
  word-wrap: break-word;
  padding: 20px;
}
.errorLine {
  display: flex;
  /* gap: 2px; */
  height: 60px;
}
.errDate {
  width: 160px;
  text-align: right;
}
.errTime {
  width: 150px;
  text-align: center;
}
.errText {
  width: 590px;
  white-space: nowrap;
  overflow: hidden;
}
.buttonClose {
  grid-column: 2;
  background: var(--button-background-color);
  color: inherit;
  font-size: var(--button-font-size);
  font-weight: bold;
  width: 100%;
  height: var(--button-height);
}

</style>