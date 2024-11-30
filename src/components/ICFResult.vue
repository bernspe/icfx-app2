<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon, MDBChart
} from 'mdb-vue-ui-kit'

import {computed, onMounted, ref} from "vue";
import {app_store, type DataStore, ICFItemStructure} from "../app_store";
import __icfcodes from "../assets/icf_codes3.json";
import {imageServer} from "../process_vars";
import { VNetworkGraph } from "v-network-graph"
import "v-network-graph/lib/style.css"



const _icfcodes: Record<string, ICFItemStructure> = __icfcodes;


const props = defineProps({
  patientid: {type: String},
})

const data = ref<DataStore>(app_store.emptyDataStore())

const upUrl = computed(() => {
  return `/patientview/${props.patientid}`
})


const sortedList = ref()

const downgrade = (item: any, i: number) => {
  sortedList.value.splice(i, 1)
  sortedList.value.splice(i + 1, 0, item)
}

const upgrade = (item: any, i: number) => {
  sortedList.value.splice(i, 1)
  sortedList.value.splice(i - 1, 0, item)
}

onMounted(() => {
  if (props.patientid) {
    app_store.loadDataFromApi(props.patientid).then(r => {
      data.value = Object.assign({}, r[0])
      sortedList.value = Object.keys(r[0].icf)
    })
  }
})
</script>

<template>
  <MDBCard class="m-2 p-2">
    <MDBCardHeader>
      <h2 class="text-secondary">Ergebnisse der ICFs</h2>
    </MDBCardHeader>
    <MDBCardBody>
      <MDBListGroup>
        <MDBListGroupItem v-for="(item,idx) in sortedList">
          <MDBRow class="align-items-center">
            <MDBCol class="d-flex justify-content-start">
              <img
                  :src="imageServer()+`icf-pics/${item}.jpg`"
                  :alt="item"
                  style="max-height: 80px; width:auto; object-fit: contain"
              />
            </MDBCol>

            <MDBCol>
              {{ _icfcodes[item]?.t }}
            </MDBCol>

            <MDBCol class="d-flex justify-content-end">
              <MDBBtn size="lg" color="tertiary" @click="downgrade(item,idx)">
                <MDBIcon v-if="idx<sortedList.length-1" icon="arrow-down"/>
              </MDBBtn>
              <MDBBtn size="lg" color="tertiary" @click="upgrade(item,idx)">
                <MDBIcon v-if="idx>0" icon="arrow-up"/>
              </MDBBtn>
            </MDBCol>
          </MDBRow>
        </MDBListGroupItem>
      </MDBListGroup>
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