<script setup lang="ts">
import {
  MDBBtn, MDBRadio, MDBCard, MDBRow, MDBCol, MDBAlert, MDBContainer, MDBCardImg, MDBCardBody, MDBCardTitle, MDBCardText, MDBCardFooter
} from 'mdb-vue-ui-kit';

import {computed, onMounted, ref, watch} from "vue";

import _patientcases from "../assets/patientcases_de.json";
import {useRoute, useRouter} from "vue-router";
import {imageServer} from "../process_vars";
import {PatientCase} from "../app_store";
const router = useRouter()
const route = useRoute()
const props = defineProps(['casenumber'])

const patientcases: Record<string, PatientCase> = _patientcases

const patient = computed(() => {
  if (Object.keys(patientcases).includes( props.casenumber.toString())) {
    return patientcases[ props.casenumber ];
  } else return patientcases[ "1" ];
})

</script>

<template>
<MDBContainer class="text-center">
  <MDBCard class="m-2 p-2">
    <MDBCardImg top :src="imageServer()+'patient_cases/'+patient.pic"/>
    <MDBCardBody>
      <MDBCardTitle>
        {{ patient.title }}
      </MDBCardTitle>
      <MDBCardText>
        {{ patient.history }}
      </MDBCardText>
    </MDBCardBody>
    <MDBCardFooter class="p-2">
    <router-link :to="route.query.redirect?.toString() || '/'">Zu den Fragebögen</router-link>
    </MDBCardFooter>
  </MDBCard>
</MDBContainer>
</template>

<style scoped>

</style>