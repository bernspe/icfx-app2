<script setup lang="ts">
import {
  MDBCard,
  MDBCardImg,
  MDBCardTitle,
  MDBCardBody,
  MDBCardFooter,
  MDBRow,
  MDBCol,
  MDBProgressBar, MDBProgress, MDBIcon, MDBCardHeader, MDBSpinner
} from 'mdb-vue-ui-kit'
import {VueScrollPicker} from 'vue-scroll-picker'
import {WhodasEnvItemStructure} from "../app_store";
import __whodas from '../assets/whodas12_de.json';


const _whodas: Record<string, WhodasEnvItemStructure> = __whodas;

import {computed, onMounted, ref, watch} from "vue";
import {AuspraegungBeschwerden, UmweltFaktoren} from "../constants";
import {app_store, type DataStore} from "../app_store";
import {onBeforeRouteLeave, onBeforeRouteUpdate} from "vue-router";
import {imageServer} from "../process_vars";


const props = defineProps({
  patientid: {type: String},
  item: {type: String, required: true}
})

const navigate = ref(false)

function get_random(list: Array<String>) {
  return list[Math.floor((Math.random() * list.length))];
}

const percentDone = computed(() => {
  return Math.floor(Number(props.item) / 12 * 100)
})

const current_img = computed(() => {
  return get_random(whodas.value[Number(props.item) - 1]?.p)
})

const whodas = computed(() => {
   return Object.values(_whodas)
})

const backUrl = computed(() => {
  if (Number(props.item) > 1) return `/patientdata/whodas/${props.patientid}/${Number(props.item) - 1}`
  else return `/patientview/${props.patientid}`
})

const upUrl = computed(() => {
  return `/patientview/${props.patientid}`
})

const nextUrl = computed(() => {
  if (Number(props.item) < whodas.value.length) return `/patientdata/whodas/${props.patientid}/${Number(props.item) + 1}`
  else return `/modulefinish/whodas/${props.patientid}/`
})

const optionslist = ref( (AuspraegungBeschwerden.map((x, idx) => {
      return {text: x, value: idx}
    }))
)

const scroll_optionslist = computed(() => {
  return optionslist.value.map(x => ({name: x.text, value: x.value}))
})

const result = computed({
  get: () => {
    let data =  app_store.getState().patient_data.whodas
    let ks = Object.keys(data || {})
    if (ks.includes(props.item)) {
      return Number(data[props.item])
    } else {
      return  0
    }
  },
  set: (val) => {
    let data: DataStore = app_store.getState().patient_data
      data = {...data, whodas: {...app_store.getState().patient_data.whodas, [props.item]: val}}
    app_store.setCurrentData(data)
  }
})

const calculated_data = computed(() => {
  let data: DataStore = app_store.getState().patient_data
    data = {...data, whodas: {...app_store.getState().patient_data.whodas, [props.item]: result.value}}
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

    <img
        :src="imageServer()+`whodas-pics/version-1/${current_img}`"
        :alt="`Whodas Image for item ${item}`"
        style="max-height:280px;max-width:100%; object-fit: contain; border-radius:10px;"
        class="image-blurred-edge"
    />

    <MDBCardHeader>
      <p class="text-primary">{{ whodas[Number(item) - 1].t }}</p>
    </MDBCardHeader>

    <MDBCardBody class="m-0 p-0">
      <VueScrollPicker
          :options="scroll_optionslist"
          v-model:model-value="result"
          style="font-size: 20px">
      </VueScrollPicker>

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