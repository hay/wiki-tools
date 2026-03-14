import "../scss/style.scss";
import { getJson } from "./util";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./components/app.vue";
import WmButton from "./components/wm-button.vue";
import createStore from "./store";

async function initApp() {
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
    const store = createStore(storeOptions);

    const i18n = createI18n({
        legacy: true,
        fallbackLocale: store.state.defaultLocale,
        locale: store.state.locale,
        messages: store.state.locales?.messages ?? {},
        silentTranslationWarn: !store.state.isDebug,
    });

    const app = createApp(App);
    app.use(store);
    app.use(i18n);
    app.component("wm-button", WmButton);

    app.config.errorHandler = (err: unknown) => {
        console.error(err);
    };

    app.mount("#app");
}

function addTouchClasses() {
    const inputDevice = "ontouchend" in window ? "touch" : "mouse";
    window.document.documentElement.classList.add("has-" + inputDevice);
}

addTouchClasses();
initApp();
