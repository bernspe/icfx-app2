<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSelect, MDBIcon, MDBBadge, MDBAnimation,
  MDBTextarea
} from 'mdb-vue-ui-kit'
import {app_store, Explanation, WhodasEnvItemStructure} from "../app_store";
import __whodas from '../assets/whodas12_de.json';
import __env from '../assets/env_factors_de.json'

const _whodas: Record<string, WhodasEnvItemStructure> = __whodas;
const _env: Record<string, WhodasEnvItemStructure> = __env;

import {computed, onMounted, ref} from "vue";
import SpeechTextInput from "./SpeechTextInput.vue";

const props = defineProps({
  whodas_or_env: {type: String, default: 'whodas'},
  patientid: {type: String},
  item: {type: String, required: true}
})

const whodasEnv = computed(() => {
  if (props.whodas_or_env === 'whodas') return Object.values(_whodas)
  if (props.whodas_or_env === 'env') return Object.values(_env)
  return []
})

const explanationList = ref<Array<Explanation>>([])
const getExplanations = () => {
  app_store.loadExplanationsFromApi(props.whodas_or_env+'_'+props.item).then(r=>explanationList.value=r)
}

onMounted(()=> {
  getExplanations()
})

</script>

<template>
  <MDBCard class="m-2">
    <MDBCardHeader>
      <h1 class="text-primary text-center">{{ whodasEnv[Number(item) - 1].t }}</h1>
      <p class="text-secondary text-center">{{ whodasEnv[Number(item) - 1].d }}</p>
    </MDBCardHeader>
    <MDBCardBody>
      <MDBRow v-if="whodasEnv[Number(item) - 1].e">
        <h2 class="text-primary">Erklärungen von unseren Mitarbeitern</h2>
        <MDBListGroup class="m-2 p-2">
          <MDBListGroupItem v-for="explanation in whodasEnv[Number(item) - 1].e">
            <p>{{ explanation }}</p>
          </MDBListGroupItem>
        </MDBListGroup>
      </MDBRow>

      <MDBRow>
        <h2 class="text-primary">Wie es andere Patienten verstanden haben...</h2>
        <p class="text-secondary" v-if="explanationList?.length===0">noch keine Einträge</p>
                <MDBListGroup class="m-2 p-2">
          <MDBListGroupItem v-for="APIexplanation in explanationList">
            <p :class="APIexplanation.validator ? '' : 'text-secondary'">{{ APIexplanation.text }}</p>
            <p v-if="!APIexplanation.validator"  class="d-flex justify-content-end text-secondary small" >Noch nicht validiert</p>
          </MDBListGroupItem>
        </MDBListGroup>
      </MDBRow>

      <MDBRow>
        <h2 class="text-primary">Hilf anderen Menschen beim Verstehen</h2>
        <h4 class="text-secondary">... und erkläre Ihnen Deine Sichtweise</h4>
        <SpeechTextInput :refcode="whodas_or_env+'_'+item" @explained="getExplanations"/>
      </MDBRow>
    </MDBCardBody>

    <MDBCardFooter>
      <MDBRow class="d-flex align-items-center">
        <MDBCol class="justify-content-start">
          <router-link :to="`/patientdata/${whodas_or_env}/${patientid}/${item}`">Aha - Verstanden. Zurück zur Auswahl</router-link>
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
  </MDBCard>
</template>

<style scoped>

</style>