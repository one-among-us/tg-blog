<template>
    <div id="Location">
        <div class="map">
            <LMap :options="options" :zoom="zoom" :center="center" :minZoom="3" :maxZoom="16">
                <LMarker :lat-lng="marker"/>
                <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            layer-type="base"
                            name="OpenStreetMap"/>
            </LMap>
        </div>

        <div class="info" v-if="f.title">
            <div class="title" v-if="f.title">{{f.title}}</div>
            <div class="address" v-if="f.address">{{f.address}}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css";
import "leaflet"
import {LMap, LMarker, LTileLayer} from "@vue-leaflet/vue-leaflet";
import {TGLocationFile} from "@/logic";
import {computed} from "vue";

const props = defineProps<{
    f: TGLocationFile
}>()
const f = computed(() => props.f)

const options = {scrollWheelZoom: false}
const center = computed(() => [f.value.latitude, f.value.longitude])
const marker = computed(() => center.value)

const zoom = 14
</script>

<style lang="sass" scoped>
@use "css/colors" as *

.map
    height: 400px

.info
    margin: 10px 20px

    .title
        font-weight: bold

    .address
        font-size: 0.9em
        color: $color-text-light
</style>
