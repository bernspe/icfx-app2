<script setup lang="ts">

import {MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter,MDBBtn, MDBCol, MDBIcon, MDBRow, MDBTextarea, MDBSpinner, MDBCheckbox, MDBAlert} from "mdb-vue-ui-kit";
import {useSpeechRecognition} from '@vueuse/core'
import {ref, watch} from 'vue'
import {language} from "../constants";
import {user_store} from "../user_store";
import {backendURL} from "../process_vars";
import axios from "axios";
import {app_store, Explanation} from "../app_store";

const props = defineProps(['refcode'])
const emit = defineEmits(['explained'])
const lang = ref(language)


const speech = useSpeechRecognition({
  lang,
  continuous: true,
})

const interpunktion = {punkt: '.', komma: ','}

/*
const grammar2 = `#JSGF V1.0; grammar punctuation; public <punct> = ${Object.keys(interpunktion).join(' | ')} ;`

if (speech.isSupported.value) {
  // @ts-expect-error missing types
  const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
  if (SpeechGrammarList) {
    const speechRecognitionList = new SpeechGrammarList()
    //speechRecognitionList.addFromString(grammar, 1)
    speechRecognitionList.addFromString(grammar2, 1)
    speech.recognition!.grammars = speechRecognitionList
  }
}
*/
const accumulated_result = ref('')

function startOrStop() {
  if (isListening.value) speech.stop()
  else {
    speech.result.value = ''
    speech.start()
  }
}

const {isListening, isFinal, isSupported, stop, result} = speech

const selectedLanguage = ref(lang.value)
watch(lang, lang => isListening.value ? null : selectedLanguage.value = lang)
watch(isListening, isListening => isListening ? null : selectedLanguage.value = lang.value)
watch(isFinal, (newVal, oldVal) => {
  if (newVal) {
    accumulated_result.value += result.value
    for (const i of Object.keys(interpunktion)) {
      let re = new RegExp(' '+i, "gi"); // include Whitespace to remove before punctuation
      accumulated_result.value =accumulated_result.value.replaceAll(re, interpunktion[i])
      // Capitalize Letter after Period
      let cre = /(^|[.!?]\s+)([a-z])/g;
      accumulated_result.value = accumulated_result.value.replace(cre, (m, $1, $2) => $1 + $2.toUpperCase());
    }
  }
})

const explainAPIRequest = (refcode: string, text: string): Promise<Explanation> => {
  return new Promise((resolve, reject) => {
    if (user_store.getState().authenticated) {
      var config = {
        method: 'POST',
        url: backendURL() + `explain/`,
        headers: {
          authorization: `Bearer ${user_store.getState().access_token}`,
          'Content-Type': 'application/json'
        },
        xhrFields: {
          withCredentials: true
        },
        data: {refcode: refcode, text: text, owner: app_store.getState().current_patient_id, open_to_all: open_to_all.value}
      };
      axios(config).then((response) => {
        resolve(response.data)
      }).catch((e) => {
        reject(e);
      })
    } else reject('Not authenticated')
  })
}

const open_to_all = ref(true)

const alertSuccess = ref(false)
const alertFailure = ref(false)
const isSending = ref(false)
const sendText = () => {
  isSending.value = true
  explainAPIRequest(props.refcode, accumulated_result.value).then(() => {
    alertSuccess.value = true
    emit('explained')
  }).catch((e)=> {
    alertFailure.value = true
  }).finally(() => isSending.value = false)
}
</script>

<template>
  <MDBCard>
    <MDBCardHeader>
      <h2 class="text-primary">Eigener Hinweise oder Kommentar</h2>
      <MDBCheckbox label="Für alle Benutzer sichtbar" disabled v-model="open_to_all" />
      <p class="text-secondary small" v-if="open_to_all">Dieser Text wird für alle Benutzer als Hinweis sichtbar sein. Er kann somit als Hilfe zum Verständnis dienen.</p>
      <p class="text-secondary small" v-else>Dieser Text wird nur für den Patienten und seine Behandler sichtbar sein.</p>
    </MDBCardHeader>
    <MDBCardBody>
    <div class="textContainer">
      <MDBTextarea rows="4" label="Mein Kommentar" v-model:model-value="accumulated_result">
      </MDBTextarea>
             <MDBBtn :color="isListening ? 'primary' : 'secondary'" floating
                @click="startOrStop" class="mt-2 micButton">
          <MDBIcon icon="microphone"/>
        </MDBBtn>
    </div>

    </MDBCardBody>
    <MDBCardFooter>
    <MDBRow class="d-flex align-items-center justify-content-around">
      <MDBCol>
        <MDBBtn outline="danger" floating class="mt-2" @click="accumulated_result=''">
          <MDBIcon icon="circle-xmark" size="lg"/>
        </MDBBtn>
      </MDBCol>
      <MDBCol>
        <MDBBtn color="primary" @click="sendText" class="mt-2" floating :disabled="!accumulated_result">
          <MDBSpinner v-if="isSending" class="me-2"/>
          <MDBIcon v-else icon="check" size="lg"/>
        </MDBBtn>
      </MDBCol>
    </MDBRow>
      </MDBCardFooter>

     <MDBAlert
    v-model="alertSuccess"
    color="success"
    position="top-right"
    stacking
    appendToBody
    autohide
  >Dein Kommentar wurde gesendet. Er wird nun geprüft.
  </MDBAlert>

         <MDBAlert
    v-model="alertFailure"
    color="danger"
    position="top-right"
    stacking
    appendToBody
    autohide
  >Es gab einen Fehler beim Senden des Kommentars.
  </MDBAlert>
  </MDBCard>
</template>

<style>
.textContainer {
  position: relative;
}
.micButton {
  position: absolute;
  top: -20px;
  right: -10px;
}
</style>