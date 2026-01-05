import { reactive } from "vue";

const headerStore = reactive({
    hide: false,
    filter: window.localStorage.getItem("filter") ? JSON.parse(window.localStorage.getItem("filter")) : null,
    search: null
});

const telegramStore = reactive({
    webApp: null
})

export { headerStore, telegramStore }