<script setup lang="ts">
import {MDBListGroup, MDBListGroupItem, MDBBadge,MDBBtn, MDBInput, MDBRow, MDBCol, MDBCard, MDBCardHeader,MDBCardBody,MDBCardFooter,MDBContainer, MDBCardImg} from 'mdb-vue-ui-kit'
import {computed, ref} from "vue";
import {user_store} from "../user_store";
import AvatarImage from "./AvatarImage.vue";
import {roles} from "../constants";
import {imageServer} from "../process_vars";

const isMedProf = computed(()=> user_store.getState().groups.some(g=> roles.map(r => r.group).filter(item => item !== 'patient').includes(g)))
</script>

<template>
<MDBContainer class="text-center">
  <MDBCard class="m-3 p-2">
    <MDBCardHeader>
      <h1 class="text-secondary">Herzlich Willkommen</h1>
    </MDBCardHeader>
    <MDBCardBody class="m-2 mb-6 p-2">
      <h2 class="text-primary">Ihr Name (Pseudonym) bei uns ist ...</h2>
      <MDBRow>
        <MDBCol class="d-flex justify-content-center">
      <AvatarImage :pseudonym="user_store.getState().pseudonym" label_position="right"/>
          </MDBCol>
        </MDBRow>
      <p>Sie benötigen dieses <span class="text-decoration-underline">Pseudonym</span> und Ihre <span class="text-decoration-underline">PIN</span>, um sich hier anzumelden, sollten Sie das Programm einmal für längere Zeit verlassen haben.</p>
      <p>Am besten Sie notieren sich jetzt das Pseudonym und machen dann weiter.</p>

      <MDBRow class="d-flex align-items-center mt-4">
        <p>Im Programm werden Ihnen Auswahlmöglichkeiten begegnen. Man kann eine Auswahl über einen sogenannten Scroller (wie beim iPhone) tätigen, oder über einen Slider. Sie können dies hier einstellen, aber auch später im Menü noch verändern.</p>
        <h3 class="text-secondary">Wie wollen Sie wählen ?</h3>
        <MDBCol class="d-flex justify-content-center" md="6">
          <MDBCard :class="'m-2 '+(user_store.getState().selector_type==='scroller' ? 'activeSelectorImg' : '')" @click="user_store.set_selector_type('scroller')" style="max-width: 20rem;">
            <MDBCardHeader><h4 class="text-secondary">Scroller</h4></MDBCardHeader>
          <img :src="imageServer()+'scroller.jpg'" alt="scroller"/>
            </MDBCard>
        </MDBCol>
       <MDBCol class="d-flex justify-content-center" md="6">
          <MDBCard :class="'m-2 '+(user_store.getState().selector_type==='slider' ? 'activeSelectorImg' : '')" @click="user_store.set_selector_type('slider')" style="max-width: 20rem;">
            <MDBCardHeader><h4 class="text-secondary">Slider</h4></MDBCardHeader>
           <img :src="imageServer()+'slider.jpg'" alt="slider"/>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      <MDBRow v-if="user_store.getState().patient_case" class="m-3 p-2">
        <h3 class="text-primary">Fallbeispiel</h3>
        <p>Wir haben für Sie einen medizinischen Fall zum Trainieren vorbereitet.</p>
        <p>Sie sollten sich den Fall jetzt hier erst einmal anschauen!</p>
        <router-link :to="`/patientcase/${user_store.getState().patient_case}?redirect=/patientview/${user_store.getState().id}`">
          <MDBBtn color="primary">
          Hier geht's zum Fallbeispiel</MDBBtn></router-link>
      </MDBRow>
    </MDBCardBody>
    <MDBCardFooter>
      <router-link v-if="isMedProf" :to="`/patientlist`">Weiter zur Patientenliste</router-link>
      <router-link v-else :to="`/patientview/${user_store.getState().id}`">Weiter zu den Fragebögen</router-link>
    </MDBCardFooter>
  </MDBCard>
</MDBContainer>
</template>

<style>
.activeSelectorImg {
  border: 8px solid green;
  border-radius: 5px;
  padding: 5px;
}
</style>