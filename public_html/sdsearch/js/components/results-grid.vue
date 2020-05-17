<template>
    <div class="results"
         v-bind:class="{ 'results--detail' : !!detail }"
         v-if="results">
        <menu class="results__stats">
            <p>Found <strong>{{results.count}}</strong> items</p>

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

            <figure
                v-if="detail"
                class="results__detail">

                <wm-button
                    class="results__detail-close"
                    flair="dark"
                    icon="close"
                    v-on:click="detail = false">Close detail</wm-button>

                <a v-bind:href="detail.url"
                   target="_blank">
                    <img v-bind:src="detailThumb"
                         v-bind:alt="detail.snippet"
                         class="results__detail-img" />
                </a>

                <figcaption class="results__detail-caption">
                    <a v-bind:href="detail.url"
                       target="_blank">
                       {{detail.title}}
                    </a>

                    <template v-if="detail.meta">
                        <section v-html="detail.meta.Artist"></section>
                        <section v-html="detail.meta.Credit"></section>
                        <section v-html="detail.meta.License"></section>
                        <section v-html="detail.meta.ImageDescription"></section>
                        <section v-html="detail.meta.ObjectName"></section>
                    </template>

                    <p v-if="!detail.description">{{detail.snippet}}</p>
                </figcaption>
            </figure>
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
    import CommonsApi from '../commons-api.js';
    import { getImageInfo } from '../api.js';
    import { loadImage } from '../util.js';

    const commonsApi = new CommonsApi();

    export default {
        computed : {
            commonsLink() {
                const q = window.encodeURIComponent(this.queryString);
                return `https://commons.wikimedia.org/w/index.php?search=${q}`;
            }
        },

        data() {
            return {
                detail : false,
                detailThumb : null
            };
        },

        methods : {
            async loadImageInfo() {
                const info = await getImageInfo(this.detail.title);
                this.detail.meta = info;
            },

            async loadLargeThumb() {
                // Load the larger thumb in the background
                const largeThumb = commonsApi.getThumb(this.detail.filename, 500);
                await loadImage(largeThumb);

                // Only switch if the detail thumb is still the same one as we
                // set
                if (this.detailThumb === this.detail.thumb) {
                    this.detailThumb = largeThumb;
                }
            },

            navLink(delta) {
                const offset = this.offset + (this.results.limit * delta);
                return `#offset=${offset}&q=${this.queryString}`;
            },

            async setDetail(e, detail) {
                e.preventDefault();
                this.detailThumb = detail.thumb;
                this.detail = detail;
                this.loadLargeThumb();
                this.loadImageInfo();
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