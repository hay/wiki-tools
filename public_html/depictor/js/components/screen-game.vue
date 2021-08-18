<template>
    <div class="screen">
        <button class="button button--action button--center"
                v-on:click="reset">
            &times; Reset
        </button>

        <figure class="reference">
            <img v-bind:src="ref.img"
                 v-bind:alt="ref.alt"
                 class="reference__img" />

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
            </figcaption>
        </figure>

        <p class="screen__instruction">
            Is this person depicted in the image below?
        </p>

        <img v-bind:src="candidate.img"
             v-bind:alt="candidate.alt"
             v-show="!loading"
             class="screen__fullimage" />

        <menu class="screen__actions">
            <button v-on:click="depicted"
                    class="button button--action">
                ✅ Depicted
            </button>

            <button v-on:click="skip"
                    class="button button--action">
                👋 Skip
            </button>

            <button v-on:click="notDepicted"
                    class="button button--action">
                ❌ Not depicted
            </button>
        </menu>

        <p class="screen__meta">
            Image <b>{{remainingCandidates}}</b> of <b>{{totalCandidates}}</b> in this category
        </p>
    </div>
</template>

<script>
    export default {
        computed : {
            candidate() {
                const can = this.$store.state.currentCandidate;

                return {
                    alt : `A possible image depicting ${this.ref.label}`,
                    img : can.thumb
                };
            },

            loading() {
                return this.$store.state.loading;
            },

            qid() {
                return this.$store.state.currentQid;
            },

            remainingCandidates() {
                return this.$store.state.processedCandidates.length + 1;
            },

            ref() {
                const ref = this.$store.state.currentPerson;

                return {
                    alt : 'An image of ' + ref.label,
                    description : ref.description,
                    href : `https:${ref.url}`,
                    img : this.$store.state.currentPersonImage,
                    label : ref.label
                };
            },

            totalCandidates() {
                return this.$store.state.candidates.length;
            }
        },

        methods : {
            depicted() {
                this.$store.dispatch("acceptCandidate");
            },

            notDepicted() {
                this.$store.dispatch("rejectCandidate");
            },

            reset() {
                window.location.reload();
            },

            skip() {
                this.$store.dispatch('skipCandidate');
            }
        }
    }
</script>