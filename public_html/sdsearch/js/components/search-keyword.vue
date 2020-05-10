<template>
    <div class="search-keyword"
         v-bind:class="'search-keyword--' + keyword.type">
        <button>
            <span class="icon"
                  v-bind:data-icon="keyword.icon"></span>
        </button>

        <div class="search-keyword__value"
             v-if="keyword.type === 'text'">
            <input type="text"
                   class="search-keyword__input"
                   v-on:input="input($event)"
                   v-bind:value="keyword.value" />
        </div>
<!--
        <div class="search-keyword__value">
            <strong>depicts</strong>
        </div>

        <div class="search-keyword__value">
            <span>cat</span>
        </div>
 -->
        <button v-on:click="remove">
            <span class="icon"
                  data-icon="remove"></span>
        </button>
    </div>
</template>

<script>
    function parseKeyword(keyword) {
        keyword = keyword.trim();

        if (keyword.startsWith('haswbstatement')) {
            const [ query, prop, value ] = keyword.match(/haswbstatement:(.+)=(.+)/);

            return {
                icon : 'tag',
                type : 'wbstatement',
                prop, value
            };
        } else {
            return {
                icon : 'text',
                type : 'text',
                value : keyword
            };
        }
    }

    export default {
        computed : {
            keyword() {
                return parseKeyword(this.value);
            }
        },

        methods : {
            input(e) {
                if (this.keyword.type === 'text') {
                    this.$emit('input', e.target.value);
                }
            },

            remove() {
                this.$emit('remove');
            }
        },

        props : {
            value : {
                type : String
            }
        }
    }
</script>