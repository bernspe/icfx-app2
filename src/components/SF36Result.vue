<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon, MDBChart
} from 'mdb-vue-ui-kit'
import {computed, onMounted, ref} from "vue";
import {app_store, type DataStore} from "../app_store";



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
    <h2 class="text-secondary">Ergebnis des SF36-Fragebogens</h2>
  </MDBCardHeader>
  <MDBCardBody>

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