<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSelect, MDBIcon, MDBBadge, MDBAnimation
} from 'mdb-vue-ui-kit'
import {AuspraegungBeschwerden, AuspraegungColor, UmweltColor, UmweltFaktoren} from "../constants";
import {imageServer} from "../process_vars";
import {Explanation, ICFItemStructure} from '../app_store';
import __icfcodes from "../assets/icf_codes3.json";

const _icfcodes: Record<string, ICFItemStructure> = __icfcodes;



import {app_store, DataStore, ICFStruct} from "../app_store";
import {computed, inject, onMounted, provide, ref, watch} from "vue";
import {VueScrollPicker} from "vue-scroll-picker";
import {user_store} from "../user_store";
import {useRoute, useRouter} from "vue-router";
import _ from "lodash";
import SpeechTextInput from "./SpeechTextInput.vue";
import MetricsComponent from "./MetricsComponent.vue";
import ExplanationComponent from "./ExplanationComponent.vue";

const router = useRouter()
const route = useRoute()

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

const toggleExplanation = ref(false);
const toggleComment = ref(false);

const val2SelectionStatus = (val: number) => {
  if (props.code[0] === 'e') return (val !== 4) ? 1 : 0
  else return (val !== 0) ? 1 : 0
}

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
  if (props.mode === 'thumb' && code !== app_store.getState().active_icf) {
    if (app_store.getState().active_icf?.length > 0)
      saveData(app_store.getState().active_icf)
  }
  (e.target as HTMLElement).classList.remove("blurred-thumb-img")
  app_store.set_active_icf(code)
}


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
      icf: {...app_store.getState().patient_data.icf, [props.code]: {value: val, selected: val2SelectionStatus(val)}}
    }
    app_store.setCurrentData(data)
    firstTimeMounted.value = false
  }
})

provide('result', result)

watch(currentCode, (newVal, oldVal) => {
  toggleComment.value = false
  toggleExplanation.value = false
  if (props.mode === 'large') {
    if (newVal !== oldVal) {
      const data = {
        ...app_store.getState().patient_data,
        icf: {
          ...app_store.getState().patient_data.icf,
          [newVal]: {
            value: Object.keys(app_store.getState().patient_data.icf).includes(newVal) ? app_store.getState().patient_data.icf[newVal].value : ((newVal[0] === 'e') ? 4 : 0),
            selected: Object.keys(app_store.getState().patient_data.icf).includes(newVal) ? val2SelectionStatus(app_store.getState().patient_data.icf[newVal].value) : 0
          }
        }
      }
      app_store.setCurrentData(data)
    }
  }
})

const saveData = (code: string, icfitem?: ICFStruct) => {
  let data: DataStore = app_store.getState().patient_data
  if (icfitem)
    data = {...data, icf: {...app_store.getState().patient_data.icf, [code]: icfitem}}
  app_store.saveDataToApi(data).then(() => emit('save', data))
}

const saveNClose = (code: string) => {
  saveData(code)
  app_store.set_active_icf('')
}

provide('toggleExplanation', toggleExplanation)


onMounted(() => {
  if (props.mode === 'large') {
    if (!props.code) router.push(props.upUrl ? props.upUrl : '/')
    app_store.set_active_icf(props.code)
    let val = app_store.getState().patient_data.icf[props.code]?.value || 0
    const data = {
      ...app_store.getState().patient_data,
      icf: {...app_store.getState().patient_data.icf, [props.code]: {value: val, selected: val2SelectionStatus(val)}}
    }
    app_store.setCurrentData(data)
  }
})

</script>

