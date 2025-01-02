<script setup>
import {
  MDBNavbar,
  MDBSideNav, MDBSideNavItem, MDBSideNavLink, MDBSideNavMenu,
  MDBIcon, MDBBadge, MDBBtn
} from 'mdb-vue-ui-kit';
import {ref, computed, onMounted} from 'vue';
import {version} from "../../package.json"
import {user_store} from "../user_store.ts";
import {app_store} from "../app_store.ts";
import {imageServer} from "../process_vars.ts";

import AvatarImage from "./AvatarImage.vue";
import GroupImage from "./GroupImage.vue";


const sidenavScroll = ref(true);
const _userdata = computed(()=>user_store.getState().userdata)


const patient_pseudo = computed(() => {
  if (app_store.getState().current_patient_id && _userdata.value.length>0) {
    let idx = _userdata.value.map(u => u.id).indexOf(app_store.getState().current_patient_id)
    return _userdata.value[idx].pseudonym
  }
})

const patient_case = computed(()=> {
  if (app_store.getState().current_patient_id && _userdata.value.length>0) {
    let idx = _userdata.value.map(u => u.id).indexOf(app_store.getState().current_patient_id)
    return _userdata.value[idx].patient_case
  }
  if (user_store.getState().patient_case) return user_store.getState().patient_case
})

const patient_case_redirect = computed(()=> {
  if (user_store.getState().patient_case) return `/patientview/${user_store.getState().id}`
  if (medprof_pseudo.value) return `/medview/${app_store.getState().current_patient_id}`
  return '/'
})

const medprof_pseudo = computed(() => {
  if (user_store.getState().id && (!user_store.getState().groups.includes('patient')) && _userdata.value.length>0) {
    let idx = _userdata.value.map(u => u.id).indexOf(user_store.getState().id)
    return _userdata.value[idx].pseudonym
  }
})

const medprof_groups = computed(() => {
  if (user_store.getState().id && (!user_store.getState().groups.includes('patient')) && _userdata.value.length>0) {
    let idx = _userdata.value.map(u => u.id).indexOf(user_store.getState().id)
    return _userdata.value[idx].groups
  }
})


</script>

<template>
  <MDBBtn
      v-if="!sidenavScroll"
      color="primary"
      aria-controls="#sidenavScroll"
      @click="sidenavScroll = !sidenavScroll"
      floating
      style="position: fixed; z-index: 1000"
      class="m-4"
  >
    <MDBIcon icon="bars"/>
  </MDBBtn>


    <!-- Sidenav-->
    <MDBSideNav
        v-model="sidenavScroll"
        id="sidenavScroll"
        mode="side"
        contentSelector="#content"
        :modeBreakpoint="1400"
        :closeOnEsc="true"
            :backdrop="true"
        backdropStyle="position: fixed"
    >
      <MDBBtn
          color="primary"
          aria-controls="#sidenavRight"
          @click="sidenavScroll = !sidenavScroll"
          class="m-4"
      >
        <MDBIcon icon="bars"/>
      </MDBBtn>
      <div class="text-center" v-if="app_store.getState().current_patient_id.length===0">
        <router-link to="/"><h3 class="py-4">ICFx</h3></router-link>
        <hr class="m-0"/>
      </div>

      <div v-else-if="patient_pseudo" class="d-flex align-items-center py-4">
        <AvatarImage :pseudonym="patient_pseudo" size="55px"/>
        <GroupImage group="patient"/>
      </div>

      <div class="d-flex align-items-center justify-content-center" v-if="medprof_pseudo && patient_pseudo">
        <i class="fas fa-arrow-up-long text-primary m-3"></i>
        <span class="text-primary m-3">... beurteilt</span>
      </div>

      <div class="d-flex align-items-center mb-4" v-if="medprof_pseudo">
        <AvatarImage :pseudonym="medprof_pseudo" size="55px"/>

        <div v-for="g in medprof_groups">
          <GroupImage :group="g"/>
        </div>
      </div>
      <div class="text-center mt-2 mb-2" style="min-height: 3rem">
         <img v-if="user_store.getState().institution.logo_url" :src="user_store.getState().institution.logo_url" style="max-height: 50px;width: auto;object-fit: contain;"/>
        <small v-else>{{ user_store.getState().institution.name }}</small>
        <hr class="mt-0 mb-2"/>
      </div>
      <MDBSideNavMenu scrollContainer>
        <MDBSideNavItem>
          <MDBSideNavLink to="/logout" v-if="user_store.getState().authenticated && !user_store.getState().mock_mode">Abmelden</MDBSideNavLink>
          <MDBSideNavLink to="/">
            <span>Home</span>
          </MDBSideNavLink>
        </MDBSideNavItem>

                <MDBSideNavItem>
          <MDBSideNavLink :to="`/patientcase/${patient_case}?redirect=${patient_case_redirect}`" v-if="patient_case">
            <span>Fallbeispiel</span>
          </MDBSideNavLink>
        </MDBSideNavItem>

        <MDBSideNavItem>
          <MDBSideNavLink to="/patientlist" v-if="medprof_pseudo">
            <span>Patientenliste</span>
          </MDBSideNavLink>
        </MDBSideNavItem>
        <MDBSideNavItem v-if="app_store.getState().current_patient_id">
          <MDBSideNavLink
              v-if="((user_store.getState().groups.includes('patient')) || (user_store.getState().groups.length===0))"
              :to="`/patientview/${app_store.getState().current_patient_id}`">
            <span>Patientenansicht</span>
          </MDBSideNavLink>
          <MDBSideNavLink v-else
                          :to="`/medview/${app_store.getState().current_patient_id}`">
            <span>Behandlerseite</span>
          </MDBSideNavLink>
        </MDBSideNavItem>

        <MDBSideNavItem v-if="medprof_pseudo">
          <MDBSideNavLink>
            <span>Leaderboard</span>
          </MDBSideNavLink>
        </MDBSideNavItem>

        <MDBSideNavItem v-if="user_store.getState().mock_mode && medprof_pseudo">
          <MDBSideNavLink to="/medproflist">
            <span>Behandler-Liste</span>
          </MDBSideNavLink>
        </MDBSideNavItem>
        <MDBSideNavItem v-if="user_store.getState().is_staff">
          <MDBSideNavLink to="/scientistview">
            <span>Scientists Dashboard</span>
          </MDBSideNavLink>
        </MDBSideNavItem>

      </MDBSideNavMenu>


    </MDBSideNav>
    <!-- Sidenav-->

    <div id="content">
      <router-view/>
    </div>


</template>

<style scoped>

</style>