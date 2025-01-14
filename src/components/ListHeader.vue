<script setup lang="ts">

import {MDBBtn, MDBCol, MDBIcon, MDBRow, MDBSwitch, MDBPopconfirm} from "mdb-vue-ui-kit";
import {computed, ref, watch} from "vue";
import {user_store} from "../user_store";
import {imageServer, mode} from "../process_vars";
import {app_store} from "../app_store";


const props = defineProps(['label', 'showDetails', 'percentEdited', 'patientid', 'lastItemEdited', 'module', 'numberIcfItems', 'showClearIcfItemsButton', 'startButtonActive'])
const emit = defineEmits(['showDetailsChanged', 'clear'])
const _showDetails = ref(props.showDetails)

const showStartOrWeiterButton = computed(() => {
  if (props.module === 'icf') return props.numberIcfItems !== 0
  else return props.percentEdited < 100
})

const firstItemToGo = computed(() => {
  return Object.keys(app_store.getState().patient_data[props.module])[0]
})

const TestBetrieb = ref(mode() === 'LOCAL')

const isPatient = computed(() => user_store.getState().groups.includes('patient'))

// Details have changed to show all ICF Items, even the ones deselected
watch(_showDetails, (newVal, oldVal) => {
  emit('showDetailsChanged', newVal)
})
</script>

<template>
  <MDBRow class="d-flex align-items-center">
    <MDBCol>
      <img style="max-height: 55px; width: auto; object-fit: contain" :src="imageServer()+`module-types/${module}.png`"
           :alt="module"/>
    </MDBCol>
    <MDBCol>
      <h2>
        {{ label }}
      </h2>
    </MDBCol>

    <MDBCol v-if="numberIcfItems!==0">
      <span class="text-secondary">{{ numberIcfItems }} Einträge</span>
    </MDBCol>
    <!--
    <MDBCol class="text-secondary" v-if="!isPatient || TestBetrieb">
      <MDBSwitch label="Alle ansehen" v-model="_showDetails"/>
    </MDBCol>
    -->
    <MDBCol v-if="percentEdited>=100">
      <MDBPopconfirm
          class="me-1 btn-outline-danger"
              tag="button"
              icon="fa fa-trash"
        message="Willst du wirklich alles löschen?"
        cancel-label="Nein"
        confirm-label="Ja"
        @confirm="emit('clear')"
      >
        <MDBIcon icon="trash" class="me-2"></MDBIcon> Löschen
      </MDBPopconfirm>
    </MDBCol>
    <MDBCol class="d-flex justify-content-end">
      <div v-if="percentEdited>=100">
        <router-link router-link :to="`/patientdata/${module}/${patientid}/${firstItemToGo}`" v-if="startButtonActive">
          <MDBBtn outline="primary" class="m-1">
            <span class="me-2">Re-Start</span>
            <MDBIcon icon="play"/>
          </MDBBtn>
        </router-link>

        <router-link :to="`/patientresult/${module}/${patientid}/`">
          <MDBBtn outline="success" class="m-1">
            Ergebnisse
            <MDBIcon class="me-2" icon="circle-check"/>
          </MDBBtn>
        </router-link>
      </div>
      <div v-else-if="showStartOrWeiterButton && startButtonActive">
        <router-link :to="`/moduleintro/${module}/${patientid}`" v-if="percentEdited===0">
          <MDBBtn outline="primary" class="m-1">
            <span class="me-2">Start</span>
            <MDBIcon icon="play"/>
          </MDBBtn>
        </router-link>

        <div v-else>
          <router-link router-link :to="`/patientdata/${module}/${patientid}/${firstItemToGo}`">
            <MDBBtn outline="primary" class="m-1">
              <span class="me-2">Re-Start</span>
              <MDBIcon icon="play"/>
            </MDBBtn>
          </router-link>
          <router-link router-link :to="`/patientdata/${module}/${patientid}/${lastItemEdited}`">
            <MDBBtn outline="primary" class="m-1">
              <!--
              <span class="me-2">{{ percentEdited }}% Weiter</span>
              -->
              <span class="me-2">Weiter</span>
              <MDBIcon icon="play"/>
            </MDBBtn>
          </router-link>
        </div>
      </div>
    </MDBCol>
  </MDBRow>
</template>

<style scoped>

</style>