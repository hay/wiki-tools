<template>
    <div class="search-keyword"
         v-bind:expanded="expanded">
        <button class="search-keyword__button"
                v-bind:is-minus="isMinus"
                v-on:click="toggleMinus">
            <span class="icon"
                  v-bind:data-icon="keyword.icon"></span>

            <span class="search-keyword__button-text"
                v-show="isMinus">{{$t('minus')}}</span>
        </button>

        <div class="search-keyword__value"
             v-if="keyword.type === 'text'">
            <input type="text"
                   class="search-keyword__input"
                   v-on:input="input($event.target.value)"
                   v-bind:value="keyword.value" />
        </div>

        <category-entry
            v-if="keyword.type === 'category'"
            class="search-keyword__value"
            v-on:expand="expanded = true"
            v-on:contract="expanded = false"
            v-on:input="input($event)"
            v-bind:value="keyword.value"></category-entry>

        <wbstatement-entry
            v-if="keyword.type === 'wbstatement'"
            v-on:expand="expanded = true"
            v-on:contract="expanded = false"
            v-on:input="input($event)"
            v-bind:value="keyword.value"></wbstatement-entry>

        <button class="search-keyword__button"
                v-on:click="remove">
            <span class="icon"
                  data-icon="remove"></span>
        </button>
    </div>
</template>

<script>
    import CategoryEntry from './category-entry.vue';
    import WbstatementEntry from './wbstatement-entry.vue';

    function hasMinus(keyword) {
        return keyword.startsWith('-');
    }

    function removeMinus(keyword) {
        return keyword.replace(/^-+/, '');
    }

    function parseKeyword(keyword) {
        keyword = keyword.trim();

        // We remove the minus (-) operator here, because it is added
        // dynamically in this component
        if (hasMinus(keyword)) {
            keyword = removeMinus(keyword);
        }

        if (keyword.startsWith('haswbstatement')) {
            const icon = keyword.startsWith('haswbstatement:P180') ? 'image' : 'tag';

            return {
                icon : icon,
                type : 'wbstatement',
                value : keyword
            };
        } else if (keyword.startsWith('deepcat') || keyword.startsWith('incategory')) {
            return {
                icon : 'category',
                type : 'category',
                value : keyword
            }
        } else {
            return {
                icon : 'text',
                type : 'text',
                value : keyword
            };
        }
    }

    export default {
        components : { CategoryEntry, WbstatementEntry },

        computed : {
            keyword() {
                return parseKeyword(this.value);
            }
        },

        data() {
            return {
                expanded : false,
                isMinus : this.value.startsWith('-')
            };
        },

        methods : {
            input(value) {
                value = this.isMinus ? `-${value}` : removeMinus(value);
                this.$emit('input', value);
            },

            remove() {
                this.$emit('remove');
            },

            toggleMinus() {
                this.isMinus = !this.isMinus;
                this.input(this.value);
            }
        },

        props : {
            value : {
                type : String
            }
        }
    }
</script>