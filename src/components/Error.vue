<template lang="pug">
Modal(v-show="store.error ? true : false" @click="closeError(store)")
  template(#header)
    p.error_header ACHTUNG
  template(#body)
    div.error {{ errorMessage() }}
  template(#footer)
    button.buttonOK OK      
</template>

<script setup lang="ts">
import { inject } from "vue";
import type { RegisterState } from "../store/store";
// @ts-ignore
import Modal from "./Modal.vue";
import { Error } from "./Error";

const store = inject<RegisterState>("store");

function closeError(store: RegisterState) {
  store.error = null
  clearTimeout(store.errorIdleTimer)
}

function errorMessage() {
  if (!store.error) return "";
  let mes = Error.get(store.error.nr);
  var message = mes ? mes : "Unbekannter Fehler";
  return message;
}
</script>

<style scoped>
.error {
  /* height: 10rem; */
  width: 50rem;
  display: flex;
  justify-content: center;
  text-align: center;
  font-size: var(--message-font-size);
}
.error_header {
  color: var(--error-color-header);
  font-weight: bold;
  font-size: var(--header-font-size);
  margin: auto;
}
.buttonOK {
  grid-column: 2;
  background: var(--button-background-color);
  color: inherit;
  color: inherit;
  font-size: var(--button-font-size);
  font-weight: bold;
  width: 100%;
  height: 6rem;
  border-radius: 0.8rem;
}
</style>
