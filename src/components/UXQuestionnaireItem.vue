<script setup lang="ts">
import {
  MDBCard,
  MDBCardImg,
  MDBCardTitle,
  MDBCardBody,
  MDBCardFooter,
  MDBRow,
  MDBCol,
  MDBProgressBar, MDBProgress, MDBSpinner,
  MDBInput
} from 'mdb-vue-ui-kit'
import {VueScrollPicker} from 'vue-scroll-picker'
import {computed, onMounted, ref, watch} from "vue";
import {app_store, type DataStore} from "../app_store";
import {onBeforeRouteLeave, onBeforeRouteUpdate} from "vue-router";
import __uxq_patient from "../assets/uxquestionnaire_patient_de.json";
import __uxq_medprof from "../assets/uxquestionnaire_medprof_de.json";
import {user_store} from "../user_store";

const isPatient = computed(() => user_store.getState().groups.includes('patient'))

const _uxq = computed<Record<string,any>>(()=> isPatient.value ? __uxq_patient : __uxq_medprof)

const props = defineProps({
  patientid: {type: String},
  item: {type: String, required: true}
})

const navigate = ref(false)

const uxq_item_number = computed(() => Object.keys(_uxq.value).indexOf(props.item))

const percentDone = computed(() => {
  return Math.floor(uxq_item_number.value / Object.keys(_uxq.value).length * 100)
})

const backUrl = computed(() => {
  if (uxq_item_number.value > 0) return `/patientdata/uxquestionnaire/${props.patientid}/${Object.keys(_uxq.value)[uxq_item_number.value - 1]}`
  else return upUrl.value
})

const upUrl = computed(() => {
  return isPatient.value ? `/patientview/${props.patientid}` : `medview/${props.patientid}`
})

const nextUrl = computed(() => {
  if (uxq_item_number.value < Object.keys(_uxq.value).length - 1) return `/patientdata/uxquestionnaire/${props.patientid}/${Object.keys(_uxq.value)[uxq_item_number.value + 1]}`
  else return `/modulefinish/uxquestionnaire/${props.patientid}`
})

const optionslist = computed(() => {
  let uxq_item = _uxq.value[props.item]
  let optlist = []
  if (Object.keys(uxq_item).includes('answers')) {
    if (uxq_item.answers)
      optlist = uxq_item.answers.map((x: string, idx: number) => ({name: x, value: idx}))
    else
      optlist = []
  }
  return optlist
})


const result = computed({
  get: () => {
    let data = app_store.getState().patient_data.uxquestionnaire
    let ks = Object.keys(data || {})
    if (ks.includes(props.item)) {
      if (_uxq.value[props.item].answers) // is this a wheel val
        return Number(data[props.item])
      else
        return data[props.item] // return string
    } else {
      return _uxq.value[props.item].default
    }
  },
  set: (val) => {
    let data: DataStore = app_store.getState().patient_data
    data = {...data, uxquestionnaire: {...app_store.getState().patient_data.uxquestionnaire, [props.item]: val}}
    app_store.setCurrentData(data)
  }
})

const calculated_data = computed(() => {
  let data: DataStore = app_store.getState().patient_data
  data = {...data, uxquestionnaire: {...app_store.getState().patient_data.uxquestionnaire, [props.item]: result.value}}
  return data
})


onBeforeRouteLeave((to, from) => {
  navigate.value = true
  app_store.saveDataToApi(calculated_data.value).finally(() => {
    navigate.value = false
    return true
  })
})


// same as beforeRouteUpdate option but with no access to `this`
onBeforeRouteUpdate(async (to, from) => {
  navigate.value = true
  app_store.saveDataToApi(calculated_data.value).finally(() => {
    navigate.value = false
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
    <MDBCardTitle class="m-4">{{ _uxq[props.item].question }}</MDBCardTitle>
    <MDBCardBody class="m-0 p-0">
      <VueScrollPicker v-if="optionslist?.length>0 && _uxq[props.item].answers"
                       :options="optionslist"
                       v-model:model-value="result"
                       style="font-size: 20px">
      </VueScrollPicker>
      <MDBRow v-else class="m-4">
        <MDBInput label="Texteingabe" v-model="result"></MDBInput>
      </MDBRow>
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
          <MDBSpinner v-if="navigate" class="ms-3" color="primary" size="sm"/>
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
  </MDBCard>
</template>

<style src="vue-scroll-picker/lib/style.css">

</style>