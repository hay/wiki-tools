<template>
    <ul>
        <li v-for="item in data" class="thumbnail">
            <a v-if="item.thumb" v-bind:href="item.item.value" target="_blank">
                <img v-bind:src="item.thumb" v-if="item.thumb" />
            </a>

            <h3 v-if="item.itemLabel">{{item.itemLabel.value}}</h3>
            <p v-if="item.itemDescription">{{item.itemDescription.value}}</p>
            <small><a v-if="item.item" v-bind:href="item.item.value" target="blank">{{item.id}}</a></small>
        </li>
    </ul>
</template>

<script>
export default {
    props : {
        data : Array
    }
}
</script>

<style scoped>
ul {
    padding: 0;
    display: flex;
    flex-wrap: wrap;
}

li {
    width: calc(25% - 10px);
    margin: 5px;
}
</style>