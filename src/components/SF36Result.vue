<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon, MDBChart
} from 'mdb-vue-ui-kit'
import {computed, onMounted, ref} from "vue";
import {app_store, type DataStore} from "../app_store";
import __sf36 from '../assets/sf36_de.json'
import _sf36_categories from '../assets/sf36_categories_de.json'
import _ from "lodash";
import {Auspraegung} from "../constants";
import {GChart} from "vue-google-charts";
import {getWhodasSum, normalizeWhodasSum} from "../calculation_helper";

const _sf36: Record<string, Record<string, any>> = __sf36

const props = defineProps({
  patientid: {type: String},
})


const data = ref<DataStore>(app_store.emptyDataStore())

const upUrl = computed(() => {
  return `/patientview/${props.patientid}`
})

const scale_columns = _sf36_categories


const aggregatedData = computed(() => {
  let target: Record<string, number> = {}
  let pdata = data.value.sf36
  let pdata_keys = Object.keys(pdata)
  Object.entries(scale_columns).forEach(([category, content]) => {
    target[category] = _.mean(content.keys.map(k => {
      let qsize = _sf36[k].answers.length
      let n = pdata_keys.includes(k) ? pdata[k]+1 : _sf36[k].default+1
      return 100/(qsize-1) * ((_sf36[k].default===qsize-1) ? (n-1) : (qsize-n) )
    }))
  })
  return target
})

const gaugeChartOptions = {
  width: 150, height: 150,
  greenFrom: 70, greenTo: 100,
  yellowFrom: 20, yellowTo: 70,
  redFrom: 0, redTo: 20,
  minorTicks: 5
};


onMounted(() => {
  if (props.patientid) {
    app_store.loadDataFromApi(props.patientid).then(r => {
      data.value = Object.assign({}, r[0])
    })
  }
})
</script>

<template>
  <MDBCard class="m-2 p-2">
    <MDBCardHeader>
      <h2 class="text-secondary">Ergebnis des SF36-Fragebogens</h2>
    </MDBCardHeader>
    <MDBCardBody>
      <MDBRow>
        <h2 class="text-secondary">Meine gesundheitsbezogene Lebensqualität</h2>
        <p>Ergebnis unterteilt in verschiedene Lebensbereiche. 100 = volle Lebensqualität</p>
        <MDBRow>
          <MDBCol v-for="([k,v]) in Object.entries(aggregatedData)">
            <h3 class="text-primary">{{ k }}</h3>
                      <GChart
                  :settings="{ packages: ['gauge'] }"
                  type="Gauge"
                  :data="[ ['Label', 'Value'],[k,v]]"
                  :options="gaugeChartOptions"/>
          </MDBCol>
        </MDBRow>
      </MDBRow>
    </MDBCardBody>
    <MDBCardFooter>
      <MDBRow class="d-flex align-items-center">
        <MDBCol class="justify-content-start">
          <router-link :to="upUrl">Zurück</router-link>
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
  </MDBCard>
</template>

<style scoped>

</style>