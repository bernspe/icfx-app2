<script setup lang="ts">

import {MDBBtn, MDBCol, MDBIcon, MDBRow, MDBTextarea, MDBSpinner} from "mdb-vue-ui-kit";
import { useSpeechRecognition } from '@vueuse/core'
import { ref, watch } from 'vue'
import {language} from "../constants";
import {user_store} from "../user_store";
import {backendURL} from "../process_vars";
import axios from "axios";
import {Explanation} from "../app_store";

const props = defineProps(['refcode'])
const emit = defineEmits(['explained'])
const lang = ref(language)


const speech = useSpeechRecognition({
  lang,
  continuous: true,
})

const interpunktion = {punkt:'.',komma:','}
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

const accumulated_result = ref('')
function startOrStop() {
  if (isListening.value) speech.stop()
  else {
    speech.result.value = ''
    speech.start()
  }
}

const { isListening, isFinal, isSupported, stop, result } = speech

const selectedLanguage = ref(lang.value)
watch(lang, lang => isListening.value ? null : selectedLanguage.value = lang)
watch(isListening, isListening => isListening ? null : selectedLanguage.value = lang.value)
watch(isFinal, (newVal,oldVal)=> {
  if (newVal) {
    accumulated_result.value += result.value
  }
})

const explainAPIRequest = (refcode: string, text: string) : Promise<Explanation> => {
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
                    data: {refcode: refcode, text: text}
                };
                axios(config).then((response) => {
                    resolve(response.data)
                }).catch((e) => {
                    reject(e);
                })
            } else reject('Not authenticated')

        })
    }

const isSending = ref(false)
const sendText = () => {
  isSending.value = true
  explainAPIRequest(props.refcode,accumulated_result.value).then(()=> emit('explained')).finally(()=>isSending.value=false)
}
</script>

<template>
<MDBRow>
           <MDBRow>
          <MDBTextarea rows="4" label="Ich verstehe darunter ..." v-model:model-value="accumulated_result">
          </MDBTextarea>
             </MDBRow>
              <MDBRow class="d-flex align-items-center justify-content-around">
            <MDBCol>
              <MDBBtn :color="isListening ? 'primary' : 'secondary'" floating
              @click="startOrStop" class="mt-2"
              ><MDBIcon icon="microphone" size="lg"/></MDBBtn>
            </MDBCol>
                <MDBCol>
                  <MDBBtn outline="danger" floating class="mt-2" @click="accumulated_result=''"><MDBIcon icon="circle-xmark" size="lg"/></MDBBtn>
                </MDBCol>
                <MDBCol>
              <MDBBtn color="primary" @click="sendText" class="mt-2" floating :disabled="!accumulated_result">
                <MDBSpinner v-if="isSending" class="me-2"/>
                <MDBIcon v-else icon="check" size="lg"/>
              </MDBBtn>
            </MDBCol>
                </MDBRow>
          </MDBRow>
</template>

<style scoped>

</style>