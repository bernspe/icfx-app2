<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSelect, MDBIcon, MDBBadge, MDBAnimation
} from 'mdb-vue-ui-kit'
import {AuspraegungBeschwerden, AuspraegungColor, UmweltColor, UmweltFaktoren} from "../constants";
import {imageServer} from "../process_vars";
import {ICFItemStructure} from '../app_store';
import __icfcodes from "../assets/icf_codes3.json";
const _icfcodes: Record<string,ICFItemStructure> = __icfcodes;
import {app_store, DataStore, ICFStruct} from "../app_store";
import {computed, inject, onMounted, ref, watch} from "vue";
import {VueScrollPicker} from "vue-scroll-picker";
import {user_store} from "../user_store";

const props = defineProps<{
  code: string,
  patientid: string,
  mode?: string,
  backUrl?: string,
  upUrl?: string,
  nextUrl?: string
}>()
const emit = defineEmits(['save', 'next'])

const firstTimeMounted = ref(props.mode === 'large')
const isPatient = computed(() => user_store.getState().groups.includes('patient'))
const currentCode = computed(() => props.code)

const icfitem = computed(() => {
  let data = app_store.getState().patient_data.icf
  let ks = Object.keys(data || {})
  if (ks.includes(props.code)) {
    return data[props.code]
  } else {
    return {value: props.code[0] === 'e' ? 4 : 0, selected: 0}
  }
})
const mouseOverAct = (e: Event, code: string) => {
  (e.target as HTMLElement).classList.remove("blurred-thumb-img")
  app_store.set_active_icf(code)
}

const showScrollPicker = ref(true)

const optionslist = computed(() => {
  return props.code[0] === 'e' ? (UmweltFaktoren.map((x, idx) => {
    return {text: x, value: idx}
  })) : (AuspraegungBeschwerden.map((x, idx) => {
    return {text: x, value: idx}
  }))
})

const scroll_optionslist = computed(() => {
  return optionslist.value.map(x => ({name: x.text, value: x.value}))
})

const result = computed({
  get: () => {
    const data = app_store.getState().patient_data.icf
    const ks = Object.keys(data || {})
    if (ks.includes(currentCode.value)) {
      return Number(data[currentCode.value].value)
    } else {
      return currentCode.value[0] === 'e' ? 4 : 0
    }
  },
  set: (val) => {
    const data = {
      ...app_store.getState().patient_data,
      icf: {...app_store.getState().patient_data.icf, [props.code]: {value: val, selected: 1}}
    }
    app_store.setCurrentData(data)
    firstTimeMounted.value=false
  }
})

watch(currentCode, (newVal, oldVal) => {
  if (newVal !== oldVal) {
   const data = {
      ...app_store.getState().patient_data,
      icf: {...app_store.getState().patient_data.icf, [newVal]: {value: app_store.getState().patient_data.icf[newVal].value, selected: 1}}
    }
    app_store.setCurrentData(data)
  }
})

const saveData = (code: string, icfitem: ICFStruct) => {
  let data: DataStore = app_store.getState().patient_data
  data = {...data, icf: {...app_store.getState().patient_data.icf, [code]: icfitem}}
  app_store.saveDataToApi(data).then(() => emit('save', data))
}

const editIcf = (code: string, icfitem: ICFStruct) => {
  saveData(code, {...icfitem, selected: showScrollPicker.value ? 1 : 0})
  showScrollPicker.value = !showScrollPicker.value
  firstTimeMounted.value = false
}

const denyIcf = (code: string, icfitem: ICFStruct) => {
  saveData(code, {...icfitem, selected: -1})
  showScrollPicker.value = false
  firstTimeMounted.value = false
  //  emit('next')
}
const confirmIcf = (code: string, icfitem: ICFStruct) => {
  saveData(code, {...icfitem, selected: 1})
  //showScrollPicker.value = false
  firstTimeMounted.value = false
  // emit('next')
}


onMounted(() => {
  if (props.mode === 'large') {
    app_store.set_active_icf(props.code)
    const data = {
      ...app_store.getState().patient_data,
      icf: {...app_store.getState().patient_data.icf, [props.code]: {value: app_store.getState().patient_data.icf[props.code].value, selected: 1}}
    }
    app_store.setCurrentData(data)
  }
})

</script>

