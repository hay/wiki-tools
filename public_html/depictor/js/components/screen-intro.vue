<template>
    <div class="screen">
        <p class="screen__lead">
            When you press 'start' you are assigned random people born in {{opts.year}}.
            Check if your person is depicted in the given image.
        </p>

        <button
            class="button button--start"
            v-bind:disabled="loading"
            v-on:click="start">{{startLabel}}</button>

        <button
            class="button button--link buffer-top-3"
            v-on:click="toggleAdvancedOptions">
            <span v-if="showAdvancedOptions">Hide advanced options</span>
            <span v-if="!showAdvancedOptions">Show advanced options</span>
        </button>

        <div class="options__wrapper">
            <p class="options__hint">These options are experimental and might not function.
               Use at your own risk ;)</p>

            <div class="options">
                <label for="opt-year">Year</label>
                <input id="opt-year"
                       type="number"
                       v-model="opts.year" />

                <label for="opt-qid">QID</label>
                <input id="opt-qid"
                       type="text"
                       v-model="opts.qid" />

                <label for="opt-category">Commons category</label>
                <input id="opt-category"
                       type="text"
                       v-model="opts.category" />

                <label for="opt-sparql">SPARQL query</label>
                <textarea
                    id="opt-sparql"
                    rows="4"
                    v-model="opts.sparql"></textarea>
            </div>
        </div>
    </div>
</template>

<script>
    import { randInt, sample } from 'donot';
    import {
        MIN_BIRTH_YEAR, MAX_BIRTH_YEAR
    } from '../const.js';

    function getRandomBirthYear() {
        return randInt(MIN_BIRTH_YEAR, MAX_BIRTH_YEAR);
    }

    export default {
        computed : {
            loading() {
                return this.$store.state.loading;
            },

            startLabel() {
                return this.loading ? 'Loading...' : 'Start';
            }
        },

        data() {
            return {
                opts : {
                    category : null,
                    qid : null,
                    sparql : null,
                    year : getRandomBirthYear()
                },
                showAdvancedOptions : false
            };
        },

        methods : {
            async start() {
                this.$store.commit('hash', this.opts);
            },

            toggleAdvancedOptions() {
                this.showAdvancedOptions = !this.showAdvancedOptions;
            }
        },

        mounted() {
            this.$store.commit('birthYear', this.opts.year);
        }
    }
</script>