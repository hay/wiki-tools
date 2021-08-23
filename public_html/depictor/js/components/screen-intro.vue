<template>
    <div class="screen">
        <p class="screen__lead"
            v-show="opts.type === 'year'">
            When you press 'start' you are assigned random people born in {{opts.year}}.
            Check if your person is depicted in the given image.
        </p>

        <button
            class="button button--start"
            v-on:click="start">Start</button>

        <button
            class="button button--link buffer-top-3"
            v-on:click="toggleAdvancedOptions">
            <span v-if="showAdvancedOptions">Hide advanced options</span>
            <span v-if="!showAdvancedOptions">Show advanced options</span>
        </button>

        <div class="options__wrapper"
             v-show="showAdvancedOptions">
            <p class="options__hint">
               These options are experimental and might not function.
               Use at your own risk ;)</p>

            <div class="options">
                <label for="opt-year">
                    <input type="radio"
                           id="opt-year"
                           value="year"
                           v-model="opts.type" />
                    Year
                </label>

                <input type="number"
                       v-on:click="opts.type = 'year'"
                       v-model="opts.year" />

                <label for="opt-qid">
                    <input type="radio"
                           id="opt-qid"
                           value="qid"
                           v-model="opts.type" />
                    QID
                </label>
                <input type="text"
                        v-on:click="opts.type = 'qid'"
                       v-model="opts.qid" />

                <label for="opt-category">
                    <input type="radio"
                           id="opt-category"
                           value="category"
                           v-model="opts.type" />
                    Commons category
                </label>
                <input type="text"
                        v-on:click="opts.type = 'category'"
                       v-model="opts.category" />

                <label for="opt-sparql">
                    <input type="radio"
                           id="opt-sparql"
                           value="sparql"
                           v-model="opts.type" />
                    SPARQL query
                </label>
                <textarea
                    rows="4"
                    v-on:click="opts.type = 'sparql'"
                    v-model="opts.sparql"></textarea>

                <p class="options__instruction">
                    Make sure to include <code>?item ?instance ?image ?cat</code> variables with
                    a SPARQL query. For example, to get all subspecies of cats (felids), try:

                    <pre><code>
select ?item ?instance ?image ?cat where {
    ?item wdt:P171* wd:Q25265;
          wdt:P31 ?instance;
          wdt:P18 ?image;
          wdt:P373 ?cat.
}
                    </code></pre>
                </p>
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
        data() {
            return {
                opts : {
                    category : null,
                    qid : null,
                    sparql : null,
                    type : 'year',
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
        }
    }
</script>