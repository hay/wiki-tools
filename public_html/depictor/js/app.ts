import "../scss/style.scss";
import { getJson } from "./util";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import App from "./components/app.vue";
import WmButton from "./components/wm-button.vue";
import { setDepictorStoreOptions, useDepictorStore } from "./store";

const initApp = async () => {
    const locales = await getJson("./locales.json") as {
        messages: Record<string, Record<string, string>>;
        languages?: { code: string; label: string }[];
    };
    const ctx = window.__ctx__;

    if (ctx?.isDebug) {
        console.log("In debug mode");
    }

    const storeOptions = Object.assign({}, window.__ctx__, {
        locales,
    });
    setDepictorStoreOptions(storeOptions);

    const pinia = createPinia();
    const app = createApp(App);
    app.use(pinia);

    const store = useDepictorStore();
    app.config.globalProperties.$store = store;

    const i18n = createI18n({
        fallbackLocale: store.defaultLocale,
        locale: store.locale,
        messages: store.locales?.messages ?? {},
        silentTranslationWarn: !store.isDebug,
    });
    app.use(i18n);
    app.component("wm-button", WmButton);

    app.config.errorHandler = (err: unknown) => {
        console.error(err);
    };

    app.mount("#app");
};

const addTouchClasses = () => {
    const inputDevice = "ontouchend" in window ? "touch" : "mouse";
    window.document.documentElement.classList.add("has-" + inputDevice);
};

addTouchClasses();
initApp();
