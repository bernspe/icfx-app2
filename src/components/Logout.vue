<script setup lang="ts">
import {MDBCard, MDBCardBody, MDBCardHeader, MDBCardFooter, MDBContainer,MDBInput, MDBRow, MDBCol, MDBBtn} from "mdb-vue-ui-kit";
import {user_store} from "../user_store";
import {computed, onMounted, ref, watch} from "vue";
import {backtranslate_pseudonym} from "../language_helper";
import AvatarImage from "./AvatarImage.vue";
import {useRoute, useRouter} from "vue-router";
import {roles} from "../constants";
import {app_store} from "../app_store";
const router = useRouter()
const route = useRoute()

const counterval = ref(5)
const counter = ref()

const countDown = () => {
  counter.value=setTimeout(()=>counterval.value-=1,1000)
}

const killCounter = () =>  {
  clearTimeout(counter.value)
  router.push('/')
}

watch(counterval,(newVal, oldVal) => {
  if (newVal===0) {
    user_store.clear_tokens()
    user_store.clear_userdata()
    app_store.clearData()
    router.push('/')
  } else {
    countDown()
  }
})

onMounted(()=> {
  countDown()
})
</script>

<template>
<MDBContainer class="text-center mt-8">
  <MDBCard class="m-2">
    <MDBCardHeader>
      <h1 class="text-secondary">Wir sagen Tschüss...</h1>
    </MDBCardHeader>
    <MDBCardBody>
      <h2 class="text-primary">Abmelden von </h2>
      <AvatarImage v-if="counterval>0" :pseudonym="user_store.getState().pseudonym" label_position="right"/>
      <h2 class="text-primary"> in {{ counterval }} Sekunden </h2>
    </MDBCardBody>
    <MDBCardFooter>
      <MDBBtn outline="danger" @click="killCounter">Abbrechen</MDBBtn>
    </MDBCardFooter>
  </MDBCard>
</MDBContainer>
</template>

<style scoped>

</style>