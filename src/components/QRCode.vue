<template lang="pug">
qrcode-vue(:value="content" :size="size" level="H")
</template>

<script>
import QrcodeVue from "qrcode.vue";

export default {
  data() {
    return {
      value: "",
      size: 300,
    };
  },
  components: {
    QrcodeVue,
  },
  props: {
    content: {
      type: String,
      default: "",
    },
  },
};
</script>
