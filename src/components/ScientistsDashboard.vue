<script setup lang="ts">
import {MDBListGroup, MDBListGroupItem, MDBBadge,MDBBtn, MDBIcon, MDBInput, MDBRow, MDBCol, MDBCard, MDBCardHeader,MDBCardBody,MDBCardFooter,MDBContainer} from 'mdb-vue-ui-kit'
import {computed, ref} from "vue";
import {user_store} from "../user_store";

const copyTokenToClipboard = () => {
  navigator.clipboard.writeText(user_store.getState().access_token);

  // Alert the copied text
  alert("Access token copied to clipboard");
}

</script>

<template>
  <MDBCard class="m-3 w-75">
    <MDBCardHeader>
<h1 class="text-secondary">Scientists Dashboard</h1>
    </MDBCardHeader>
    <MDBCardBody class="p-2">
      <h2 class="text-secondary">Access Token</h2>
      <h4 class="text-primary">{{ user_store.getState().access_token }} <MDBBtn class="ms-3" color="tertiary" @click="copyTokenToClipboard"><MDBIcon icon="clipboard" size="lg" class="me-2"/>Copy to Clipboard</MDBBtn></h4>
    </MDBCardBody>
    </MDBCard>
</template>

<style scoped>

</style>