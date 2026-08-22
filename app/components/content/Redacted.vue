<script setup lang="ts">
import {
    redactionFamily,
    resolveRedactionStrength,
} from '~/utils/fonts';

const props = withDefaults(
    defineProps<{
        strength?: number | string;
    }>(),
    {
        strength: 100,
    },
);

const grade = computed(() => resolveRedactionStrength(props.strength));
const family = computed(
    () => `'${redactionFamily(grade.value)}', Georgia, serif`,
);
</script>

<template>
    <span
        class="redacted"
        :data-strength="grade"
        :style="{ fontFamily: family }"
    ><slot /></span>
</template>

<style scoped>
.redacted {
    font-weight: 400;
}

:where(strong, b) .redacted {
    font-weight: 700;
}
</style>