<template>
  <MDBCard
      class="m-2 text-center"
      style="max-width:30rem;"
  >
    <div v-if="_icfcodes[code]?.p">
      <div v-if="mode==='thumb'" class="thumbimg" @click="mouseOverAct($event,code)">
        <div v-if="(code !== app_store.getState().active_icf) && (icfitem.selected>0)" class="mask"
             :style="`background-color: ${code[0]!=='e' ? AuspraegungColor[icfitem.value] : UmweltColor[icfitem.value]};
         opacity: 0.6; border-radius:5px;`"
             @click="mouseOverAct($event,code)"

        ></div>
        <img
            :src="imageServer()+`icf-pics/${code}.jpg`"
            :alt="code"
            style="max-height: 180px; width:auto; object-fit: contain; min-width:10em;"
            :class="(icfitem.selected===0) ? `blurred-thumb-img` : (icfitem.selected===-1) ? `opaque-thumb-img`: ``"
            @click="mouseOverAct($event,code)"
        />
        <p v-if="(code !== app_store.getState().active_icf)">{{ _icfcodes[code]?.t }}</p>
      </div>


      <div v-else-if="(mode==='large') || (mode==='browser')">
        <div v-if="(code !== app_store.getState().active_icf) && (icfitem.selected>0)" class="mask"
             :style="`background-color: ${code[0]!=='e' ? AuspraegungColor[icfitem.value] : UmweltColor[icfitem.value]};
         opacity: 0.6; border-radius:5px;`"
             @click="mouseOverAct($event,code)"
        ></div>
        <img
            :src="imageServer()+`icf-pics/${code}.jpg`"
            :alt="code"
            style="max-height: 240px; width:auto; object-fit: contain"
            @click="mouseOverAct($event,code)"
        />
      </div>
    </div>

    <div v-if="(mode==='browser') && (code !== app_store.getState().active_icf)">
      <MDBCardBody>
        <MDBBtn
            outline="primary"
            v-if="code.length>3 && code.length<6"
            @click="app_store.set_active_icf(code)">
          <MDBIcon icon="pen" class="me-2"/>
          Ausmaß einstellen
        </MDBBtn>
        <p class="text-secondary italic small" v-else>Bitte <span class="text-decoration-underline">Genauer</span>
          anwählen.</p>
      </MDBCardBody>
    </div>

    <div v-if="code === app_store.getState().active_icf">
      <MDBCardHeader>
        <MDBRow class="align-items-center m-2">
          <MDBCol>
            <h5 class="text-primary">{{ _icfcodes[code]?.t }}</h5>
          </MDBCol>

          <MDBCol>
            <MDBBtn :color="toggleExplanation ? 'secondary' : 'primary'" @click="toggleExplanation=!toggleExplanation">
              <MDBIcon icon="info-circle" class="me-2" size="lg"></MDBIcon>
              <span v-if="mode==='large'">Hinweis</span></MDBBtn>
          </MDBCol>

        </MDBRow>


        <ExplanationComponent :code="code" module="icf"/>



      </MDBCardHeader>
      <MDBCardBody v-if="code === app_store.getState().active_icf" class="m-0 p-0">
        <MDBRow>
          <MetricsComponent :icfcode="code" :icfmode="mode"/>
        </MDBRow>

        <MDBBtn color="tertiary" v-if="mode==='large'" @click="toggleComment=!toggleComment">
          <MDBIcon icon="circle-exclamation" size="lg" class="me-2"></MDBIcon>
          Mein Kommentar
        </MDBBtn>
        <MDBRow v-if="toggleComment" class="m-2">
          <MDBCol class="d-flex justify-content-center">
            <SpeechTextInput :refcode="'icf_'+code"/>
          </MDBCol>
        </MDBRow>

        <MDBRow v-if="mode==='browser' || mode==='thumb'">
          <MDBCol class="d-flex justify-content-center m-2">
            <MDBBtn outline="primary" @click="saveNClose(code)">
              <MDBIcon icon="circle-check" class="me-2"/>
              Schließen
            </MDBBtn>
          </MDBCol>
        </MDBRow>

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
  filter: opacity(0.2);
}

.thumbimg p {
  position: absolute;
  bottom: 1em;
  width: 100%;
  border: solid #000;
  border-width: 1px 0;
  font-size: 1em;
  text-align: center;
  color: rgb(90%, 90%, 90%);
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