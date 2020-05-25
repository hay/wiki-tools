<template>
    <img v-bind:src="imageSrc"
         v-bind:style="style"
         v-bind:loading="loading"
         v-bind:alt="imageAlt" />
</template>

<script>
    import { hashCode, timeout } from '../util.js';

    export default {
        computed : {
            loading() {
                return !this.imageSrc;
            },

            style() {
                if (this.loading) {
                    const hex = Math.abs(hashCode(this.src)).toString(16);
                    const color = '#' + hex.slice(0, 6);
                    return { backgroundColor : color };
                } else {
                    return {};
                }
            }
        },

        data() {
            return {
                imageAlt : false,
                imageSrc : false,
                tried : false
            };
        },

        methods : {
            async loadImage() {
                const img = new Image();

                img.addEventListener('load', () => {
                    this.imageAlt = this.alt;
                    this.imageSrc = this.src;
                });

                img.src = this.src;

                await timeout(this.timeout);

                if (!this.imageSrc && !this.tried) {
                    this.tried = true;
                    this.loadImage();

                }
            }
        },

        mounted() {
            this.loadImage();
        },

        props : {
            alt : {
                type : String
            },

            src : {
                type : String,
                required : true
            },

            timeout : {
                type : Number,
                default : 5000
            }
        }
    }
</script>