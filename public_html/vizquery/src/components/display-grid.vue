<template>
    <ul class="display__grid">
        <li v-for="item in data" class="thumbnail">
            <a v-if="item.thumb" v-bind:href="item.item.value" target="_blank">
                <img v-bind:src="item.thumb" v-if="item.thumb" />
            </a>

            <h3 v-if="item.itemLabel">{{item.itemLabel.value}}</h3>
            <p v-if="item.itemDescription">{{item.itemDescription.value}}</p>

            <ul class="list-inline">
                <li v-if="item.item">
                    <small><a v-bind:href="item.item.value" target="blank">{{item.id}}</a></small>
                </li>

                <li v-if="item.sitelink">
                    <small><a target="_blank" v-bind:href="item.sitelink.value">Wikipedia article</a></small>
                </li>
            </ul>
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
.display__grid {
    padding: 0;
    display: flex;
    flex-wrap: wrap;
}

.display__grid > li {
    width: calc(25% - 10px);
    margin: 5px;
}
</style>