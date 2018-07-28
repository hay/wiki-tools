<template>
    <div class="subject-entry">
        <select v-model="item"
                v-if="subjects.length > 1">
            <option v-bind:value="subject"
                    v-for="subject in subjects">{{subject}}</option>
        </select>

        <p v-if="subjects.length === 1">it</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            item : this.value
        };
    },

    watch : {
        item(value) {
            this.$emit('input', value);
        }
    },

    props : {
        subjects : Array,
        value : String
    }
};
</script>