<template lang="pug">
div.receipt(v-if="store.mms.receipt")
    div.receiptitems
        div.items_grid.item(v-for="(item,key) in store.mms.receipt.itemlist" :key="key" )
          template(v-if="item.qty>0")
            div.ximg(@click='emit("itemstorno",item)')
            div(:class="[item.qty>1 ? 'qtymore' : '']") {{ item.qty }}
            div.prodName {{ item.product.name }}
            div {{ (item.price/100).toFixed(2) }}
            div {{ (item.total/100).toFixed(2) }}
    div.footer
        div.totals(v-if="store.mms.receipt.total.price")
            div Ihr Greißlomat PREIS:
            div EUR
            div {{ (store.mms.receipt.total.price/100).toFixed(2) }}
div.receipt(v-else)
    div.noreceipt
        div.please Bitte Ware scannen!
        img.scann(src="../assets/Scan.svg")
</template>

<script setup lang="ts">
import { inject } from "vue";
import type { RegisterState } from "../store/store";

const store = inject<RegisterState>("store");

const emit = defineEmits(["itemstorno"]);
// function squeeze(k) {
//     let x=props.r.itemlist.length
//     let h=1-(1/(1*x+1))/(k+1)
//     return `transform: scale(1,${h}); height: ${h+.5}rem`
// }


</script>

<style scoped>
@import "Receipt.css"
</style>
