<script setup lang="ts">

import {MDBBtn, MDBCol, MDBIcon, MDBRow, MDBTextarea} from "mdb-vue-ui-kit";
import { useSpeechRecognition } from '@vueuse/core'
import { ref, watch } from 'vue'
import {language} from "../constants";

const lang = ref(language)

function sample<T>(arr: T[], size: number) {
  const shuffled = arr.slice(0)
  let i = arr.length
  let temp: T
  let index: number
  while (i--) {
    index = Math.floor((i + 1) * Math.random())
    temp = shuffled[index]
    shuffled[index] = shuffled[i]
    shuffled[i] = temp
  }
  return shuffled.slice(0, size)
}

const speech = useSpeechRecognition({
  lang,
  continuous: true,
})
const color = ref('transparent')

const colors = ['aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow', 'transparent']
const grammar = `#JSGF V1.0; grammar colors; public <color> = ${colors.join(' | ')} ;`

const interpunktion = {punkt:'.',komma:','}
const grammar2 = `#JSGF V1.0; grammar punctuation; public <punct> = ${Object.keys(interpunktion).join(' | ')} ;`

if (speech.isSupported.value) {
  // @ts-expect-error missing types
  const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
  const speechRecognitionList = new SpeechGrammarList()
  //speechRecognitionList.addFromString(grammar, 1)
  speechRecognitionList.addFromString(grammar2, 1)
  speech.recognition!.grammars = speechRecognitionList

  watch(speech.result, (newVal,oldVal) => {
    for (const i of speech.result.value.toLowerCase().split(' ').reverse()) {
      if (colors.includes(i)) {
        color.value = i
        break
      }
    }

  })
}

const sampled = ref<string[]>([])

const accumulated_result = ref('')
function startOrStop() {
  if (isListening.value) speech.stop()
  else {
    color.value = 'transparent'
    speech.result.value = ''
    sampled.value = sample(colors, 5)
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
</script>

<template>
<MDBRow>
            <MDBCol col="10">
          <MDBTextarea rows="4" label="Ich verstehe darunter ..." v-model:model-value="accumulated_result">
          </MDBTextarea>
              </MDBCol>
            <MDBCol col="2">
              <MDBBtn :color="isListening ? 'primary' : 'secondary'" floating
              @click="startOrStop"
              ><MDBIcon icon="microphone"/></MDBBtn>
            </MDBCol>
          </MDBRow>
</template>

<style scoped>

</style>