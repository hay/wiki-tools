<template>
    <div class="search-keyword">
        <button>
            <span class="icon"
                  v-bind:data-icon="keyword.type"></span>
        </button>

        <div class="search-keyword__action">
            <span>depicts</span>
        </div>

        <div class="search-keyword__value">
            <span>cat</span>
        </div>

        <button>
            <span class="icon"
                  data-icon="remove"></span>
        </button>
    </div>
</template>

<script>
    export default {
        computed : {
            keyword() {
                return {
                    type : 'tag'
                }
            }
        }
    }
</script>