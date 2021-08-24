<template>
    <div class="screen"
         v-if="candidate">
        <button class="button button--action button--center"
                v-on:click="reset">
            &times; Reset
        </button>

        <figure class="reference">
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

        <p class="screen__instruction">
            Is {{ref.label}} depicted in the image below?
        </p>

        <a v-bind:href="candidate.url"
            target="_blank">
            <img v-bind:src="candidateImage"
                 alt=""
                 class="screen__fullimage" />
        </a>

        <menu class="screen__actions">
            <button v-on:click="handleCandidate('approved')"
                    class="button button--action">
                ✅ Depicted
            </button>

            <button v-on:click="handleCandidate('skipped')"
                    class="button button--action">
                👋 Skip
            </button>

            <button v-on:click="handleCandidate('rejected')"
                    class="button button--action">
                ❌ Not depicted
            </button>
        </menu>

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
        </p>
    </div>
</template>

<script>
    import { encodeWikiTitle } from '../util.js';

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
                return this.totalCandidates - this.$store.getters.remainingCandidates.length + 1;
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

        methods : {
            async handleCandidate(action) {
                this.showCandidateImage = false;
                await this.$store.dispatch('handleCandidate', action);
                this.showAllImages();
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

            showAllImages() {
                this.showCandidateImage = true;
                this.showItemImage = true;
            }
        }
    }
</script>