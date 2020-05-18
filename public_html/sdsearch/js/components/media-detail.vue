<template>
    <figure
        v-if="detail"
        class="media-detail">

        <wm-button
            class="media-detail__close"
            flair="dark"
            icon="close"
            v-on:click="close">Close detail</wm-button>

        <a v-bind:href="detail.url"
           target="_blank">
            <img v-bind:src="thumb"
                 v-bind:alt="detail.snippet"
                 class="media-detail__img" />
        </a>

        <figcaption class="media-detail__caption">
            <wm-button
                type="anchor"
                flair="darklink"
                icon="link-inverted"
                target="_blank"
                v-bind:href="detail.url">View on Commons</wm-button>

            <p v-if="!meta">Loading details...</p>

            <div class="media-detail__meta"
                 v-if="meta">
                <p v-if="meta.ImageDescription"
                   class="media-detail__title"
                   v-html="meta.ImageDescription"></p>

                <ul v-if="meta"
                    class="media-detail__metalist">
                    <li v-for="(field, key) in metaFields"
                        v-if="field.check(meta)"
                        class="media-detail__metafield">
                        <strong class="media-detail__metakey">{{key}}</strong>
                        <div v-html="field.html(meta)"
                             class="media-detail__metacontent"></div>
                    </li>
                </ul>
            </div>
        </figcaption>
    </figure>
</template>

<script>
    import CommonsApi from '../commons-api.js';
    import { getImageInfo } from '../api.js';
    import { loadImage } from '../util.js';

    const commonsApi = new CommonsApi();

    export default {
        computed : {
            thumb() {
                return this.largeThumb ? this.largeThumb : this.detail.thumb;
            }
        },

        data() {
            return {
                largeThumb : null,
                meta : null,
                metaFields : {
                    Author: {
                        check: (m) => m.Artist && m.Credit,
                        html: (m) => `${m.Artist}, ${m.Credit}`
                    },

                    License : {
                        check : (m) => m.LicenseShortName && m.LicenseUrl,
                        html: (m) => `<a href="${m.LicenseUrl}" target="_blank">${m.LicenseShortName}</a>`
                    },

                    Filename : {
                        check : () => true,
                        html: () => `<a href="${this.detail.url}" target="_blank">${this.detail.title}</a>`
                    }
                }
            }
        },

        methods : {
            close() {
                this.$emit('close');
            },

            async loadImageInfo() {
                this.meta = await getImageInfo(this.detail.title);
            },

            async loadLargeThumb() {
                // Load the larger thumb in the background
                const largeThumb = commonsApi.getThumb(this.detail.filename, 500);
                await loadImage(largeThumb);
                this.largeThumb = largeThumb;
            },
        },

        mounted() {
            this.loadLargeThumb();
            this.loadImageInfo();
        },

        props : {
            detail : {
                type : Object
            }
        }
    }
</script>
