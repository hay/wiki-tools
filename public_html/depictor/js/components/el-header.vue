<template>
    <div class="el-header">
        <menu class="el-header__menu">
            <wm-button
                v-if="screen === 'game'"
                v-show="!showLangselect"
                v-bind:href="homeLink"
                type="anchor"
                flair="bare"
                icon="arrow-left">{{$t('start')}}</wm-button>

            <el-language-selector
                ref="langSelect"
                v-on:blur-select="langSelect(false)"
                v-on:click-select="langSelect(true)"
                v-bind:languages="languages"
                v-bind:link="transateLink"
                v-model="locale"></el-language-selector>

            <wm-button
                v-if="isLoggedIn"
                v-show="!showLangselect"
                type="anchor"
                flair="bare"
                class="el-header__username"
                v-bind:href="userPage"
                target="_blank"
                icon="user">{{userName}}</wm-button>

            <wm-button
                v-if="isLoggedIn"
                v-show="!showLangselect"
                icon="logout"
                flair="bare"
                type="anchor"
                href="index.php?logout=1">{{$t("log_out")}}</wm-button>
        </menu>

        <h1 class="app-title"
            v-show="screen === 'intro'">
            <a v-bind:href="rootUrl">{{$t('app_title')}}</a>
        </h1>

        <p class="app-lead"
            v-show="screen === 'intro'">
            {{$t('app_description')}}
        </p>

        <div class="screen"
             v-if="!isLoggedIn">
            <template v-if="isAccessTokenRequest">
                <p class="screen__lead">
                   {{$t('logged_in_proceed')}}
                </p>

                <wm-button
                    href="index.php"
                    type="anchor"
                    flair="primary">{{$t('proceed')}}</wm-button>
            </template>

            <template v-else-if="isLoggedOut">
                <p class="screen__lead">
                    {{$t('please_log_in')}}
                </p>

                <wm-button
                   v-bind:href="authUrl"
                   type="anchor"
                   flair="primary">{{$t('log_in')}}</wm-button>
            </template>

            <template v-else>
                <!-- invalidAccessTokenRequest and anything else weird -->
                <p class="screen__lead">
                    {{$t('login_error_try_again')}}
                </p>

                <wm-button
                    flair="primary"
                    type="anchor"
                    href="index.php?logout=1">{{$t("try_again")}}</wm-button>
            </template>
        </div>
    </div>
</template>

<script>
    import ElLanguageSelector from './el-language-selector.vue';
    import { mapState } from 'vuex';

    export default {
        components : { ElLanguageSelector },

        computed: {
            homeLink() {
                return this.$store.getters.homeLink;
            },

            locale: {
                get() {
                    return this.$store.state.locale;
                },

                set(locale) {
                    this.$store.commit('locale', locale);
                }
            },

            ...mapState([
                'authUrl', 'rootUrl', 'isDebug', 'userPage', 'userName',
                'isAccessTokenRequest', 'isLoggedIn', 'isLoggedOut', 'screen',
                'isInvalidAccessTokenRequest'
            ])
        },

        data() {
            return {
                languages : this.$store.state.locales.languages,
                showLangselect : false,
                transateLink : {
                    link : 'https://tools.wmflabs.org/tooltranslate/#tool=59',
                    label : this.$t('translate_this_tool')
                }
            };
        },

        methods : {
            langSelect(select) {
                if (select) {
                    this.$refs.langSelect.showSelect();
                } else {
                    this.$refs.langSelect.hideSelect();
                }

                this.showLangselect = select;
            }
        },

        watch : {
            locale() {
                this.$i18n.locale = this.locale;
            }
        }
    };
</script>