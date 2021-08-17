<template>
    <div class="screen">
        {{qid}}
    </div>
</template>

<script>
    export default {
        computed : {
            qid() {
                return this.$store.state.currentQid;
            }
        }
    }
</script>