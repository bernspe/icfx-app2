<script setup lang="ts">
import {ComputedRef, inject, ref, watch, watchEffect} from "vue";
import {RemoteUserAPI} from "../user_store";
import {additional_item_keys} from "../constants";
 import {
   MDBRow, MDBCol,
    MDBChip,
    MDBTextarea
  } from 'mdb-vue-ui-kit';
import {app_store} from "../app_store";

const patient = inject<ComputedRef<RemoteUserAPI>>('patient')
const patientid = ref('')
const addinfo_dict = ref<Record<string,string>>( {}) ;
const currentkey = ref('')
const textareaValue = ref('')

watchEffect(()=> {
  if (patient?.value) {
      patientid.value=patient.value.id
      addinfo_dict.value = patient.value.add_info || {}
  }
})

watch(currentkey,(newVal, oldVal)=> {
  if (newVal!==oldVal) {
    if (Object.keys(addinfo_dict.value).includes(newVal)) {
      textareaValue.value = addinfo_dict.value[newVal]
    }
    else {
      textareaValue.value=''
    }
  }
})

const getColor = (item:string) => {
  if (currentkey.value===item) return 'success'
  if (Object.keys(addinfo_dict.value).includes(item)) return 'primary'
  return 'danger'
}

const saveAddInfo = () => {
  if ((patientid.value) && (currentkey.value?.length>0)){
    addinfo_dict.value[currentkey.value]=textareaValue.value
    app_store.updateUserAddInfo(patientid.value, addinfo_dict.value).then(d => addinfo_dict.value = d || {})
  }
}
</script>

<template>
<div class="p-2">
  <MDBRow class="m-2">
    <MDBCol v-for="item in additional_item_keys">
  <MDBChip :outline="getColor(item)" @click="currentkey=item">
      {{ item }}
  </MDBChip>
      </MDBCol>
    </MDBRow>
  <MDBRow v-if="currentkey">
    <MDBTextarea :label="currentkey" rows="4" v-model="textareaValue" @blur="saveAddInfo"/>
  </MDBRow>
</div>
</template>

<style scoped>

</style>