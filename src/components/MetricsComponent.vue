<script setup lang="ts">

import {VueScrollPicker} from "vue-scroll-picker";
import {computed, inject, ref, watch} from "vue";
import {AuspraegungBeschwerden, AuspraegungColor, UmweltColor, UmweltFaktoren} from "../constants";
import VueSlider from "vue-3-slider-component";
import {user_store} from "../user_store";

import __sf36 from "../assets/sf36_de.json";
import {MDBIcon} from "mdb-vue-ui-kit";

const _sf36: Record<string, Record<string, any>> = __sf36

const props = defineProps({
  module: {type: String, default: 'icf'},
  icfmode: {type: String, default: 'large'},
  icfcode: {type: String, default: ''},
  item: {type: String, default: ''}
})

const selector_type = computed(() => user_store.getState().selector_type)

const optionslist = computed(() => {
  return props.icfcode[0] === 'e' ? (UmweltFaktoren.map((x, idx) => {
    return {text: x, value: idx}
  })) : (AuspraegungBeschwerden.map((x, idx) => {
    return {text: x, value: idx}
  }))
})

const optionslistSf36 = computed(() => {
  let sf36_item = _sf36[props.item]
  let optlist = []
  if (Object.keys(sf36_item).includes('answers')) {
    optlist = sf36_item.answers.map((x: string, idx: number) => ({name: x, value: idx}))
  }
  return optlist
})


const optionslistEnv = ref([
  {name: 'positiv (gut)', value: 5, icon: 'thumbs-up'}, {
    name: 'positiv und negativ (zugleich gut und schlecht)',
    value: 9,
    icon: 'plus-minus'
  }, {name: 'negativ (schlecht)', value: 3, icon: 'thumbs-down'}, {name: 'gar nicht', value: 4, icon: 'circle-xmark'},
])

const scroll_optionslist = computed(() => {
  if (props.module === 'sf36') return optionslistSf36.value
  if (props.module === 'env') return (selector_type.value==='slider') ?  optionslistEnv.value.sort((a, b) => a.value - b.value) : optionslistEnv.value
  else return optionslist.value.map(x => ({name: x.text, value: x.value}))
})

const result = inject('result', 0)

const res2 = ref(result)

const color = computed(() => {
  if ((props.icfcode[0] === 'e') || (props.module==='env')) return UmweltColor[res2.value]
  else return AuspraegungColor[res2.value]
})

const tooltipPlacement = computed(() => {
  if (props.module==='env') return (res2.value > 5) ? 'left' : 'top'
  else return (res2.value > (scroll_optionslist.value.length / 2)) ? 'left' : 'top'
})
</script>

<template>
  <div v-if="scroll_optionslist">

    <VueScrollPicker v-if="selector_type==='scroller'"
                     :options="scroll_optionslist"
                     v-model:model-value="result"
                     :style="`font-size: ${icfmode==='large' ? '20px':'16px'}`">
      <template #default="{ option }" v-if="module==='env'">
        <div class="custom-option">
          <MDBIcon class="custom-option-icon" :icon="option.icon"/>
          <span>{{ option.name }}</span>
        </div>
      </template>
    </VueScrollPicker>

    <VueSlider
        v-if="selector_type==='slider'"
        v-model="result"
        :data="scroll_optionslist"
        :data-label="'name'"
        :data-value="'value'"
        :tooltip="'always'"
        :tooltip-placement="tooltipPlacement"
        class="m-4 mb-6"
    ><template v-slot:label="{ label, active }">
        <div :class="['vue-slider-mark-label', 'custom-label', { active }]"></div>
      </template>
    </VueSlider>
  </div>
</template>

<style>
.custom-label {
  height: 25px;
  width: 25px;
  background-color: #fff6cd;
  border-radius: 50%;
  display: inline-block;
}

.custom-label.active {
  background-color: v-bind('color');
}

.custom-option {
  padding: 2px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-option-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  fill: currentColor;
}
</style>