<template>
    <div class="el-header">
        <menu class="el-header__menu">
            <wm-button v-on:click="reset"
                       flair="bare"
                       v-if="screen === 'game'"
                       icon="arrow-left">{{$t('start')}}</wm-button>

            <el-language-selector
                v-bind:languages="languages"
                v-bind:link="transateLink"
                v-model="locale"></el-language-selector>

            <wm-button v-if="isLoggedIn"
                       type="anchor"
                       flair="bare"
                       class="el-header__username"
                       v-bind:href="userPage"
                       target="_blank"
                       icon="user">{{userName}}</wm-button>

            <wm-button v-if="isLoggedIn"
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
            <p v-if="isAccessTokenRequest"
               class="screen__lead">
               {{$t('logged_in_proceed')}}
            </p>

            <a v-if="isAccessTokenRequest"
               href="index.php"
               class="button button--start">{{$t('proceed')}}</a>

            <p v-if="isLoggedOut"
                class="screen__lead">
                {{$t('please_log_in')}}
            </p>

            <a v-if="isLoggedOut"
               v-bind:href="authUrl"
               class="button button--start">{{$t('log_in')}}</a>
        </div>
    </div>
</template>

<script>
    import ElLanguageSelector from './el-language-selector.vue';
    import { mapState } from 'vuex';

    export default {
        components : { ElLanguageSelector },

        computed: {
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
                'isAccessTokenRequest', 'isLoggedIn', 'isLoggedOut', 'screen'
            ])
        },

        data() {
            return {
                languages : this.$store.state.locales.languages,
                transateLink : {
                    link : 'https://tools.wmflabs.org/tooltranslate/#tool=59',
                    label : this.$t('translate_this_tool')
                }
            };
        },

        methods : {
            reset() {
                this.$store.dispatch("reset");
            }
        },

        watch : {
            locale() {
                this.$i18n.locale = this.locale;
            }
        }
    };
</script>