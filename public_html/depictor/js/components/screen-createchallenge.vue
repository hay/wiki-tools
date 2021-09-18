<template>
    <div class="screen screen--challenge">
        <wm-button
            v-on:click="back"
            flair="bare"
            icon="arrow-left">
            {{$t('back')}}
        </wm-button>

        <p>
            You are going to create a challenge based on your current query.
            A challenge is a way to work together with multiple people for a
            single goal.
            Please fill in all the missing details below and click 'create challenge'.
        </p>

        <p>
            Note that if you want to remove this challenge you can only do
            this yourself, when logged in using your Wikimedia account.
        </p>

        <p>
            If you clicked here by accident, simply click 'back' above to go
            back to your current game.
        </p>

        <div class="options">
            <p class="options__instruction">
                These options are pre-filled with your current query and
                can't be changed. To change these, create a new query by
                going to the front page of this tool and give other values.
            </p>

            <label>
                {{$t("query_type")}}
            </label>

            <input type="text"
                   v-bind:value="query.type"
                   disabled />

            <label>
                {{$t("query_value")}}
            </label>

            <input type="text"
                   v-bind:value="query.value"
                   disabled />

            <label>
                {{$t('username')}}
            </label>

            <input type="text"
                   v-bind:value="userName"
                   disabled />

            <label>
                {{$t('itemcount')}}
            </label>

            <input type="text"
                   v-bind:value="itemCount"
                   disabled />

            <p class="options__instruction">
                You can change these values.
            </p>

            <label for="opt-title">
                {{$t('title')}}
            </label>

            <input type="text"
                   v-model="title" />

            <label for="opt-shortdescription">
                {{$t('short_description')}}
            </label>

            <input type="text"
                   v-model="shortDescription"
                   min="20"
                   required
                   max="150" />

            <label for="opt-longdescription">
                {{$t('long_description')}}
            </label>

            <textarea
                rows="4"
                v-model="longDescription"></textarea>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        computed : {
            ...mapState([ 'query', 'userName' ]),

            itemCount() {
                return this.$store.getters.remainingItems.length;
            }
        },

        data() {
            return {
                longDescription : '',
                shortDescription : '',
                title : this.$store.state.query.value,
            };
        },

        methods : {
            back() {
                this.$store.commit('screen', 'game');
            }
        }
    }
</script>