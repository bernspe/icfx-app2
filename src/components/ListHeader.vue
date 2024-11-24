<script setup lang="ts">

import {MDBBtn, MDBCol, MDBIcon, MDBRow, MDBSwitch} from "mdb-vue-ui-kit";
import {computed, ref, watch} from "vue";
import {user_store} from "../user_store";
import {imageServer, mode} from "../process_vars";

const props = defineProps(['label', 'showDetails', 'percentEdited', 'patientid', 'lastItemEdited', 'module', 'numberIcfItems', 'showClearIcfItemsButton', 'startButtonActive'])
const emit = defineEmits(['showDetailsChanged', 'clearIcfs'])
const _showDetails = ref(props.showDetails)

const showStartOrWeiterButton = computed(() => {
  if (props.module === 'icf') return props.numberIcfItems !== 0
  else return props.percentEdited < 100
})

const TestBetrieb = ref(mode() === 'LOCAL')

const isPatient = computed(() => user_store.getState().groups.includes('patient'))

watch(_showDetails, (newVal, oldVal) => {
  emit('showDetailsChanged', newVal)
})
</script>

<template>
  <MDBRow class="d-flex align-items-center">
    <MDBCol>
      <img style="max-height: 55px; width: auto; object-fit: contain" :src="imageServer()+`module-types/${module}.png`" :alt="module"/>
    </MDBCol>
    <MDBCol>
      <h2>
        {{ label }}
      </h2>
    </MDBCol>

    <MDBCol v-if="numberIcfItems!==0">
      <span class="text-secondary">{{ numberIcfItems }} Einträge</span>
    </MDBCol>
    <MDBCol class="text-secondary" v-if="!isPatient || TestBetrieb">
      <MDBSwitch label="Details ansehen" v-model="_showDetails"/>
    </MDBCol>
    <MDBCol class="d-flex justify-content-end">
      <router-link :to="`/patientresult/${module}/${patientid}/`" v-if="percentEdited===100">
        <MDBBtn outline="success">
          Ergebnisse
          <MDBIcon class="me-2" icon="circle-check"/>
        </MDBBtn>
      </router-link>

      <div v-else-if="showStartOrWeiterButton && startButtonActive">
        <router-link :to="`/moduleintro/${module}/${patientid}`" v-if="percentEdited===0">
          <MDBBtn outline="primary">
            <span class="me-2">Start</span>
            <MDBIcon icon="play"/>
          </MDBBtn>
        </router-link>

        <router-link router-link :to="`/patientdata/${module}/${patientid}/${lastItemEdited}`" v-else>
          <MDBBtn outline="primary">
            <span class="me-2">{{ percentEdited }}% Weiter</span>
            <MDBIcon icon="play"/>
          </MDBBtn>
        </router-link>
      </div>
    </MDBCol>
  </MDBRow>
</template>

<style scoped>

</style>