<template>
    <div class="el-header">
        <h1 class="app-title">
            <a v-bind:href="rootUrl">{{$t('app_title')}}</a>
        </h1>

        <p class="app-lead">
            {{$t('app_description')}}
        </p>

        <div class="screen">
            <p v-if="isDebug"
               class="app-user">Debug mode</p>

            <p v-if="isLoggedIn"
               class="app-user">
                {{$t('logged_in_as')}} <strong>
                    <a v-bind:href="userPage"
                       target="_blank">{{userName}}</a>
                   </strong>.

                <a href="index.php?logout=1">{{$t('log_out')}}</a>.
            </p>

            <p v-if="isAccessTokenRequest"
               class="screen__lead">
               {{t('logged_in_proceed')}}
            </p>

            <a v-if="isAccessTokenRequest"
               href="index.php"
               class="button button--start">{{$t('proceed')}}</a>
            </div>

            <p v-if="isLoggedOut"
                class="screen__lead">
                {{$t('please_log_in')}}
            </p>

            <a v-if="isLoggedOut"
               v-bind:href="authUrl"
               class="button button--start">{{$t('log_in')}}</a>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        computed : mapState([
            'rootUrl', 'isDebug', 'userPage', 'userName',
            'isAccessTokenRequest', 'isLoggedIn', 'isLoggedOut'
        ])
    };
</script>