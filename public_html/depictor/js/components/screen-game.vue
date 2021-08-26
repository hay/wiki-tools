<template>
    <div>
        <div class="screen" v-if="!candidate">
            <p class="screen__instruction">
               Fetching candidates for you...
            </p>
        </div>

        <div class="screen"
             v-show="!!candidate">
            <button class="button button--action button--center"
                    v-on:click="reset">
                &times; Reset
            </button>

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

                    <button class="button button--link"
                            v-on:click="skipItem">
                        Skip item
                    </button>
                </figcaption>
            </figure>

            <p class="screen__instruction"
               v-if="!showCandidateImage || !showItemImage">
                Loading image(s)...
            </p>

            <p v-else
               class="screen__instruction">
                Is {{ref.label}} depicted in the image below?
            </p>

            <menu class="screen__actions">
                <button v-on:click="candidateDepicted"
                        class="button button--action">
                    ✅ Depicted
                </button>

                <button v-on:click="candidateSkipped"
                        class="button button--action">
                    👋 Skip
                </button>

                <button v-on:click="candidateNotDepicted"
                        class="button button--action">
                    ❌ Not depicted
                </button>
            </menu>

            <a v-bind:href="candidate.url"
                target="_blank">
                <img v-bind:src="candidateImage"
                     v-show="showCandidateImage"
                     alt=""
                     class="screen__fullimage" />
            </a>

            <p class="screen__meta">
                <span>
                    Image <b>{{remainingCandidates}}</b> of <b>{{totalCandidates}}</b> in this
                    <a v-bind:href="categoryUrl" target="_blank">category</a>
                </span>

                <small class="screen__small">
                    <a v-bind:href="candidate.url"
                       target="_blank">
                       {{candidate.title}} ({{candidate.mid}})
                    </a>
                </small>

                <span>
                    Keyboard shortcuts: <b>(1)</b> depicted, <b>(2)</b> skip, <b>(3)</b> not depicted
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
                return this.showCandidateImage ? this.$store.state.candidate.thumb : false;
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

            itemImage() {
                return this.showItemImage ? this.$store.state.item.thumb : false;
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