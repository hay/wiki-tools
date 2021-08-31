<template>
    <div class="screen">
        <p class="screen__lead"
            v-show="opts.type === 'year'">
            {{$t("intro_start_birthyear", { year : opts.year })}}
        </p>

        <button
            class="button button--start"
            v-on:click="start">{{$t("start")}}</button>

        <button
            class="button button--link buffer-top-3"
            v-on:click="toggleAdvancedOptions">
            <span v-if="showAdvancedOptions">{{$t("hide_advanced_options")}}</span>
            <span v-if="!showAdvancedOptions">{{$t("show_advanced_options")}}</span>
        </button>

        <div class="options__wrapper"
             v-show="showAdvancedOptions">
            <div class="options">
                <label for="opt-year">
                    <input type="radio"
                           id="opt-year"
                           value="year"
                           v-model="opts.type" />
                    {{$t("year")}}
                </label>

                <input type="number"
                       v-on:click="opts.type = 'year'"
                       v-model="opts.year" />

                <label for="opt-qid">
                    <input type="radio"
                           id="opt-qid"
                           value="qid"
                           v-model="opts.type" />
                    {{$t("qid")}}
                </label>
                <input type="text"
                        v-on:click="opts.type = 'qid'"
                       v-model="opts.qid" />

                <label for="opt-category">
                    <input type="radio"
                           id="opt-category"
                           value="category"
                           v-model="opts.type" />
                    {{$t("commons_category")}}
                </label>
                <input type="text"
                        v-on:click="opts.type = 'category'"
                       v-model="opts.category" />

                <label for="opt-sparql">
                    <input type="radio"
                           id="opt-sparql"
                           value="sparql"
                           v-model="opts.type" />
                    {{$t("sparql_query")}}
                </label>
                <textarea
                    rows="4"
                    v-on:click="opts.type = 'sparql'"
                    v-model="opts.sparql"></textarea>

                <p class="options__instruction">
                    <span v-html="$t('sparql_query_instruction')"></span>

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
        </div> <!-- options-wrapper -->

        <el-leaderboard></el-leaderboard>
    </div>
</template>

<script>
    import { randInt, sample } from 'donot';
    import {
        MIN_BIRTH_YEAR, MAX_BIRTH_YEAR
    } from '../const.js';
    import ElLeaderboard from './el-leaderboard.vue';

    function getRandomBirthYear() {
        return randInt(MIN_BIRTH_YEAR, MAX_BIRTH_YEAR);
    }

    export default {
        components : { ElLeaderboard },

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