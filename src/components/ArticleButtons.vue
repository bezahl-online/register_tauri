<template lang="pug">
.articles
  template(v-for="button in store.buttons")
    button.buttons(@click.stop='newCode(button.article)') {{ button.name }}
</template>
<script setup lang="ts">
import { inject} from "vue"
import type { RegisterState } from "../store/store";
import { addItem } from "./Register";

const store=inject<RegisterState>("store")
function  newCode(code: string) {
  addItem(code,store)
  // store.soundEffect.KeyPress.play()
}
</script>

<style scoped>
.articles {
  grid-row: 2;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  flex-wrap: wrap;
  gap: 20px;
}

.articles button {
  background: #ffe2a2;
  font-size: xx-large;
  font-weight: bold;
  width: 20rem;
  height: 8rem;
}

</style>
