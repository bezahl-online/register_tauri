<template lang="pug">
Register  
</template>

<script setup lang="ts">
// @ts-ignore
import Register from "./components/Register.vue";
import { provide, reactive } from "vue";
import type { RegisterState } from "./store/store";
import { store } from "./store/store";
import { authenticate } from "./components/Register";
import { getRegisterConfig } from "./mmsapi";
import { ErrorType, SetError } from "./components/Error";

provide<RegisterState>("store", store as RegisterState);
authenticate(store).then(() => {
  getRegisterConfig(store).then(() => {
  }).catch((err) => console.dir(err));
}).catch(err => {
  console.log("register not initialize")
  SetError(
    store,
    err,
    new Map([
      [ErrorType.E_NETWORK, 8],
      [ErrorType.E_UNAVAILABLE, 11],
      [ErrorType.E_NOTFOUND, 11],
      [ErrorType.E_DEPENDENCY, 14]
    ])
  );
});
</script>
<style>
@import "style.css";
</style>
