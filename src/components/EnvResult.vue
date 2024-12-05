<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon, MDBChart
} from 'mdb-vue-ui-kit'
import {computed, onMounted, ref} from "vue";
import {app_store, type DataStore} from "../app_store";
import {Auspraegung} from "../constants";
import {imageServer} from "../process_vars";



const props = defineProps({
  patientid: {type: String},
})

const data = ref<DataStore>(app_store.emptyDataStore())

const upUrl = computed(() => {
  return `/patientview/${props.patientid}`
})

onMounted(()=> {
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
    <h1 class="text-secondary">Ergebnis des Umweltfaktoren-Fragebogens</h1>
  </MDBCardHeader>
  <MDBCardBody>
  <h2>Sorry für die Baustelle</h2>
  <img :src="imageServer()+'/whodas-pics/version-1/man-hard-hat-with-helmet-drill-his-hand-is-digging-hole-building.jpg'" style="height:300px; width: auto; object-fit: contain;"/>
  <p class="lead">Wir arbeiten noch an einer Lösung.</p>
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