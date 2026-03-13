import "../scss/style.scss";
import { $ } from "donot";
import { getJson } from "./util";
import { createApp, watch } from "vue";
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";
import App from "./components/app.vue";
import WmButton from "./components/wm-button.vue";
import { initStore, useDepictorStore } from "./store";
import { test } from "./test";

const createAppInstance = async () => {
    const locales = await getJson("./locales.json") as {
        messages?: Record<string, Record<string, string>>;
        languages?: { code: string; label: string }[];
    };
    const ctx = window.__ctx__;

    if (ctx?.isDebug) {
        console.log("In debug mode");
    }

    const storeOptions = Object.assign({}, window.__ctx__, {
        locales,
    });
    initStore(storeOptions);

    const app = createApp(App);
    const pinia = createPinia();
    app.use(pinia);

    const store = useDepictorStore();

    const i18n = createI18n({
        legacy: false,
        fallbackLocale: store.defaultLocale,
        locale: store.locale,
        messages: store.locales?.messages ?? {},
        silentTranslationWarn: !store.isDebug,
    });

    app.use(i18n);
    app.component("wm-button", WmButton);

    app.config.errorHandler = (err: unknown) => console.error(err);

    app.mount("#app");

    // URL parsing (previously in root component mounted)
    const parseSearch = () => {
        const url = new window.URL(window.location.href);
        const depictorStore = useDepictorStore();

        if (
            url.searchParams.has("queryType") &&
            url.searchParams.has("queryValue")
        ) {
            depictorStore.runQuery({
                type: url.searchParams.get("queryType")!,
                value: url.searchParams.get("queryValue")!,
            });
        }

        if (url.searchParams.has("challenge")) {
            const id = url.searchParams.get("challenge")!;
            const action = url.searchParams.get("action") ?? "";
            depictorStore.loadChallenge({ id, action });
        }

        if (url.searchParams.has("test")) {
            test();
        }
    };

    parseSearch();

    // Screen watcher for fullscreen (previously in root component)
    watch(
        () => useDepictorStore().screenState,
        (screen) => {
            const wrapper = $("#wrapper");
            if (wrapper) {
                if (screen === "game") {
                    wrapper.setAttribute("is-fullscreen", "");
                } else {
                    wrapper.removeAttribute("is-fullscreen");
                }
            }
        },
    );
};

const addTouchClasses = () => {
    const inputDevice = "ontouchend" in window ? "touch" : "mouse";
    const html = $("html");
    if (html) {
        html.classList.add("has-" + inputDevice);
    }
};

addTouchClasses();
createAppInstance();
