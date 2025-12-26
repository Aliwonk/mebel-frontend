import { reactive } from "vue";

const headerStore = reactive({
    hide: false,
    filter: null,
    search: null
});

export { headerStore }