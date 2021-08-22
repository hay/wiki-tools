<template>
    <div class="screen">
        <button class="button button--action button--center"
                v-on:click="reset">
            &times; Reset
        </button>

        <figure class="reference">
            <img v-bind:src="personImage"
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
                        v-on:click="dispatch('nextPerson')">
                    Skip person
                </button>
            </figcaption>
        </figure>

        <p class="screen__instruction">
            Is this person depicted in the image below?
        </p>

        <a v-bind:href="canditateUrl"
            target="_blank">
            <img v-bind:src="candidateImage"
                 alt=""
                 class="screen__fullimage" />
        </a>

        <menu class="screen__actions">
            <button v-on:click="dispatch('approved')"
                    class="button button--action">
                ✅ Depicted
            </button>

            <button v-on:click="dispatch('skip')"
                    class="button button--action">
                👋 Skip
            </button>

            <button v-on:click="dispatch('rejected')"
                    class="button button--action">
                ❌ Not depicted
            </button>
        </menu>

        <p class="screen__meta">
            Image <b>{{remainingCandidates}}</b> of <b>{{totalCandidates}}</b> in this
            <a v-bind:href="categoryUrl" target="_blank">category</a>
        </p>
    </div>
</template>

<script>
    export default {
        computed : {
            candidateImage() {
                return this.hideCandidateImage ? false : this.$store.state.candidate.thumb;
            },

            canditateUrl() {
                return this.$store.state.candidate.url;
            },

            categoryUrl() {
                return 'https://commons.wikimedia.org/wiki/Category:' + this.$store.state.category;
            },

            loading() {
                return this.$store.state.loading;
            },

            personImage() {
                return this.hidePersonImage ? '' : this.$store.state.person.thumb;
            },

            remainingCandidates() {
                return this.totalCandidates - this.$store.getters.remainingCandidates.length + 1;
            },

            ref() {
                const ref = this.$store.state.person;

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
                hideCandidateImage : false,
                hidePersonImage : false
            };
        },

        methods : {
            async dispatch(action) {
                this.hideCandidateImage = true;

                if (action === 'nextPerson') {
                    this.hidePersonImage = true;
                }

                await this.$store.dispatch('handleCandidate', action);

                this.hideCandidateImage = false;
                this.hidePersonImage = false;
            },

            reset() {
                window.location.reload();
            }
        }
    }
</script>