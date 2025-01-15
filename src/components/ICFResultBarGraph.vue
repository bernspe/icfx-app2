<script setup lang="ts">

import {GChart} from "vue-google-charts";
import {MDBContainer, MDBCol, MDBRow, MDBMultiRange} from "mdb-vue-ui-kit";
import __icfcodes from "../assets/icf_codes3.json";

const _icfcodes: Record<string, ICFItemStructure> = __icfcodes;

import {computed, ref} from "vue";
import {ICFItemStructure} from "../app_store";
import {RowStructure} from "./ScientistsDashboard.vue";
import {Auspraegung, AuspraegungBeschwerden, UmweltFaktoren} from "../constants";

const props = defineProps({datarows: {type: Array<RowStructure>, required: true}})
const b_chart_data = ref()
const d_chart_data = ref()
const e_chart_data = ref()

const d_range = ref([0, 4])
const e_range = ref([-4, 4])

function between(x: number, min: number, max: number) {
  return x >= min && x <= max;
}

const displayIcfResults = computed(() => {
  // generate google charts dataset

  // return a dict with patients as keys
  let icf_data_dict = Object.fromEntries(props.datarows.map(r => {
        // apply range filters
        return [r.id, Object.fromEntries(Object.entries(r.icfdata).filter(([code, icfstruct]) => {
          if (icfstruct.selected > 0) {
            if ((code[0] === 'd') || (code[0] === 'b') || (code[0] === 's')){
              return between(icfstruct.value, d_range.value[0], d_range.value[1])
            }
            if (code[0] === 'e') {
              return between(icfstruct.value - 4, e_range.value[0], e_range.value[1])
            }
          } else
            return false
        }))]
      })
  )
  let patients = props.datarows.map(r => r.id.toString())
  let patientslabels = props.datarows.map(r => r.patient + ': ' + r.id.toString())
  let icf_data_header = ['ICF Code', {type: 'string', role: 'annotation'}, ...patientslabels]
  let icf_codes = Array.from(new Set(props.datarows.map(r => Object.keys(r.icfdata)).flat()))
  let icf_codes_b = icf_codes.filter(x => x[0] === 'b')
  let icf_codes_d = icf_codes.filter(x => x[0] === 'd')
  let icf_codes_e = icf_codes.filter(x => x[0] === 'e')


    let b_icf_data_body = icf_codes_b.map(c => {
    return [c, _icfcodes[c].t, ...patients.map(p => (Object.keys(icf_data_dict[p]).includes(c)) ? icf_data_dict[p][c].value : 0)]
  }).filter(r_d => !r_d.slice(2).every(x => x === 0))

  let d_icf_data_body = icf_codes_d.map(c => {
    return [c, _icfcodes[c].t, ...patients.map(p => (Object.keys(icf_data_dict[p]).includes(c)) ? icf_data_dict[p][c].value : 0)]
  }).filter(r_d => !r_d.slice(2).every(x => x === 0))

  let e_icf_data_body = icf_codes_e.map(c => {
    return [c, _icfcodes[c].t, ...patients.map(p => (Object.keys(icf_data_dict[p]).includes(c)) ? icf_data_dict[p][c].value - 4 : 0)]
  }).filter(r_e => !r_e.slice(2).every(x => x === 0))

    if (b_icf_data_body.length !== 0) {
    b_chart_data.value = [icf_data_header, ...b_icf_data_body]
  }
  if (d_icf_data_body.length !== 0) {
    d_chart_data.value = [icf_data_header, ...d_icf_data_body]
  }
  if (e_icf_data_body.length !== 0) {
    e_chart_data.value = [icf_data_header, ...e_icf_data_body]
  }

  return ((d_icf_data_body.length !== 0) || (e_icf_data_body.length !== 0))
})
</script>

<template>
  <MDBContainer>
    <MDBRow>

      <MDBMultiRange
          v-model:first-value="d_range[0]"
          v-model:second-value="d_range[1]"
          :min="0"
          :max="4"
          label="Disability Range"></MDBMultiRange>

      <p>Werte zwischen {{ AuspraegungBeschwerden[d_range[0]] }} und {{ AuspraegungBeschwerden[d_range[1]] }}</p>

      <MDBMultiRange
          v-model:first-value="e_range[0]"
          v-model:second-value="e_range[1]"
          :min="-4"
          :max="4"
          label="Env Range"></MDBMultiRange>

      <p>Werte zwischen {{ UmweltFaktoren[e_range[0]+4]}} und {{ UmweltFaktoren[e_range[1]+4] }}</p>

    </MDBRow>
    <MDBRow v-if="displayIcfResults">
            <MDBCol v-if="b_chart_data">
        <GChart
            :settings="{ packages: ['corechart'] }"
            :options="{
        title: 'Body Functions ICFs',
        bars: 'vertical', bar: {groupWidth: '75%'}, width: 1000, height: 450,
        legend: {position: 'top', maxLines: 3},

      }"
            type="BarChart"
            :data="b_chart_data"
        />
      </MDBCol>
      <MDBCol v-if="d_chart_data">
        <GChart
            :settings="{ packages: ['corechart'] }"
            :options="{
        title: 'Disability ICFs',
        bars: 'vertical', bar: {groupWidth: '75%'}, width: 1000, height: 450,
        legend: {position: 'top', maxLines: 3},

      }"
            type="BarChart"
            :data="d_chart_data"
        />
      </MDBCol>

      <MDBCol v-if="e_chart_data">
        <GChart
            :settings="{ packages: ['corechart'] }"
            :options="{
        title: 'Environmental Factors ICFs',
        bars: 'vertical', bar: {groupWidth: '75%'}, width: 1000, height: 450,
        legend: {position: 'top', maxLines: 3},

      }"
            type="BarChart"
            :data="e_chart_data"
        />
      </MDBCol>
    </MDBRow>


  </MDBContainer>
</template>

<style scoped>

</style>