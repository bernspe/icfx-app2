<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon, MDBChart
} from 'mdb-vue-ui-kit'
import {computed, onMounted, ref} from "vue";
import {app_store, type DataStore} from "../app_store";
import {Auspraegung, AuspraegungColor, AuspraegungTextColor, db_dateformat} from "../constants";
import {GChart} from "vue-google-charts";
import moment from "moment";
import {describeWhodasSum, getWhodasSum, normalizeWhodasSum} from "../calculation_helper";


const props = defineProps({
  patientid: {type: String},
})

const data = ref<DataStore>(app_store.emptyDataStore())

const historical_data = ref<Array<DataStore>>([app_store.emptyDataStore()])

const upUrl = computed(() => {
  return `/patientview/${props.patientid}`
})




const gaugeChartData = computed(()=> (
   [
  ['Label', 'Value'],
  ['Behinderung', normalizeWhodasSum(getWhodasSum(data.value.whodas))],
]
))

const gaugeChartOptions = {
          width: 400, height: 220,
          greenFrom:0, greenTo:25,
          yellowFrom:25, yellowTo: 50,
          redFrom: 50, redTo: 100,
          minorTicks: 5
        };

const whodasProgressDataset = computed(() => {
  const h = [{ type: 'date', id: 'Zeitpunkt' },{ type: 'number', id: 'WHODAS' }]
    return [
      h,
        ...historical_data.value.filter(datapoint=>Object.keys(datapoint.whodas || {}).length!==0).map(datapoint=>{
          return [new Date(moment(datapoint.date, db_dateformat).toDate()),normalizeWhodasSum(getWhodasSum(datapoint.whodas))]
        })
    ]
})

onMounted(()=> {
    if (props.patientid) {
      app_store.loadDataFromApi(props.patientid).then(r => {
        data.value = Object.assign({}, r[0])
        historical_data.value = r
      })
    }
})
</script>

<template>
<MDBCard class="m-2 p-2 w-75 text-center">
  <MDBCardHeader>
    <h1 class="text-secondary">Ergebnis des Whodas-Fragebogens</h1>
  </MDBCardHeader>
  <MDBCardBody>
    <MDBRow class="d-flex align-items-center">
      <MDBCol>
         <h2 class="text-secondary">Gesamtscore</h2>
        <h2 class="text-primary">{{ normalizeWhodasSum(getWhodasSum(data.whodas)) }} / 100 </h2>
      </MDBCol>
      <MDBCol>
            <GChart v-if="data.whodas"
              :settings="{ packages: ['gauge'] }"
              type="Gauge"
              :data="gaugeChartData"
              :options="gaugeChartOptions" />
      </MDBCol>
    </MDBRow>
    <MDBRow>
            <p>0 = keine, 100 = maximale Behinderung</p>
            <p>Das bedeutet, dass Sie <strong
                :style="{'color':AuspraegungTextColor[Math.ceil((getWhodasSum(data.whodas))/12)]}">
              {{ describeWhodasSum(getWhodasSum(data.whodas)) }} Behinderung </strong> erfahren. </p>
      </MDBRow>
    <MDBRow>
      <h2 class="text-secondary">Mein Fortschritt</h2>
         <GChart
              v-if="whodasProgressDataset"
              :settings="{ packages: ['corechart'] }"
              :options="{
                    title: 'Entwicklung',
                    width: 800,
                    height: 400,
                    curveType: 'function',
                    lineWidth: 4,
                    vAxes: {
                      0: {title: 'Behinderung'},
                    },
                    legend: {position: 'top', maxLines: 3},
              }"
              type="LineChart"
              :data="whodasProgressDataset"
          />
    </MDBRow>

    <MDBRow>
      <h2 class="text-secondary">Ich und die anderen</h2>
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