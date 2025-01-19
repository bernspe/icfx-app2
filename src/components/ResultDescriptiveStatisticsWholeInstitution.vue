<script setup lang="ts">

import {RowStructure} from "./ScientistsDashboard.vue";
import {computed, onMounted, ref} from "vue";
import {user_store} from "../user_store";
import {app_store} from "../app_store";
import {GChart} from "vue-google-charts";

const patients = ref<Array<string>>()

const table_header = ['Item','Count']
const table_elements = ['patients','whodas','env','icf','sf36','uxquestionnaire']
const quantities = ref({patients:0, whodas:0, env:0, icf:0, sf36:0,uxquestionnaire:0})

const quantities_data = computed(()=> {
  return [table_header, ...table_elements.map(e=>([e,quantities.value[e]]))]
})

onMounted(()=> {
  patients.value=user_store.getState().userdata?.filter(x => x.groups.includes('patient')).map(u =>  u.id)
  patients.value.forEach(patient => {
    quantities.value.patients+=1
    app_store.loadDataFromApi(patient).then(r => {
        r.forEach(d => {
          ['whodas','env','icf','sf36','uxquestionnaire'].forEach(k=>{
            if (k==='env') {
              if (Object.values(d[k]).some(v=>v!==4)) quantities.value.env+=1
            } else {
              if (Object.values(d[k]).some(v=>v!==0)) quantities.value[k]+=1
            }
          })
        })
    })
  })
})
</script>

<template>
 <GChart v-if="quantities_data"
            :settings="{ packages: ['corechart'] }"
            :options="{
        title: 'Counts',
    bars: 'vertical', width: 1000, height: 450,
        legend: {position: 'top', maxLines: 3},

      }"
            type="BarChart"
            :data="quantities_data"
        />
</template>

<style scoped>

</style>