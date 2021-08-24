<template>
    <div>
        <h2 class="screen__title">
            Leaderboard
        </h2>

        <p class="screen__subtitle">
            These fabulous people have helped adding a grand total of
            <strong>{{data.total}}</strong> statements to Wikimedia Commons.
        </p>

        <table class="leaderboard">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Edits</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="(row, index) in data.stats">
                    <td>{{index + 1}}</td>
                    <td>
                        <a v-bind:href="row.userLink"
                           target="_blank">{{row.user}}</a>
                    </td>
                    <td>{{row.edits}}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                data : []
            }
        },

        async mounted() {
            const data = await this.$store.state.api.getLeaderboard();

            data.stats = data.stats.map((row) => {
                row.userLink = `https://commons.wikimedia.org/wiki/User:${row.user}`;
                return row;
            });

            this.data = data;
        }
    }
</script>