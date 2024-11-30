<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import { MDBSelect, MDBRow, MDBCol, MDBAutocomplete, MDBChip, MDBInput , MDBListGroup, MDBListGroupItem} from "mdb-vue-ui-kit";
import _icd_long from "../assets/icd_codes.json"
import {user_store} from "../user_store";

const props = defineProps(['diagnoses','patientid'])
const diag_input = ref("");

const icd_options = ref(
    //Object.entries(_icd_short).map(([k,v],idx) => ({text:v,secondaryText:k,value:idx}))
    Object.entries(_icd_long).map(([k,v],idx) => ({text:v.t,secondaryText:k,value:idx}))
    );

const diagnoses_list = computed(()=> {
  if (diag_input.value.length>2) {
    // remove , and ;  remove whitespace and use only those longer than 2 characters
    let d_array = diag_input.value.split(/\,|\;/gm).map(x=>x.trim()).filter(x=>x.length>2);

    return d_array
        .map(xx=> {
          let x=xx.toLowerCase();
          let idx_code = icd_options.value.findIndex(icd=>icd.secondaryText.toLowerCase().includes(x));
          let idx_descr = icd_options.value.findIndex(icd=>icd.text.toLowerCase().includes(x));
          if (idx_code>-1) return icd_options.value[idx_code]
          if (idx_descr>-1) return icd_options.value[idx_descr]
          return {secondaryText: 'ICD?',text: xx}
        }).filter(x=>x!==undefined)

  } else return []
})

const saveDiagnoses = () => {
  user_store.updateUserDiagnoses(props.patientid,diagnoses_list.value.join(','))
}

onMounted(()=> {
  diag_input.value=props.diagnoses
})
</script>

<template>
    <div class="p-2">
      <MDBInput label="Diagnosen (Freitext oder ICD Code)" v-model="diag_input" placeholder="Diagnosen eingeben" @blur="saveDiagnoses"></MDBInput>

        <MDBListGroup>
          <MDBListGroupItem v-for="d in diagnoses_list">
            {{ d.secondaryText }}: {{ d.text }}
          </MDBListGroupItem>
        </MDBListGroup>
</div>
</template>

<style scoped>
.chip {
    white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}
.diagnosisbox {
   width: 50em;
  height: 5em;
  font-size: 14px;
  border: 1px solid;
  border-radius: 5px;
  padding: 2px 5px;

  /* Both of the following are required for text-overflow */
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>