<template>
    <div id="Location">
        <div class="map">
            <LMap :zoom="zoom" :center="center" :minZoom="3" :maxZoom="16">
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

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import "leaflet/dist/leaflet.css";
import "leaflet"
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import {Prop} from "vue-property-decorator";
import {TGLocationFile} from "@/logic";

@Options({components: {LMap, LTileLayer, LMarker}})
export default class Location extends Vue
{
    @Prop({required: true}) f: TGLocationFile
    marker: number[]

    get center()
    {
        const f = this.f
        return [f.latitude ?? f.location?.longitude, f.longitude ?? f.location?.longitude]
    }

    created()
    {
        this.marker = this.center
    }

    zoom = 14
}
</script>

<style lang="sass" scoped>
@import "src/css/colors"

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
