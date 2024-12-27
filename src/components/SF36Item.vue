<<script setup lang="ts">
import {
  MDBCard,
  MDBCardImg,
  MDBCardTitle,
  MDBCardBody,
  MDBCardFooter,
  MDBRow,
  MDBCol,
  MDBProgressBar, MDBProgress, MDBSpinner
} from 'mdb-vue-ui-kit'
import {VueScrollPicker} from 'vue-scroll-picker'
import {computed, onMounted, ref, watch} from "vue";
import {AuspraegungBeschwerden, UmweltFaktoren} from "../constants";
import {app_store, type DataStore} from "../app_store";
import {onBeforeRouteLeave, onBeforeRouteUpdate} from "vue-router";
import {imageServer} from "../process_vars";
import {random} from "lodash";
import __sf36 from "../assets/sf36_de.json";

const _sf36:Record<string,Record<string,any>> = __sf36

const props = defineProps({
  patientid: {type: String},
  item: {type: String, required: true}
})

const navigate = ref(false)

const sf36_item_number  = computed(()=>Object.keys(_sf36).indexOf(props.item))

const percentDone = computed(() => {
    return Math.floor(sf36_item_number.value / Object.keys(_sf36).length * 100)
})

const backUrl = computed(() => {
  if (sf36_item_number.value > 0) return `/patientdata/sf36/${props.patientid}/${Object.keys(_sf36)[sf36_item_number.value - 1]}`
  else return `/patientview/${props.patientid}`
})

const upUrl = computed(() => {
  return `/patientview/${props.patientid}`
})

const nextUrl = computed(() => {
  if (sf36_item_number.value < Object.keys(_sf36).length-1) return `/patientdata/sf36/${props.patientid}/${Object.keys(_sf36)[sf36_item_number.value + 1]}`
  else return `/modulefinish/sf36/${props.patientid}`
})

const optionslist = computed(()=> {
  let sf36_item = _sf36[props.item]
  let optlist = []
  if (Object.keys(sf36_item).includes('answers')) {
    optlist = sf36_item.answers.map((x:string, idx: number) => ({name: x, value: idx}))
  }
  return optlist
})


const result = computed({
  get: () => {
    let data = app_store.getState().patient_data.sf36
    let ks = Object.keys(data || {})
    if (ks.includes(props.item)) {
      return Number(data[props.item])
    } else {
      return _sf36[props.item].default
    }
  },
  set: (val) => {
    let data: DataStore = app_store.getState().patient_data
      data = {...data, sf36: {...app_store.getState().patient_data.sf36, [props.item]: val}}
    app_store.setCurrentData(data)
  }
})

const calculated_data = computed(() => {
  let data: DataStore = app_store.getState().patient_data
    data = {...data, sf36: {...app_store.getState().patient_data.sf36, [props.item]: result.value}}
  return data
})


onBeforeRouteLeave((to, from) => {
  navigate.value=true
  app_store.saveDataToApi(calculated_data.value).finally(() => {
    navigate.value=false
    return true
  })
})


// same as beforeRouteUpdate option but with no access to `this`
onBeforeRouteUpdate(async (to, from) => {
  navigate.value=true
  app_store.saveDataToApi(calculated_data.value).finally(() => {
     navigate.value=false
    return true
  })
})

</script>

<template>
  <MDBCard class="m-2 p-2 text-center d-flex justify-content-center">
      <MDBProgress class="m-2" :height="20">
        <MDBProgressBar :value="percentDone" animated bg="success">
          Geschafft: {{ percentDone }}%
        </MDBProgressBar>
      </MDBProgress>
    <MDBCardTitle class="m-4">{{ _sf36[props.item].question }}</MDBCardTitle>
    <MDBCardBody class="m-0 p-0">
      <VueScrollPicker v-if="optionslist.length>0"
          :options="optionslist"
          v-model:model-value="result"
          style="font-size: 20px">
      </VueScrollPicker>
      <h5 class="text-secondary" v-if="!_sf36[props.item].answers">Die Fragen kommen auf den nächsten Seiten. Klicke einfach auf Weiter.</h5>
    </MDBCardBody>
    <MDBCardFooter>
      <MDBRow class="d-flex align-items-center">
        <MDBCol class="justify-content-start">
          <router-link :to="backUrl">Zurück</router-link>
        </MDBCol>
        <MDBCol class="justify-content-center">
          <router-link :to="upUrl">Abbruch</router-link>
        </MDBCol>
        <MDBCol class="justify-content-end">
          <router-link :to="nextUrl">Weiter</router-link>
           <MDBSpinner v-if="navigate" class="ms-3" color="primary" size="sm" />
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
  </MDBCard>
</template>

<style src="vue-scroll-picker/lib/style.css">

</style>