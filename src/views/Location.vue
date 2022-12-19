<template>
    <div id="Location">
        <LMap :zoom="zoom" :center="[f.latitude ?? f.location?.longitude, f.longitude ?? f.location?.longitude]"
            :minZoom="3" :maxZoom="16">
            <LTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                layer-type="base"
                name="OpenStreetMap"
            ></LTileLayer>
        </LMap>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import "leaflet/dist/leaflet.css";
import "leaflet"
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import {Prop} from "vue-property-decorator";
import {TGLocationFile} from "@/logic";

@Options({components: {LMap, LTileLayer}})
export default class Location extends Vue
{
    @Prop({required: true}) f: TGLocationFile

    zoom = 14
}
</script>

<style lang="sass" scoped>
#Location
    height: 400px
</style>
