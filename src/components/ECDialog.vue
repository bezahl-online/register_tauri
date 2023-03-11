<template lang="pug">
Modal(v-show="isModalVisible")
  template(#header)
    div.header {{ name }}
  template(#body) 
    div.Vorgang
      div.info(:class="{ success: result == 'success', abort: result == 'abort' }") {{ message }}
  template(#footer)
    button.buttonAbort(:disabled="abortBtn" @click="emit('abort')" v-if="store.pt.payment.state == 'pending'") abbrechen
</template>

<script setup lang="ts">
// @ts-ignore
import Modal from "./Modal.vue";
import { PTabort } from "./Payment";
import { inject } from "vue";
import type { RegisterState } from "../store/store";
import { ref } from 'vue'
const props = defineProps({
  isModalVisible: Boolean,
  name: String,
  message: String,
  result: String,
  abortBtn: Boolean,
});

const emit = defineEmits(['abort'])

const store: RegisterState = inject("store")
</script>

<style scoped>
.header {
  color: #1e2549;
  font-size: var(--dialog-message-font-size);
  width: 100%;
  padding: 0.5rem;
  background: url("../assets/EC.svg") no-repeat;
  background-repeat: no-repeat;
  background-position: left;
  background-size: contain;
  text-align: right;
}
.Vorgang {
  height: 10rem;
  width: 50rem;
  display: flex;
  justify-content: center;
}
.info {
  color: #1e2549;
  font-size: var(--dialog-info-font-size);
  text-align: center;
  /* justify-content: center; */
}
.success {
  color: var(--dialog-color-success);
  font-weight: bold;
}
.abort {
  color: var(--dialog-color-abort);
  font-weight: bold;
}
.buttonAbort {
  grid-column: 2;
  background: var(--button-background-color);
  color: inherit;
  color: inherit;
  font-size: var(--button-font-size);
  font-weight: bold;
  width: 100%;
  height: var(--button-height);
}
</style>
