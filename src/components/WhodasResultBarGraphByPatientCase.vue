<script setup lang="ts">

import {GChart} from "vue-google-charts";
import {MDBContainer, MDBCol, MDBRow, MDBMultiRange} from "mdb-vue-ui-kit";
import __icfcodes from "../assets/icf_codes3.json";

const _icfcodes: Record<string, ICFItemStructure> = __icfcodes;

import {computed, ref} from "vue";
import {ICFItemStructure} from "../app_store";
import {RowStructure} from "./ScientistsDashboard.vue";
import {WhodasEnvItemStructure} from "../app_store";
import __whodas from '../assets/whodas12_de.json';
const _whodas: Record<string, WhodasEnvItemStructure> = __whodas;

const props = defineProps({datarows: {type: Array<RowStructure>, required: true}})
const w_chart_data = ref()



const displayWhodasResultScatter = computed(() => {
  // generate google charts dataset
    // return a dict with patients as keys
  let whodas_data_dict = Object.fromEntries(props.datarows.map(r => {
        // apply range filters
        return [r.id, r.whodas]
      })
  )
  let patients = props.datarows.map(r => r.id.toString())
  let patientslabels = props.datarows.map(r => r.patient + ': ' + r.id.toString())
  let whodas_header = ['Whodas Item', {type: 'string', role: 'annotation'}, ...patientslabels]
  let whodas_items = [1,2,3,4,5,6,7,8,9,10,11,12]

  let whodas_data_body = whodas_items.map(w => {
    return [w, _whodas[w.toString()].s, ...patients.map(p => whodas_data_dict[p][w.toString()])]
  }).filter(wo=>wo[2])


  if (whodas_data_body.length !== 0) {
    w_chart_data.value = [whodas_header, ...whodas_data_body]
  }

  return (whodas_data_body.length !== 0)
})
</script>

<template>
  <MDBContainer>
 <MDBRow v-if="displayWhodasResultScatter && w_chart_data">

        <GChart
            :settings="{ packages: ['corechart'] }"
            :options="{
        title: 'Whodas Datapoints',
    bars: 'vertical', bar: {groupWidth: '75%'}, width: 1000, height: 450,
        legend: {position: 'top', maxLines: 3},

      }"
            type="BarChart"
            :data="w_chart_data"
        />


    </MDBRow>

  </MDBContainer>
</template>

<style scoped>

</style>