<template>
    <div class="results"
         v-bind:class="{ 'results--detail' : !!detail }"
         v-if="results">
        <menu class="results__stats">
            <p>Found <strong>{{numberWithCommas(results.count)}}</strong> items</p>

            <wm-button
                type="anchor"
                flair="link"
                icon="link"
                target="_blank"
                v-bind:href="commonsLink">View on Commons</wm-button>
        </menu>

        <div class="results__content">
            <ul class="results__grid">
                <li v-for="result in results.items"
                    class="results__item">
                    <a v-on:click="setDetail($event, result)"
                       v-bind:href="result.url"
                       class="results__link">
                        <img v-bind:src="result.thumb"
                             v-bind:alt="result.snippet"
                             class="results__image" />
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
                v-bind:href="navLink(-1)">Previous page</wm-button>

            <wm-button
                v-bind:hidden="!results.hasNext"
                type="anchor"
                icon="arrow-right"
                v-bind:href="navLink(1)">Next page</wm-button>
        </menu>
    </div>
</template>

<script>
    import MediaDetail from './media-detail.vue';
    import { numberWithCommas } from '../util.js';

    export default {
        components : { MediaDetail },

        computed : {
            commonsLink() {
                const q = window.encodeURIComponent(this.queryString);
                return `https://commons.wikimedia.org/w/index.php?search=${q}`;
            }
        },

        data() {
            return {
                detail : false
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