import { ref } from 'vue'
const spinner_visible = ref(false);
export function useSpinner() {
    function show() {
        spinner_visible.value = true;
    }
    function hide() {
        setTimeout(()=>{spinner_visible.value = false;},300);
    }
    return { visible: spinner_visible, show, hide }
}