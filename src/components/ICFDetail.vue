<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSelect, MDBIcon, MDBBadge, MDBAnimation,
    MDBTextarea
} from 'mdb-vue-ui-kit'
import _icfcodes from "../assets/icf_codes3.json";
import {app_store} from "../app_store";
import {computed} from "vue";

const props = defineProps<{ code: string , patientid:string, mode?: string , backUrl?:string, upUrl?: string, nextUrl?: string}>()

</script>

<template>
  <MDBCard
      class="m-2">
            <MDBCardHeader>
          <h2 class="text-primary text-center">{{ _icfcodes[code].t }}</h2>

        </MDBCardHeader>
    <MDBCardBody>
      <MDBListGroup class="m-2 p-2">
        <MDBListGroupItem>
          <h5 class="text-primary">Offizielle Erklärung der WHO</h5>
          <p>{{ _icfcodes[code].h }}</p>
        </MDBListGroupItem>

        <MDBListGroupItem>
          <h5 class="text-primary">Erklärung von unseren Mitarbeitern</h5>
          <p>Bla Bla</p>
        </MDBListGroupItem>

                <MDBListGroupItem>
          <h5 class="text-primary">Wie es andere Patienten verstanden haben...</h5>
          <p>Bla Bla</p>
        </MDBListGroupItem>

        <MDBListGroupItem>
          <h5 class="text-primary">Was verstehst Du darunter?</h5>
          <MDBRow>
            <MDBCol col="10">
          <MDBTextarea rows="4" label="Ich verstehe darunter ...">
          </MDBTextarea>
              </MDBCol>
            <MDBCol col="2">
              <MDBBtn color="primary" floating><MDBIcon icon="microphone"/></MDBBtn>
            </MDBCol>
          </MDBRow>
        </MDBListGroupItem>
      </MDBListGroup>
    </MDBCardBody>

    <MDBCardFooter>
      <MDBRow class="d-flex align-items-center">
        <MDBCol class="justify-content-start">
          <router-link :to="`/patientdata/icf/${patientid}/${code}`">Zurück</router-link>
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
  </MDBCard>
</template>

<style scoped>

</style>