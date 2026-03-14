<template>
    <div class="leaderboard__wrapper">
        <h2 class="screen__title">
            {{leaderboardLabel}}
        </h2>

        <template v-if="hasItems">
            <p class="screen__subtitle"
               v-html="subtitle"></p>

            <table class="leaderboard">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{{ $t('name') }}</th>
                        <th>{{ $t('edits') }}</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(row, index) in data.stats"
                        v-show="index < maxRows || showAll">
                        <td>{{index + 1}}</td>
                        <td>
                            <a v-bind:href="row.userLink"
                               target="_blank">{{row.user}}</a>
                        </td>
                        <td>{{ numberWithCommas(row.edits) }}</td>
                    </tr>
                </tbody>
            </table>

            <wm-button
                v-show="!showAll && data.stats.length > maxRows"
                class="leaderboard__button"
                icon="eye"
                flair="default,bare"
                v-on:click="showAll = true">
                {{ $t('show_all_rows') }}</wm-button>
        </template>

        <template v-if="!hasItems">
            <p class="screen__subtitle">
                {{$t('empty_leaderboard')}}
            </p>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { numberWithCommas } from '../util';
import { useDepictorStore } from '../store';

interface LeaderboardRow {
    user: string;
    edits: number;
    userLink?: string;
}

interface LeaderboardData {
    total: number;
    stats: LeaderboardRow[];
}

const { challenge } = defineProps<{
    challenge?: string | null;
}>();

const store = useDepictorStore();
const { t: $t } = useI18n();

const data = ref<LeaderboardData>({ total: 0, stats: [] });
const maxRows = 10;
const showAll = ref(false);

const hasItems = computed(() => data.value.total > 0);

const leaderboardLabel = computed(() =>
    challenge ? $t('leaderboard') : $t('global_leaderboard')
);

const subtitle = computed(() => 
    $t('leaderboard_total', { 
        total: numberWithCommas(data.value.total)
     })
);

onMounted(async () => {
    const result = await store.api.getLeaderboard(challenge ?? null);
    result.stats = result.stats.map((row: LeaderboardRow) => ({
        ...row,
        userLink: `https://commons.wikimedia.org/wiki/User:${row.user}`,
    }));
    data.value = result;
});
</script>