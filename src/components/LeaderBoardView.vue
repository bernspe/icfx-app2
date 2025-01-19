<script setup lang="ts">

import {MDBCard, MDBCardHeader, MDBCardFooter, MDBCardBody, MDBCol, MDBRow, MDBCardImg, MDBListGroup, MDBListGroupItem, MDBBtn, MDBIcon, MDBDatatable, MDBCardText, MDBSpinner} from "mdb-vue-ui-kit";

import {computed, onMounted, ref} from "vue";
import {user_store} from "../user_store";
import {imageServer} from "../process_vars";
import AvatarImage from "./AvatarImage.vue";
import GroupImage from "./GroupImage.vue";

const _userdata = computed(()=>user_store.getState().userdata)

const leaderdata = ref({
  columns: ['Pseudonym','Gruppe','Patienten','Varianz', 'Punkte'],
  rows:[]
})

const loading = ref(false)


onMounted(()=>{
  loading.value=true
  user_store.getInstitutionsLeaderboard().then(r=>{
    leaderdata.value.rows = r.map(entry=>{
      let idx = _userdata.value.map(u => u.id).indexOf(entry[0])
      let pts = Math.floor(entry[1]/(entry[2]!==0 ? entry[2] : 1) * 1000)
      let varianz = Math.floor(entry[2]*1000)/1000
    return [_userdata.value[idx].pseudonym, _userdata.value[idx].groups[0],entry[1],varianz,pts]
    }).sort((a,b)=>b[4]-a[4])
  }).finally(()=>loading.value=false)
})
</script>

<template>
  <MDBCard class="m-2 p-2 text-center d-flex justify-content-center">
    <MDBCardImg top style="max-height: 200px; width: auto; object-fit: contain" :src="imageServer()+`gold-medal.png`" />
    <MDBCardHeader>
      <h1>Leaderboard</h1>
      <MDBRow v-if="loading" class="m-3">
        <MDBSpinner class="me-4"></MDBSpinner> <span class="text-secondary">Lade Daten...</span>
      </MDBRow>

    </MDBCardHeader>

    <MDBCardBody>

      <MDBListGroup>
        <MDBListGroupItem>
           <MDBRow class="align-items-center">
             <MDBCol><h3 class="text-primary">Platz</h3></MDBCol>
             <MDBCol v-for="c in leaderdata.columns"><h4>{{ c }}</h4></MDBCol>
           </MDBRow>
        </MDBListGroupItem>

        <MDBListGroupItem v-for="(row,idx) in leaderdata.rows">
          <MDBRow class="align-items-center">
            <MDBCol><h3 class="text-primary">{{ idx+1 }}</h3></MDBCol>
            <MDBCol><AvatarImage :pseudonym="row[0]" size="50px"></AvatarImage></MDBCol>
            <MDBCol><GroupImage :group="row[1]"/></MDBCol>
            <MDBCol><span class="lead">{{ row[2] }}</span></MDBCol>
            <MDBCol><span class="lead">{{ row[3] }}</span></MDBCol>
            <MDBCol><span class="lead text-primary bold">{{ row[4] }}</span></MDBCol>
          </MDBRow>
        </MDBListGroupItem>
      </MDBListGroup>
    </MDBCardBody>

        <MDBCardText class="text-start">
      <h2 class="text-primary">Wie erfolgt die Berechnung und wer hat gewonnen?</h2>
      <ol>
        <li>Alle ICF Items eines Patienten werden in eine Tabelle geschrieben</li>
        <li>Es werden die Mittelwerte aus den ICF Codierungen aller Beurteilungen außer dem Behandler, um den es gerade geht und die Mittelwerte des Behandlers ermittelt</li>
        <li>Es gibt eine Mindestzahl von 2 beurteilten Patienten, um auf das Leaderboard zu kommen.</li>
        <li>Es wird die Varianz der o.g. Werte für jeden ICF Code berechnet. Datensätze, die aus kombinierten Daten von Patient und Behandler hervorgehen, werden ignoriert.</li>
        <li>Ausgegeben wird der Mittelwert dieser Varianzen</li>
        <li>Gewonnen hat der Teilnehmer mit den meisten Patienten und der kleinsten Varianz (ergo ergibt sich der Punktwert aus Anzahl Patienten durch Varianz * 1000)</li>
      </ol>
    </MDBCardText>
  </MDBCard>

</template>

<style scoped>

</style>