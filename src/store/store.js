import { reactive } from "vue";

const headerStore = reactive({
    hide: false,
    filter: null,
    search: null
});

const telegramStore = reactive({
    webApp: null
})

export { headerStore, telegramStore }