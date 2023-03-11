<template lang="pug">
div(class="modal-backdrop" @click="emit('close')")
  div.modal(role="dialog"
    aria-labelledby="modalTitle"
    aria-describedby="modalDescription")
    header.modal-header(id="modalTitle")
      slot(name="header")
    section.modal-body(id="modalDescription")
      slot(name="body")
    footer.modal-footer
      slot(name="footer")
</template>

<script setup>
const emit=defineEmits(['close'])

</script>

<style>

  .modal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--backdrop-color);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal {
    background: var(--default-background-color);
    box-shadow: 2px 4px 20px 4px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    border-radius: .8rem;
  }

  .modal-header,
  .modal-footer {
    padding: 15px;
    display: flex;
  }

  .modal-header {
    border-bottom: 1px solid #eeeeee;
    color: #4AAE9B;
    justify-content: space-between;
  }

  .modal-footer {
    border-top: 1px solid #eeeeee;
    justify-content: flex-end;
  }

  .modal-body {
    position: relative;
    padding: 20px 10px;
  }

  .btn-close {
    border: none;
    font-size: 20px;
    padding: 20px;
    cursor: pointer;
    font-weight: bold;
    color: #4AAE9B;
    background: transparent;
  }

</style>