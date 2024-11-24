<script setup lang="ts">

import ICFThumbCard from "./ICFThumbCard.vue";
import {MDBCol, MDBRow} from "mdb-vue-ui-kit";
import {ICFStruct} from "../app_store";
import {computed, PropType} from "vue";
import _icfcodes from '../assets/icf_codes3.json'

const props = defineProps({icfs:{type: Object as PropType<Record<string,ICFStruct>>,required:true}, patientid:{type:String, required:true}})

const paginatedIcfRecord = computed(()=> {
  let result: Record<string,Record<string,ICFStruct>> = {}
  Object.entries(props.icfs).forEach(([code,icfitem])=> {
    let parentCode = code.substring(0,2)
    if (Object.keys(result).includes(parentCode)) {
      result[parentCode]=Object.assign(result[parentCode],{[code]:icfitem})
    } else {
      result[parentCode]=Object.assign({},{[code]:icfitem})
    }
  })
  return result
})

</script>

<template>
  <div>
        <MDBRow v-for="([parentCode, icfcollection]) in Object.entries(paginatedIcfRecord)">
          <h5 class="text-secondary">{{ _icfcodes[parentCode]?.t }}</h5>
          <MDBCol v-for="([code,icfitem]) in Object.entries(icfcollection)">
            <ICFThumbCard mode='thumb' :code="code" :icfitem="icfitem" :patientid="patientid"/>
          </MDBCol>
        </MDBRow>
    </div>
</template>

<style scoped>

</style>