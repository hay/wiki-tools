<template>
    <div class="results"
         v-bind:class="{ 'results--detail' : !!detail }"
         v-if="results">

        <menu class="results__stats">
            <p>{{$tc('found_results', results.count, { count : numberWithCommas(results.count) } )}}</p>

            <menu class="results__stats-actions">
                <wm-button
                    type="anchor"
                    flair="link"
                    icon="link"
                    target="_blank"
                    v-bind:href="commonsLink">{{$t('view_on_commons')}}</wm-button>

                <wm-button
                    flair="icon"
                    v-on:click="toggleTools"
                    icon="ellipsis"></wm-button>
            </menu>
        </menu>

        <menu
            v-show="showTools"
            class="results__tools">

            <p>{{$t('open_in')}}:</p>

            <a v-for="tool in tools"
               v-bind:href="tool.link"
               target="_blank">
               {{tool.label}}
            </a>
        </menu>

        <div class="results__content">
            <ul class="results__grid">
                <li v-for="result in results.items"
                    class="results__item">
                    <a v-on:click="setDetail($event, result)"
                       v-bind:href="result.url"
                       class="results__link">
                        <lazy-image
                            v-bind:src="result.thumb"
                            v-bind:alt="result.snippet"
                            class="results__image"></lazy-image>
                    </a>
                </li>
            </ul>

            <div v-if="detail"
                 class="results__detail-spacer"></div>

            <media-detail
                v-if="detail"
                v-bind:key="detail.url"
                v-bind:detail="detail"
                v-on:close="detail = false"></media-detail>
        </div>

        <menu class="results__nav"
              v-if="results.count > results.limit">
            <wm-button
                v-bind:hidden="!(offset > 0)"
                type="anchor"
                icon="arrow-left"
                v-bind:href="navLink(-1)">{{$t('previous_page')}}</wm-button>

            <wm-button
                v-bind:hidden="!results.hasNext"
                type="anchor"
                icon="arrow-right"
                v-bind:href="navLink(1)">{{$t('next_page')}}</wm-button>
        </menu>
    </div>
</template>

<script>
    import LazyImage from './lazy-image.vue';
    import MediaDetail from './media-detail.vue';
    import { numberWithCommas } from '../util.js';

    export default {
        components : { LazyImage, MediaDetail },

        computed : {
            commonsLink() {
                return `https://commons.wikimedia.org/w/index.php?search=${this.queryStringEncoded}`;
            },

            queryStringEncoded() {
                return window.encodeURIComponent(this.queryString);
            },

            tools() {
                return [
                    {
                        label : 'Petscan',
                        link : `https://petscan.wmcloud.org/?search_query=${this.queryStringEncoded}&search_wiki=commonswiki&ns[6]=1`
                    }
                ];
            }
        },

        data() {
            return {
                detail : false,
                showTools : false
            };
        },

        methods : {
            numberWithCommas,

            navLink(delta) {
                const offset = this.offset + (this.results.limit * delta);
                return `#offset=${offset}&q=${this.queryString}`;
            },

            async setDetail(e, detail) {
                e.preventDefault();
                this.detail = detail;
            },

            toggleTools() {
                this.showTools = !this.showTools;
            }
        },

        props : {
            offset : {
                required : true,
                type : Number
            },

            queryString : {
                type : String,
                required : true
            },

            results : {
                required : true,
                type : Object
            }
        }
    }
</script>