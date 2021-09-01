<template>
    <div>
        <div class="screen" v-if="!candidate">
            <p class="screen__instruction">
               {{$t('fetching_candidates')}}
            </p>
        </div>

        <div class="screen"
             v-show="!!candidate">
            <figure class="reference"
                    v-show="showItemImage">
                <img v-bind:src="itemImage"
                     alt=""
                     class="reference__img image" />

                <figcaption class="reference__caption">
                    <p>
                        <a v-bind:href="ref.href"
                           target="_blank">
                            {{ref.label}}
                        </a>
                    </p>

                    <p class="reference__description">
                        <em>{{ref.description}}</em>
                    </p>

                    <wm-button v-on:click="skipItem"
                               class="reference__skipbutton"
                               icon="skip"
                               flair="bare">{{$t('skip_item')}}</wm-button>
                </figcaption>
            </figure>

            <p class="screen__instruction"
               v-if="!showCandidateImage || !showItemImage">
                {{$t('loading_images')}}
            </p>

            <p v-else
               class="screen__instruction">
               {{$t('is_depicted', { label : ref.label }) }}
            </p>

            <menu class="screen__actions">
                <wm-button v-on:click="candidateDepicted"
                           icon="accept">{{$t('yes')}}</wm-button>

                <wm-button v-on:click="candidateSkipped"
                           icon="skip">{{$t('skip')}}</wm-button>

                <wm-button v-on:click="candidateNotDepicted"
                           icon="close">{{$t('no')}}</wm-button>
            </menu>

            <a v-bind:href="candidate.url"
                target="_blank">
                <img v-bind:src="candidateImage"
                     v-show="showCandidateImage"
                     alt=""
                     class="screen__fullimage" />
            </a>

            <p class="screen__meta">
                <span v-html="imageProcess"></span>

                <small class="screen__small">
                    <a v-bind:href="candidate.url"
                       target="_blank">
                       {{candidate.title}} ({{candidate.mid}})
                    </a>
                </small>

                <span>
                    {{$t("keyboard_shortcuts")}}: <b>(1)</b> {{$t("depicted")}}, <b>(2)</b> {{$t("skip")}}, <b>(3)</b> {{$t("not_depicted")}}, <b>(s)</b> {{$t("skip_item")}}
                </span>
            </p>
        </div>
    </div>
</template>

<script>
    import { encodeWikiTitle, loadImage } from '../util.js';

    export default {
        computed : {
            candidateImage() {
                return this.showCandidateImage && this.$store.state.candidate ? this.$store.state.candidate.thumb : false;
            },

            candidate() {
                return this.$store.state.candidate;
            },

            categoryUrl() {
                return 'https://commons.wikimedia.org/wiki/Category:' + encodeWikiTitle(this.$store.state.category);
            },

            loading() {
                return this.$store.state.loading;
            },

            imageProcess() {
                return this.$t('image_process', {
                    x : this.remainingCandidates,
                    y : this.totalCandidates,
                    categoryUrl : this.categoryUrl
                });
            },

            itemImage() {
                return this.showItemImage && this.$store.state.item ? this.$store.state.item.thumb : false;
            },

            remainingCandidates() {
                const count = this.totalCandidates - this.$store.getters.remainingCandidates.length + 1;

                // Make sure we never show totalCandidates + 1 :)
                return count > this.totalCandidates ? this.totalCandidates : count;
            },

            ref() {
                const ref = this.$store.state.item;

                return {
                    alt : 'An image of ' + ref.label,
                    description : ref.description,
                    href : `https:${ref.url}`,
                    img : ref.thumb,
                    label : ref.label
                };
            },

            totalCandidates() {
                return this.$store.state.candidates.length;
            }
        },

        data() {
            return {
                showCandidateImage : true,
                showItemImage : true
            };
        },

        destroyed() {
            window.removeEventListener('reset', this.keydown);
        },

        methods : {
            candidateDepicted() {
                this.handleCandidate('depicted');
            },

            candidateNotDepicted() {
                this.handleCandidate('not-depicted');
            },

            candidatePromintentlyDepicted() {
                this.handleCandidate('prominently-depicted');
            },

            candidateSkipped() {
                this.handleCandidate('user-skipped');
            },

            async handleCandidate(action) {
                this.showCandidateImage = false;
                await this.$store.dispatch('handleCandidate', action);
                this.showAllImages();
            },

            keydown(e) {
                if (e.key === '1') {
                    this.candidateDepicted();
                } else if (e.key === '2') {
                    this.candidateSkipped();
                } else if (e.key === '3') {
                    this.candidateNotDepicted();
                } else if (e.key === 's') {
                    this.skipItem();
                }
            },

            async skipItem() {
                this.showCandidateImage = false;
                this.showItemImage = false;
                this.$store.commit('itemDone', this.$store.state.item.qid);
                await this.$store.dispatch("nextItem");
                this.showAllImages();
            },

            reset() {
                this.$store.dispatch('reset');
            },

            async showAllImages() {
                // Make sure the image is loaded before display
                await loadImage(this.$store.state.candidate.thumb);
                this.showCandidateImage = true;
                this.showItemImage = true;
            }
        },

        mounted() {
            window.addEventListener('keydown', this.keydown);
        }
    }
</script>