<script setup lang="ts">
import ICFThumbCard from "./ICFThumbCard.vue";
import {computed, provide} from "vue";
import {user_store} from "../user_store";
import {app_store} from "../app_store";
import {onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter} from "vue-router";
import {MDBCol, MDBRow, MDBProgress, MDBProgressBar} from "mdb-vue-ui-kit";
import InfoButton from "./InfoButton.vue";

const props = defineProps<{ code: string, patientid: string }>()


const router = useRouter()
const route = useRoute()

const medOrPatient = computed(() => user_store.getState().groups.includes('patient') ? 'patient' : 'med')

const icfItemList = computed(() => Object.keys(app_store.getState().patient_data.icf))
const currentItemPosition = computed(() => icfItemList.value.indexOf(props.code))

const percentDone = computed(() => {
  if (icfItemList.value.length > 0)
    return Math.floor(currentItemPosition.value / icfItemList.value.length * 100)
  else return 0
})

const backUrl = computed(() => {
  if (currentItemPosition.value > 0) return `/patientdata/icf/${props.patientid}/${icfItemList.value[currentItemPosition.value - 1]}`
  else return `/${medOrPatient.value}view/${props.patientid}`
})

const upUrl = computed(() => {
  return `/${medOrPatient.value}view/${props.patientid}`
})

const nextUrl = computed(() => {
  if (currentItemPosition.value < icfItemList.value.length - 1) return `/patientdata/icf/${props.patientid}/${icfItemList.value[currentItemPosition.value + 1]}`
  else return `/modulefinish/icf/${props.patientid}`
})

const goToNext = () => {
  setTimeout(()=>router.push(nextUrl.value),1000)

}

onBeforeRouteLeave((to, from) => {
  app_store.saveDataToApi(app_store.getState().patient_data).then(() => {
    app_store.set_active_icf('')
    return true
  })
})

onBeforeRouteUpdate(async (to, from) => {
  app_store.set_active_icf('')
  app_store.saveDataToApi(app_store.getState().patient_data).then(() => {
    app_store.set_active_icf(to.params.code as string)
    return true
  })

})
</script>

<template>
  <MDBRow class="d-flex align-items-center m-2 ">

      <MDBProgress class="m-2" :height="20">
        <MDBProgressBar :value="percentDone" animated bg="success">
          Geschafft: {{ percentDone }}%
        </MDBProgressBar>
      </MDBProgress>
    <!--
      <InfoButton component_name="ICFItem"/>
-->
    <div class="w-100"></div>
  </MDBRow>
  <ICFThumbCard :code="code"
                :backUrl="backUrl"
                :upUrl="upUrl"
                :nextUrl="nextUrl"
                :patientid="patientid"
                @next="goToNext"
                mode="large"/>
</template>

<style scoped>

</style>