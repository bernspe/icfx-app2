<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBRange
} from 'mdb-vue-ui-kit'
import {computed, onMounted, ref} from "vue";
import {app_store, type DataStore} from "../app_store";
import __sf36 from '../assets/sf36_de.json'
import _sf36_categories from '../assets/sf36_categories_de.json'
import __sf36_normdata from '../assets/sf36_normdata.json'
import _ from "lodash";
import {Auspraegung} from "../constants";
import {GChart} from "vue-google-charts";
import {VueScrollPicker} from "vue-scroll-picker";


const _sf36: Record<string, Record<string, any>> = __sf36
const _sf36_normdata: Record<string, any> = __sf36_normdata

const props = defineProps({
  patientid: {type: String},
})


const data = ref<DataStore>(app_store.emptyDataStore())

const upUrl = computed(() => {
  return `/patientview/${props.patientid}`
})

const scroll_optionslist = [
  {name: '18 - 29', value: '18-29'},
  {name: '30 - 39', value: '30-39'},
  {name: '40 - 49', value: '40-49'},
  {name: '50 - 59', value: '50-59'},
  {name: '60 - 69', value: '60-69'},
  {name: '70+', value: '70-79'},
]

const scroll_optionslist2 = [
  {name: 'weiblich', value: 'f'},
  {name: 'männlich', value: 'm'},
  {name: 'divers', value: 't'}
]

const result_age = ref('18-29')
const result_sex = ref('f')
const normdata_indexstring = computed(() => result_sex.value + '_' + result_age.value)

interface SF36Category {
  title: string
  keys: Array<string>
  gaugelabel: string
  abbr: string
  expl: string
}

const scale_columns: Array<SF36Category> = _sf36_categories


const aggregatedData = computed(() => {
  let pdata = data.value.sf36
  let pdata_keys = Object.keys(pdata)
  return scale_columns.map(sc => {
    return _.mean(sc.keys.map(k => {
      let qsize = _sf36[k].answers.length
      let n = pdata_keys.includes(k) ? pdata[k] + 1 : _sf36[k].default + 1
      return 100 / (qsize - 1) * ((_sf36[k].default === qsize - 1) ? (n - 1) : (qsize - n))
    }))
  })
})

const getGaugeChartOptions = (category: string) => {
  let min = _sf36_normdata[category + '_min'][normdata_indexstring.value]
  return {...gaugeChartOptions, greenFrom: min, yellowTo: min}
}

const gaugeChartOptions = {
  animation: {
    duration: 400,
    easing: 'easeInOut',
  },
  width: 150, height: 150,
  greenFrom: 70, greenTo: 100,
  yellowFrom: 20, yellowTo: 70,
  redFrom: 0, redTo: 20,
  minorTicks: 5
};

/**
 * Help to decide, if a value means someone is performing worse (-1), equal (0) or better (1) than the standard population
 * @param category
 * @param value
 */
const betterOrWorse = (category: string, value: number) => {
  if (value < _sf36_normdata[category + '_min'][normdata_indexstring.value]) return -1
  if (value > _sf36_normdata[category + '_max'][normdata_indexstring.value]) return 1
  return 0
}

onMounted(() => {
  if (props.patientid) {
    app_store.loadDataFromApi(props.patientid).then(r => {
      // find the first dataset which contains SF36 vals
      let t = r.filter(x=>Object.keys(x.sf36).length > 0)
      if (t.length!==0) data.value = Object.assign({}, t[0])
    })
  }
})
</script>

<template>
  <MDBCard class="m-2 p-2">
    <MDBCardHeader>
      <h1 class="text-secondary">Ergebnis des SF36-Fragebogens</h1>
    </MDBCardHeader>
    <MDBCardBody>
      <MDBRow>
        <h2 class="text-secondary">Meine gesundheitsbezogene Lebensqualität</h2>
        <p>Ergebnis unterteilt in verschiedene Lebensbereiche. 100 = volle Lebensqualität</p>
        <p>Um Ihre Ergebnisse im Licht der Allgemeinbevölkerung zu zeichnen, geben Sie bitte Alter und Geschlecht
          an.</p>
        <MDBCol>
          <VueScrollPicker
              :options="scroll_optionslist"
              v-model:model-value="result_age"
              style="font-size: 20px">
          </VueScrollPicker>
        </MDBCol>
        <MDBCol>
          <VueScrollPicker
              :options="scroll_optionslist2"
              v-model:model-value="result_sex"
              style="font-size: 20px">
          </VueScrollPicker>
        </MDBCol>
        <MDBRow v-if="Object.keys(data.sf36)?.length!==0">
          <MDBCol v-for="(s,idx) in scale_columns" :key="idx">
            <MDBCard class="m-1 p-1">
              <MDBCardHeader>
                <h3 class="text-primary text-center">{{ s.title }}</h3>
              </MDBCardHeader>
              <MDBCardBody>
                <MDBRow center class="d-flex">
                  <MDBCol>
                    <GChart
                        :settings="{ packages: ['gauge'] }"
                        type="Gauge"
                        :data="[ ['Label', 'Value'],[s.gaugelabel,aggregatedData[idx]]]"
                        :options="getGaugeChartOptions(s.abbr)"/>
                  </MDBCol>
                  <MDBCol>
                    <p class="lead">
                      Ihnen geht es in Bezug auf <span> {{ s.expl }} </span>
                      <span v-if="betterOrWorse(s.abbr,aggregatedData[idx])===-1"
                            class="text-danger"> schlechter als </span>
                      <span v-else-if="betterOrWorse(s.abbr,aggregatedData[idx])===1"
                            class="text-success"> besser als </span>
                      <span v-else class="text-primary">genauso  wie </span>
                      der gesunden deutschen Bevölkerung im Jahr 2008-2011.
                    </p>
                    <a href="https://link.springer.com/article/10.1007/s00103-013-1700-y#Sec6" class="small" target="_blank" >Bevölkerungsdaten aus Ellert, U. Bundesgesundheitsbl 2013</a>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
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

<style src="vue-scroll-picker/lib/style.css">

</style>