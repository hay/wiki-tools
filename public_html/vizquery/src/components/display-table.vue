<template>
    <table>
        <thead>
            <tr>
                <th v-for="key in header">
                    {{formatKey(key)}}
                </th>

                <th>Article</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="(row, index) in data">
                <td>
                    <a v-if="row.item" v-bind:href="row.item.value" target="blank">
                        {{row.id}}
                    </a>
                </td>

                <td v-for="key in keys">
                    {{key in row ? row[key].value || '' : ''}}
                </td>

                <td v-if="row.sitelink">
                    <a v-bind:href="row.sitelink.value"
                       target="_blank">
                       Wikipedia article
                    </a>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
    function isLabel(key) {
        return key.includes('Label') || key.includes('Description');
    }

    export default {
        computed : {
            header() {
                return ['ID'].concat(this.keys);
            },

            keys() {
                return Object.keys(this.data[0]).filter(isLabel);
            }
        },

        methods : {
            formatKey(key) {
                return key.replace('Label', '');
            }
        },

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