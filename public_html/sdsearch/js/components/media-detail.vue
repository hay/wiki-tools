<template>
    <figure
        v-if="detail"
        class="media-detail">

        <wm-button
            class="media-detail__close"
            flair="dark"
            icon="close"
            v-on:click="close">{{$t('close_detail')}}</wm-button>

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
                v-bind:href="detail.url">{{$t('view_on_commons')}}</wm-button>

            <p v-if="!meta">{{$t('loading_details')}}</p>

            <div class="media-detail__meta"
                 v-if="meta">
                <p v-if="meta.ImageDescription"
                   class="media-detail__title"
                   v-html="meta.ImageDescription"></p>

                <ul v-if="statements"
                    class="media-detail__metalist">
                    <li v-for="(entity, prop) in statements"
                        class="media-detail__metafield">
                        <strong class="media-detail__metakey">{{entity.propLabel}}</strong>

                        <div class="media-detail__metacontent"
                             v-html="entity.itemLinks"></div>
                    </li>
                </ul>

                <ul v-if="meta"
                    class="media-detail__metalist">
                    <li v-for="(field, key) in metaFields"
                        v-if="field.check(meta)"
                        class="media-detail__metafield">
                        <strong class="media-detail__metakey">{{$tc(key, 1)}}</strong>
                        <div v-html="field.html(meta)"
                             class="media-detail__metacontent"></div>
                    </li>
                </ul>
            </div>
        </figcaption>
    </figure>
</template>

<script>
    import CommonsApi from '../mwapi/commons.js';
    import { getImageInfo } from '../api.js';
    import { loadImage } from '../util.js';

    export default {
        computed : {
            locale() {
                return this.$store.state.locale;
            },

            thumb() {
                return this.largeThumb ? this.largeThumb : this.detail.thumb;
            }
        },

        data() {
            return {
                commonsApi : new CommonsApi({}, this.$store.state.locale),
                largeThumb : null,
                meta : null,
                metaFields : {
                    author: {
                        check: (m) => m.Artist && m.Credit,
                        html: (m) => `${m.Artist}, ${m.Credit}`
                    },

                    created : {
                        check: (m) => m.DateTimeOriginal,
                        html: (m) => m.DateTimeOriginal
                    },

                    license : {
                        check : (m) => m.LicenseShortName && m.LicenseUrl,
                        html: (m) => `<a href="${m.LicenseUrl}" target="_blank">${m.LicenseShortName}</a>`
                    },

                    categories : {
                        check : (m) => m.Categories,
                        html: (m) => {
                            return m.Categories.split('|').map((cat) => {
                                return `<a href='#q=incategory:"${cat}"'>${cat}</a>`;
                            }).join(', ');
                        }
                    },

                    filename : {
                        check : () => true,
                        html: () => `<a href="${this.detail.url}" target="_blank">${this.detail.title}</a>`
                    }
                },
                statements : null,
            }
        },

        methods : {
            close() {
                this.$emit('close');
            },

            async loadEntityData() {
                const statements = await this.commonsApi.entityStatements(this.detail.mid);

                for (const prop in statements) {
                    const entity = statements[prop];

                    entity.itemLinks = entity.items.map((item) => {
                        if (item.type === 'wikibase-entityid') {
                            return `<a href="#q=haswbstatement:${prop}=${item.value}">${item.label}</a>`;
                        } else if (item.type === 'unsupported') {
                            return false;
                        } else {
                            return item.value;
                        }
                    }).filter(i => !!i).join(', ');
                }

                this.statements = statements;
            },

            async loadImageInfo() {
                this.meta = await getImageInfo(this.detail.title);
            },

            async loadLargeThumb() {
                // Load the larger thumb in the background
                const largeThumb = this.commonsApi.getThumb(this.detail.filename, 500);
                await loadImage(largeThumb);
                this.largeThumb = largeThumb;
            },
        },

        mounted() {
            this.loadLargeThumb();
            this.loadEntityData();
            this.loadImageInfo();
        },

        props : {
            detail : {
                type : Object
            }
        }
    }
</script>
