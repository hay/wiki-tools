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
            <a v-bind:href="detail.url"
               target="_blank">
               {{detail.title}}
            </a>

            <template v-if="meta">
                <section v-html="meta.Artist"></section>
                <section v-html="meta.Credit"></section>
                <section v-html="meta.License"></section>
                <section v-html="meta.ImageDescription"></section>
                <section v-html="meta.ObjectName"></section>
            </template>

            <p v-if="!detail.description">{{detail.snippet}}</p>
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
                meta : null
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
