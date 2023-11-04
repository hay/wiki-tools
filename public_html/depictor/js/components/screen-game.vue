<script>
    import { mapState } from 'vuex';
    import { encodeWikiTitle, loadImage } from '../util.js';
    import ElProgress from './el-progress.vue';
    import { WikipediaApi } from '../mwapi/wikipedia.js';

    export default {
        components : { ElProgress },

        computed : {
            ...mapState([ 'candidate', 'item', 'loading', 'lockActions' ]),

            candidateImage() {
                return this.showCandidateImage && this.$store.state.candidate ? this.$store.state.candidate.thumb : false;
            },

            categoryUrl() {
                return 'https://commons.wikimedia.org/wiki/Category:' + encodeWikiTitle(this.$store.state.category);
            },

            imageProcess() {
                return this.$t('image_process', {
                    x : this.remainingCandidates,
                    y : this.totalCandidates,
                    categoryUrl : this.categoryUrl
                });
            },

            isPossibleChallenge() {
                return this.$store.getters.isPossibleChallenge;
            },

            itemImage() {
                return this.showItemImage && this.$store.state.item ? this.$store.state.item.thumb : false;
            },

            progress() {
                const total = this.$store.state.items.length;
                const remain = this.$store.getters.remainingItems.length;

                return {
                    total : total,
                    value : total - remain,
                };
            },

            remainingCandidates() {
                const count = this.totalCandidates - this.$store.getters.remainingCandidates.length + 1;

                // Make sure we never show totalCandidates + 1 :)
                return count > this.totalCandidates ? this.totalCandidates : count;
            },

            ref() {
                return {
                    description : this.item.description,
                    href : this.item.url,
                    hasSitelink : this.item.hasSitelink,
                    img : this.item.thumb,
                    label : this.item.label,
                    sitelinkTitle : this.item.sitelinkTitle
                };
            },

            totalCandidates() {
                return this.$store.state.candidates.length;
            }
        },

        data() {
            return {
                showCandidateImage : true,
                showItemImage : true,
                summary : false
            };
        },

        destroyed() {
            window.removeEventListener('keydown', this.keydown);
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

            createChallenge() {
                this.$store.commit('screen', 'create-challenge');
            },

            async getSummary(title) {
                const api = new WikipediaApi(this.$store.state.locale);
                const summary = await api.getSummary(title);

                if (summary.extract_html) {
                    this.summary = summary.extract_html;
                }
            },

            async handleCandidate(action) {
                this.$store.commit('lockActions');
                this.showCandidateImage = false;
                await this.$store.dispatch('handleCandidate', action);
                this.showAllImages();
                // Failsafe, this is already done in handleCandidate,
                // but we do it here again to make sure the actions
                // don't stay locked
                this.$store.commit('unlockActions');
            },

            keydown(e) {
                if (this.lockActions) {
                    console.log('lockActions, ignore keypresses');
                    return;
                }

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
                this.$store.commit('lockActions');
                this.showCandidateImage = false;
                this.showItemImage = false;
                this.$store.commit('itemDone', this.$store.state.item.qid);
                await this.$store.dispatch("nextItem");
                this.showAllImages();
                this.$store.commit('unlockActions');
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

<template>
    <div>
        <div class="screen" v-if="!candidate">
            <p class="screen__instruction">
               {{$t('fetching_candidates')}}
            </p>
        </div>

        <div class="screen screen--game"
             v-if="!!candidate && !!item">
            <figure class="reference"
                    v-show="showItemImage">
                <el-progress
                    class="reference__progress"
                    v-bind:value="progress.value"
                    v-bind:total="progress.total"></el-progress>

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

                    <button
                        v-if="ref.hasSitelink && !summary"
                        v-on:click="getSummary(ref.sitelinkTitle)">
                        Get Summary
                    </button>

                    <p v-if="summary"
                       v-html="summary" />

                    <wm-button v-on:click="skipItem"
                               class="reference__skipbutton"
                               icon="skip"
                               flair="bare">{{$t('skip_item')}}</wm-button>
                </figcaption>
            </figure>

            <div class="screen__content">
                <p class="screen__instruction"
                   v-if="!showCandidateImage || !showItemImage">
                    {{$t('loading_images')}}
                </p>

                <p v-else
                   class="screen__instruction"
                   v-html="$t('is_depicted', { label : ref.label })"></p>

                <menu class="screen__actions">
                    <wm-button v-on:click="candidateDepicted"
                               v-bind:disabled="lockActions"
                               icon="accept">{{$t('yes')}}</wm-button>

                    <wm-button v-on:click="candidateSkipped"
                               v-bind:disabled="lockActions"
                               icon="skip">{{$t('skip')}}</wm-button>

                    <wm-button v-on:click="candidateNotDepicted"
                               v-bind:disabled="lockActions"
                               icon="close">{{$t('no')}}</wm-button>
                </menu>

                <a v-bind:href="candidate.url"
                   class="screen__candidateimage"
                   target="_blank">
                    <img v-bind:src="candidateImage"
                         v-show="showCandidateImage"
                         alt=""
                         class="screen__fullimage" />
                </a>
            </div>

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

                <span v-show="!isPossibleChallenge">
                    {{$t('create_challenge_not_possible')}}
                </span>
            </p>

            <wm-button
                class="screen__challenge"
                v-show="isPossibleChallenge"
                v-on:click="createChallenge"
                icon="challenge">{{$t('create_challenge')}}</wm-button>
        </div>
    </div>
</template>