<template>
    <div class="screen screen--challenge">
        <wm-button
            v-on:click="back"
            flair="bare"
            icon="arrow-left">
            {{$t('back')}}
        </wm-button>

        <template v-if="mode === 'create'">
            <p>
                You are going to create a challenge based on your current query.
                A challenge is a way to work together with multiple people for a
                single goal.
                Please fill in all the missing details below and click 'create challenge'.
            </p>

            <p>
                Note that if you want to archive this challenge or edit description and title
                you can only do this yourself, when logged in using your Wikimedia account.
                It is not possible to change the query for a challenge afterwards.
            </p>

            <p>
                If you clicked here by accident, simply click 'back' above to go
                back to your current game.
            </p>
        </template>

        <template v-if="mode === 'edit'">
            <p>You can edit your challenge now.</p>
        </template>

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

            <p class="options__input">
                {{$t("challenge_title_length", { count : this.MIN_CHALLENGE_TITLE_LENGTH })}}
            </p>

            <label for="opt-shortdescription">
                {{$t('short_description')}}
            </label>

            <input type="text"
                   v-model="shortDescription"
                   min="20"
                   required
                   max="150" />

            <p class="options__input">
                {{$t("challenge_shortdescription_length", { count : this.MIN_CHALLENGE_SHORTDESCRIPTION_LENGTH })}}
            </p>

            <label for="opt-longdescription">
                {{$t('long_description')}}
            </label>

            <textarea
                rows="4"
                v-model="longDescription"></textarea>

            <label for="opt-archive">
                {{$t('archived')}}
            </label>

            <p class="options__input">
                <input type="checkbox"
                       v-model="archived" />

                {{$t('archived_hint')}}
            </p>

            <wm-button
                v-if="mode === 'create'"
                class="options__input"
                icon="challenge"
                v-bind:disabled="loading || !hasNeededFields"
                v-on:click="create">{{$t('create_challenge')}}</wm-button>

            <wm-button
                v-if="mode === 'edit'"
                class="options__input"
                icon="edit"
                v-bind:disabled="loading || !hasNeededFields"
                v-on:click="edit">{{$t('edit_challenge')}}</wm-button>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import {
        MIN_CHALLENGE_TITLE_LENGTH, MIN_CHALLENGE_SHORTDESCRIPTION_LENGTH
    } from '../const.js';

    export default {
        computed : {
            editableValues() {
                return {
                    archived : this.archived,
                    longDescription : this.longDescription,
                    shortDescription : this.shortDescription,
                    title : this.title
                }
            },

            hasNeededFields() {
                return this.title.length >= MIN_CHALLENGE_TITLE_LENGTH &&
                       this.shortDescription.length > MIN_CHALLENGE_SHORTDESCRIPTION_LENGTH;
            },

            mode() {
                return this.isEditable ? 'edit' : 'create';
            }
        },

        data() {
            return {
                archived : false,
                itemCount : 0,
                loading : false,
                longDescription : '',
                MIN_CHALLENGE_TITLE_LENGTH : MIN_CHALLENGE_TITLE_LENGTH,
                MIN_CHALLENGE_SHORTDESCRIPTION_LENGTH : MIN_CHALLENGE_SHORTDESCRIPTION_LENGTH,
                query : {},
                shortDescription : '',
                title : '',
                userName : null
            };
        },

        methods : {
            back() {
                if (this.mode === 'create') {
                    this.$store.commit('screen', 'game');
                } else {
                    this.$store.commit('screen', 'challenge');
                }
            },

            async create() {
                if (this.loading) {
                    return;
                }

                const id = await this.$store.dispatch(
                    "createChallenge", this.editableValues
                );

                // Redirect to the new challenge
                window.location = `${this.$store.state.rootUrl}/?challenge=${id}`
            },

            async edit() {
                if (this.loading) {
                    return;
                }

                const id = await this.$store.dispatch(
                    "editChallenge", this.editableValues
                );

                // Redirect to the new challenge
                window.location = `${this.$store.state.rootUrl}/?challenge=${id}`
            }
        },

        mounted() {
            const { getters, state } = this.$store;

            if (this.mode === 'edit') {
                const challenge = state.challenge;

                this.query = {
                    type : challenge.querytype,
                    value : challenge.queryvalue
                };

                this.archived = challenge.archived === "1";
                this.itemCount = challenge.itemcount ? parseInt(challenge.itemcount) : null;
                this.longDescription = challenge.long_description;
                this.shortDescription = challenge.short_description;
                this.title = challenge.title;
                this.userName = state.userName;
            }

            if (this.mode === 'create') {
                this.itemCount = getters.remainingItems.length;
                this.query = state.query;
                this.userName = state.userName;
            }
        },

        props : {
            isEditable : {
                type : Boolean,
                required : false
            }
        }
    }
</script>