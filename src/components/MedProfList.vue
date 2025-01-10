<script setup lang="ts">

import {MDBListGroup, MDBListGroupItem, MDBBadge, MDBInput, MDBRow, MDBCol, MDBBtn, MDBIcon} from 'mdb-vue-ui-kit'
import _userdata from '../assets/mock-userdata.json'
import {computed, onMounted, ref} from "vue";
import {user_store, UserData} from "../user_store";
import {imageServer} from "../process_vars";
import {app_store} from "../app_store";
import InfoButton from "./InfoButton.vue";
import AvatarImage from "./AvatarImage.vue";
import {translate_pseudonym} from "../language_helper";


const medprof_list = ref<Array<UserData>>([])

const searchInput = ref('')

const searched_list = computed<Array<UserData>>(() => {
  if (searchInput.value) {
    return medprof_list.value.filter((p: UserData) => p.pseudonym.toLowerCase().includes(searchInput.value.toLowerCase()) || p.translated_pseudonym?.toLowerCase().includes(searchInput.value.toLowerCase()))
  } else
    return medprof_list.value
})


onMounted(() => {

  //TODO: Get MedProf list by institution from API
  medprof_list.value = _userdata.filter(p => !p.groups.includes('patient'))
      .filter(p => p.institution.id === user_store.getState().institution.id)
      .map(p => ({...p, translated_pseudonym: translate_pseudonym(p.pseudonym)}))
  // End of MOCK

  app_store.clearData()
})
</script>

<template>
  <MDBRow class="d-flex align-items-center m-2">
    <MDBCol class="d-flex justify-content-start">
      <h3 class="text-secondary m-4">Behandler auswählen</h3>
    </MDBCol>
    <MDBCol class="d-flex justify-content-end">
      <InfoButton component_name="MedProfList"/>
    </MDBCol>
  </MDBRow>

  <MDBInput
      inputGroup
      :formOutline="false"
      wrapperClass="mb-3"
      class="rounded"
      v-model="searchInput"
      aria-describedby="search-addon"
      aria-label="Search"
      placeholder="Pseudonym finden"
  >
    <template #prepend>
      <span class="input-group-text border-0" id="search-addon">@</span>
    </template>
  </MDBInput>
  <MDBListGroup light class="me-4">
    <MDBListGroupItem v-for="medprof in searched_list">
      <router-link :to="{name: 'patientlist',params:{medprofid:medprof.id}}">
        <MDBRow class="d-flex align-items-center">
          <MDBCol>
            <AvatarImage :pseudonym="medprof.pseudonym" size="55px" color="red" label_position="right"/>
          </MDBCol>
          <MDBCol>
            <img v-for="g in medprof.groups"
                 :src="imageServer()+`group-pics/${g}.jpg`"
                 alt=""
                 style="width: 45px; height: 45px"
                 class="rounded-circle"
            />
            <div v-for="g in medprof.groups" class="text-muted small">{{ g }}</div>
          </MDBCol>

          <MDBCol class="d-flex justify-content-end">
            Auswählen
          </MDBCol>
        </MDBRow>

      </router-link>

    </MDBListGroupItem>
  </MDBListGroup>
</template>

<style scoped>

</style>