<template>
  <MDBCard
      class="m-2 text-center"
  >
    <div v-if="mode==='thumb'" class="thumbimg" @click="mouseOverAct($event,code)">
      <div v-if="(code !== app_store.getState().active_icf) && (icfitem.selected>0)" class="mask"
           :style="`background-color: ${code[0]!=='e' ? AuspraegungColor[icfitem.value] : UmweltColor[icfitem.value]};
         opacity: 0.6; border-radius:5px;`"
           @click="mouseOverAct($event,code)"
      ></div>
      <img
          :src="imageServer()+`icf-pics/${code}.jpg`"
          :alt="code"
          style="max-height: 180px; width:auto; object-fit: contain"
          :class="(icfitem.selected===0) ? `blurred-thumb-img` : (icfitem.selected===-1) ? `opaque-thumb-img`: ``"
          @click="mouseOverAct($event,code)"
      />
      <p v-if="(code !== app_store.getState().active_icf)">{{ _icfcodes[code]?.t }}</p>
    </div>


    <div v-else-if="mode==='large'">
      <img
          :src="imageServer()+`icf-pics/${code}.jpg`"
          :alt="code"
          style="max-height: 240px; width:auto; object-fit: contain"
          @click="mouseOverAct($event,code)"
      />
    </div>


      <div v-if="code === app_store.getState().active_icf">
        <MDBCardHeader>
          <h5 class="text-primary">{{ _icfcodes[code]?.t }}</h5>
          <router-link :to="`/patientdata/icf-detail/${patientid}/${code}`">
            Was soll das bedeuten?
            <MDBIcon class="ms-3" icon="circle-info"></MDBIcon>
          </router-link>
        </MDBCardHeader>
        <MDBCardBody v-if="code === app_store.getState().active_icf" class="m-0 p-0">
          <MDBRow>
                  <VueScrollPicker
                      :options="scroll_optionslist"
                      v-model:model-value="result"
                      :style="`font-size: ${mode==='large' ? '20px':'16px'}`">
                  </VueScrollPicker>
          </MDBRow>

          <!--

          <MDBRow class="d-flex align-items-center justify-content-between p-2" v-if="mode==='thumb'">
            <MDBCol>
              <div>
                <MDBBtn floating :color="showScrollPicker ? 'primary' : 'secondary'" @click="editIcf(code,icfitem)">
                  <MDBIcon icon="pen"/>
                </MDBBtn>
              </div>
              <div v-if="mode==='large'">
                <MDBBtn color="tertiary" @click="editIcf(code,icfitem)">Das ist anders</MDBBtn>
              </div>
            </MDBCol>

            <MDBCol>
              <div>
                <MDBBtn floating
                        :color="app_store.getState().patient_data.icf[code]?.selected === -1 ? 'danger' : 'secondary'"
                        @click="denyIcf(code,icfitem)">
                  <MDBIcon icon="xmark"/>
                </MDBBtn>
              </div>
              <div v-if="mode==='large'">
                <MDBBtn color="tertiary" @click="editIcf(code,icfitem)">Das ist nicht wichtig</MDBBtn>
              </div>
            </MDBCol>

            <MDBCol>
              <div>
                <MDBBtn floating
                        :color="app_store.getState().patient_data.icf[code]?.selected === 1 ? 'success' : 'secondary'"
                        @click="confirmIcf(code,icfitem)">
                  <MDBIcon icon="check"/>
                </MDBBtn>
              </div>
              <div v-if="mode==='large'">
                <MDBBtn color="tertiary" @click="confirmIcf(code,icfitem)">Das trifft so zu</MDBBtn>
              </div>
            </MDBCol>
          </MDBRow>
-->
        </MDBCardBody>
        <MDBCardFooter v-if="mode==='large'">
          <MDBRow class="d-flex align-items-center">
            <MDBCol class="justify-content-start" v-if="backUrl">
              <router-link :to="backUrl">Zurück</router-link>
            </MDBCol>
            <MDBCol class="justify-content-center" v-if="upUrl">
              <router-link :to="upUrl">Abbruch</router-link>
            </MDBCol>
            <MDBCol class="justify-content-end" v-if="nextUrl">
              <router-link :to="nextUrl"> Weiter</router-link>
            </MDBCol>
          </MDBRow>
        </MDBCardFooter>
      </div>

  </MDBCard>

</template>

<style src="vue-scroll-picker/lib/style.css">

</style>

<style scoped>
.blurred-thumb-img {
  /* Add the blur effect
  filter: blur(4px);
  -webkit-filter: blur(4px);
   */
  filter: opacity(0.2);
}

.thumbimg p {
  position: absolute;
  bottom: 1em;
  width:100%;
  border: solid #000;
  border-width:1px 0;
  font-size: 1em;
  text-align:center;
  color: rgb(90%,90%,90%);
  background: gray;
}

.opaque-thumb-img {
  filter: opacity(0.2);
}

.active-class {
  text-color: #ef6755;
}

.inactive-class {
  text-color: #00e563;
}
</style>