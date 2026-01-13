const BACKEND_URL = "https://api.mebelmodnostilno.ru/api";
const BACKEND_API = {
    PRODUCT: {
        GET_ONE: `${BACKEND_URL}/product`,
        GET_ALL: `${BACKEND_URL}/product/all`,
        CATALOGS: {
            GET_ONE: `${BACKEND_URL}/product/catalog`,
            GET_ALL: `${BACKEND_URL}/product/catalog/all`
        },
        CATEGORY: {
            GET_ONE: `${BACKEND_URL}/product/category`,
            GET_ALL: `${BACKEND_URL}/product/category/all`
        },
        MANUFACTURER: {
            GET_ONE: `${BACKEND_URL}/product/manufacturer`,
            GET_ALL: `${BACKEND_URL}/product/manufacturer/all`
        }
    },
    STORE: {
        PHONE: {
            GET_ALL: `${BACKEND_URL}/store/phone/all`
        },
        EMAIL: {
            GET_ALL: `${BACKEND_URL}/store/email/all`
        },
        ADDRESS: {
            GET_ALL: `${BACKEND_URL}/store/address/all`,
        }
    }
};

export { BACKEND_API };