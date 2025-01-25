<script setup lang="ts">
import ICFThumbCard from "./ICFThumbCard.vue";
import {computed, provide, ref} from "vue";
import {user_store} from "../user_store";
import {app_store, DataStore, ICFStruct} from "../app_store";
import {onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter} from "vue-router";
import {MDBCol, MDBRow, MDBProgress, MDBProgressBar, MDBSpinner, MDBAlert, MDBContainer} from "mdb-vue-ui-kit";

const props = defineProps<{ code: string, patientid: string }>()

const navigate = ref(false)

const router = useRouter()
const route = useRoute()

const medOrPatient = computed(() => user_store.getState().groups.includes('patient') ? 'patient' : 'med')

const icfItemList = computed(() => Object.keys(app_store.getState().patient_data.icf))
const currentItemPosition = computed(() => icfItemList.value.indexOf(props.code))

const percentDone = computed(() => {
  if (icfItemList.value.length > 0)
    return Math.ceil((currentItemPosition.value+1) / icfItemList.value.length * 100)
  else return 0
})

const backUrl = computed(() => {
  if (currentItemPosition.value > 0) return `/patientdata/icf/${app_store.getState().current_patient_id}/${icfItemList.value[currentItemPosition.value - 1]}`
  else return `/${medOrPatient.value}view/${app_store.getState().current_patient_id}`
})

const upUrl = computed(() => {
  return `/${medOrPatient.value}view/${app_store.getState().current_patient_id}`
})

const nextUrl = computed(() => {
  if (currentItemPosition.value < icfItemList.value.length - 1) return `/patientdata/icf/${app_store.getState().current_patient_id}/${icfItemList.value[currentItemPosition.value + 1]}`
  else return `/modulefinish/icf/${app_store.getState().current_patient_id}`
})

const goToNext = () => {
  setTimeout(()=>router.push(nextUrl.value),1000)
}

/**
 * disapproves ICF selection status if it was 0 and was not changed
 */

const val2SelectionStatus = (code: string, val: number) => {
  if (code[0] === 'e') return (val!==4) ? 1 : -1
  else return (val!==0) ? 1 : -1
}
const modifySelectionStatus = (data: DataStore) => {
   let code = app_store.getState().active_icf
  return {...data, icf: {...app_store.getState().patient_data.icf, [code]: {...data.icf[code], selected: (data.icf[code].selected <1) ? val2SelectionStatus(code,data.icf[code].value) : 1}}}
}

onBeforeRouteLeave((to, from) => {
    navigate.value=true
  app_store.saveDataToApi(modifySelectionStatus(app_store.getState().patient_data)).finally(() => {
    navigate.value=false
    app_store.set_active_icf('')
    return true
  })
})

onBeforeRouteUpdate(async (to, from) => {
    navigate.value=true
  app_store.saveDataToApi(modifySelectionStatus(app_store.getState().patient_data)).finally(() => {
    navigate.value=false
    app_store.set_active_icf(to.params.code as string)
    return true
  })

})
</script>

<template>
   <MDBContainer class="text-center">
  <MDBRow class="d-flex align-items-center m-2 ">

      <MDBProgress class="m-2" :height="20">
        <MDBProgressBar :value="percentDone" animated bg="success">
          Geschafft: {{ percentDone }}%
        </MDBProgressBar>
      </MDBProgress>

    <div class="w-100"></div>
  </MDBRow>
<MDBRow class="d-flex justify-content-center">
  <ICFThumbCard :code="code"
                :backUrl="backUrl"
                :upUrl="upUrl"
                :nextUrl="nextUrl"
                :patientid="patientid"
                @next="goToNext"
                mode="large"/>
</MDBRow>
  <MDBRow class="d-flex align-items-center m-2">
    <MDBCol class="justify-content-center">
      <MDBSpinner v-if="navigate" class="ms-3" color="primary" size="lg" />
    </MDBCol>
  </MDBRow>
   </MDBContainer>
</template>

<style scoped>

</style>