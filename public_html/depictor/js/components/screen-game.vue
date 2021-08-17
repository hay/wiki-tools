<template>
    <div class="screen">
        <button class="button button--action button--center"
                v-on:click="reset">
            &times; Close
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

        <p>Is this the person you're seeing on the image below?</p>
    </div>
</template>

<script>
    export default {
        computed : {
            qid() {
                return this.$store.state.currentQid;
            },

            ref() {
                const ref = this.$store.state.currentItem;

                return {
                    alt : 'An image of ' + ref.label,
                    description : ref.description,
                    href : `https:${ref.url}`,
                    img : this.$store.state.currentRefImage,
                    label : ref.label
                };
            }
        },

        methods : {
            reset() {
                window.location.reload();
            }
        }
    }
</script>