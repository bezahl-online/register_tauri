<template lang="pug">
Modal(v-show="isModalVisible" @close="emit('close')")
    template(#header) 
      div.header Bon stornieren
    template(#body) 
        div.body
            button.button.back(@click="emit('close')") zurück
            button.button.yes(@click="emit('storno')") JA stornieren
</template>
<script setup>
import Modal from "./Modal.vue";
const emit = defineEmits(["close", "storno"]);
defineProps({
  isModalVisible: Boolean,
});
</script>

<style scoped>
@import "Storno.css";
</style>
