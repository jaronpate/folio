<script setup lang="ts">
import { Comment, Fragment, Text, type VNode } from 'vue';

const slots = useSlots();

function flatten(nodes: VNode[]): VNode[] {
    return nodes.flatMap((node) => {
        if (node.type === Fragment && Array.isArray(node.children)) {
            return flatten(node.children as VNode[]);
        }
        return [node];
    });
}

function isIgnorable(node: VNode) {
    if (node.type === Comment) return true;
    if (node.type === Text) return !String(node.children ?? '').trim();
    return false;
}

function typeName(node: VNode) {
    const type = node.type;
    if (typeof type === 'string') return type;
    if (typeof type === 'object' && type) {
        const named = type as { name?: string; __name?: string };
        return named.name ?? named.__name ?? '';
    }
    return '';
}

function isImage(node: VNode) {
    const name = typeName(node);
    if (name === 'img' || /Img$/i.test(name)) return true;
    return typeof node.props?.src === 'string';
}

function isImageOnly(nodes: VNode[]) {
    const visible = flatten(nodes).filter((node) => !isIgnorable(node));
    return visible.length > 0 && visible.every(isImage);
}
</script>

<template>
    <slot v-if="isImageOnly(slots.default?.() ?? [])" />
    <p v-else>
        <slot />
    </p>
</template>
