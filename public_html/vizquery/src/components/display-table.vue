<template>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Label</th>
                <th>Description</th>
                <th>Wikipedia article</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="row in data">
                <td>
                    <a v-if="row.item" v-bind:href="row.item.value" target="blank">{{row.id}}</a>
                </td>
                <td>
                    <template v-if="row.itemLabel">{{row.itemLabel.value}}</template>
                </td>
                <td>
                    <template v-if="row.itemDescription">{{row.itemDescription.value}}</template>
                </td>
                <td>
                    <a v-if="row.sitelink" target="_blank" v-bind:href="row.sitelink.value">
                        Wikipedia article
                    </a>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
export default {
    props : {
        data : Array
    }
}
</script>

<style scoped>
table {
    width: 100%;
}

tr {
    border-bottom: 10px solid white; /* bit of a hack */
}
</style>