<script setup>
import {
  MDBNavbar,
  MDBSideNav, MDBSideNavItem, MDBSideNavLink, MDBSideNavMenu,
  MDBNavbarToggler,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBCollapse,
  MDBDropdown, MDBDropdownToggle, MDBDropdownItem, MDBDropdownMenu,
  MDBIcon, MDBBadge, MDBBtn
} from 'mdb-vue-ui-kit';
import {ref, computed} from 'vue';
import {version} from "../../package.json"
import {user_store} from "../user_store.ts";
import {app_store} from "../app_store.ts";
import {imageServer} from "../process_vars.ts";
import _userdata from "../assets/mock-userdata.json";
import AvatarImage from "./AvatarImage.vue";


const sidenavScroll = ref(true);

const patient_avatar = computed(() => {
  if (app_store.getState().current_patient_id) {
    let idx = _userdata.map(u => u.id).indexOf(app_store.getState().current_patient_id)
    return imageServer() + `avatars/${_userdata[idx].avatar}.jpg`
  }
})

const patient_pseudo = computed(() => {
  if (app_store.getState().current_patient_id) {
    let idx = _userdata.map(u => u.id).indexOf(app_store.getState().current_patient_id)
    return _userdata[idx].pseudonym
  }
})

const medprof_avatar = computed(() => {
  if (user_store.getState().id && (!user_store.getState().groups.includes('patient'))) {
    let idx = _userdata.map(u => u.id).indexOf(user_store.getState().id)
    return imageServer() + `avatars/${_userdata[idx].avatar}.jpg`
  }
})

const medprof_pseudo = computed(() => {
  if (user_store.getState().id && (!user_store.getState().groups.includes('patient'))) {
    let idx = _userdata.map(u => u.id).indexOf(user_store.getState().id)
    return _userdata[idx].pseudonym
  }
})

const medprof_groups = computed(() => {
  if (user_store.getState().id && (!user_store.getState().groups.includes('patient'))) {
    let idx = _userdata.map(u => u.id).indexOf(user_store.getState().id)
    return _userdata[idx].groups
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

      <div v-else class="d-flex align-items-center py-4">
        <AvatarImage :pseudonym="patient_pseudo" size="55px"/>

        <div>
          <img
              :src="imageServer()+`group-pics/patient.jpg`"
              alt="patient image"
              style="width: 45px; height: 45px"
              class="rounded-circle"
          />
          <MDBBadge
              class="translate-middle p-1"
              badge="info"
              pill
              notification
          >Patient
          </MDBBadge>
        </div>
      </div>

      <div class="d-flex align-items-center justify-content-center" v-if="medprof_avatar && patient_avatar">
        <i class="fas fa-arrow-up-long text-primary m-3"></i>
        <span class="text-primary m-3">... beurteilt</span>
      </div>

      <div class="d-flex align-items-center mb-4" v-if="medprof_avatar">
        <AvatarImage :pseudonym="medprof_pseudo" size="55px"/>

        <div v-for="g in medprof_groups">
          <img
              :src="imageServer()+`group-pics/${g}.jpg`"
              alt=""
              style="width: 45px; height: 45px"
              class="rounded-circle"
          />
          <MDBBadge
              class="translate-middle p-1"
              badge="info"
              pill
              notification
          >{{ g }}
          </MDBBadge>
        </div>
      </div>
      <div class="text-center" style="min-height: 3rem">
        <small>{{ user_store.getState().institution.name }}</small>
        <hr class="mt-0 mb-2"/>
      </div>
      <MDBSideNavMenu scrollContainer>
        <MDBSideNavItem>
          <MDBSideNavLink to="/">
            <span>Home (Reset)</span>
          </MDBSideNavLink>
        </MDBSideNavItem>
        <MDBSideNavItem>
          <MDBSideNavLink to="/patientlist">
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
            <span>Behandleransicht</span>
          </MDBSideNavLink>
        </MDBSideNavItem>

        <MDBSideNavItem>
          <MDBSideNavLink to="/medproflist">
            <span>Behandler-Liste</span>
          </MDBSideNavLink>
        </MDBSideNavItem>


        <MDBSideNavItem>
          <MDBSideNavLink to="/adminview">
            <span>Admin-Dashboard</span>
          </MDBSideNavLink>
        </MDBSideNavItem>
        <MDBSideNavItem>
          <MDBSideNavLink>
            <span>Benutzerdaten</span>
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
.active-pic {
  border: #0d6832 solid 2px;
}
</style>