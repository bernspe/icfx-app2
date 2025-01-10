<script setup lang="ts">

import {MDBCard, MDBCardHeader, MDBCardFooter, MDBCardBody, MDBCol, MDBRow, MDBCardImg, MDBBtn} from "mdb-vue-ui-kit";
import {useRoute, useRouter} from "vue-router";

const router = useRouter()

</script>

<template>
<MDBCard class="m-2">
  <MDBCardHeader>
    <h1 class="text-primary">Erklärbereich</h1>
  </MDBCardHeader>
  <MDBCardBody>

  </MDBCardBody>
      <MDBCardFooter>
      <MDBRow>
        <MDBCol class="justify-content-start">
          <MDBBtn role="link" @click="router.back()">Zurück</MDBBtn>
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
</MDBCard>
</template>

<style scoped>

</style>