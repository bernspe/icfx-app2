<template>
  <MDBCard>
    <MDBNavbar expand="lg" light bg="light" container>
      <MDBRow class="g-3 ms-3 align-items-center">
        <MDBCol>
          <MDBInput
              id="navbarSupportedContent"
              label='Wort suchen'
              v-model="searchInput"></MDBInput>
        </MDBCol>
        <MDBCol>
          <a class="ms-3" role="button" style="color: #616161">
            <MDBIcon icon="search" @click="iterate(searchInput.toLowerCase())"></MDBIcon>
            <MDBBadge notification color="info" pill v-if="searchCount>0">{{ searchCount }}</MDBBadge>
          </a>
          <a class="ms-3" role="button" style="color: #616161">
            <MDBIcon icon="cancel" @click="clearSearch()"></MDBIcon>
          </a>
        </MDBCol>
        <MDBCol>
          <MDBSwitch
              label="Alle zeigen"
              v-model="showAll"
          />
        </MDBCol>
      </MDBRow>
    </MDBNavbar>

    <MDBContainer class="p-4 bg-light mx-2"
                  data-mdb-step
                  data-mdb-index="2"
                  data-mdb-onboarding-content="Hier kann man schnell in den einzelnen Ebenen navigieren (trifft zu, wenn Sie die Tasten Allgemeiner/Genauer verwendet haben.">
      <nav aria-label="breadcrumb" class="d-flex">
        <MDBBreadcrumb>
          <MDBBreadcrumbItem>
            <a class="btn btn-link btn-rounded btn-sm"
               @click="icf_store.jumpToLocation('base')">{{ showAll ? 'ICF' : 'Problembereiche' }}</a>
          </MDBBreadcrumbItem>
          <MDBBreadcrumbItem v-for="location in icf_store.getState().activeICFLevels">
            <a class="btn btn-link btn-rounded btn-sm"
               @click="icf_store.jumpToLocation(location)">{{ icf_json[location].t }}</a>
          </MDBBreadcrumbItem>
        </MDBBreadcrumb>
      </nav>
    </MDBContainer>

    <MDBAnimation trigger="manually" reset :animation="animation" ref="animation_trigger">
      <MDBCard class="m-1">
        <MDBRow>
          <MDBCol>
            <MDBCardTitle class="mt-4 mx-4">
              <h3>{{ currICF.t }}</h3>
            </MDBCardTitle>
          </MDBCol>
        </MDBRow>


        <MDBCardBody>
          <MDBRow>
            <MDBCol v-for="(chapterCode) in currICF.c" class="m-1">
              <MDBCard v-if="Object.keys(icf_json).includes(chapterCode)" class="m-0">

                <MDBCardHeader>
                  <div>
                    <MDBBadge v-if="icf_json[chapterCode]?.b==='x'"
              badge="info"
              dot
              class="translate-middle p-2 border border-light rounded-circle"></MDBBadge>
                  <h3 class="text-secondary">ICF Code: {{ chapterCode }}</h3>
                    <h4 class="text-primary">{{ icf_json[chapterCode]?.t }}</h4>

                    </div>
                </MDBCardHeader>

                <MDBCardBody>
                  <ICFThumbCard mode='browser' :code="chapterCode" :patientid="patientid" v-if="chapterCode.length>1"/>
                </MDBCardBody>
                <MDBCardFooter>
                  <MDBRow>
                    <MDBCol class="m-2 d-flex justify-content-start">
                      <MDBBtn
                          v-if="icf_json[chapterCode]?.b !== 'S' && chapterCode.length>1"
                          class="m-2 mx-4"
                          color="tertiary"
                          size="lg"
                          @click="zoom_out">
                        Allgemeiner
                        <i class="fas fa-search-minus mx-4"></i>
                      </MDBBtn>
                      <MDBBtn
                          v-if="icf_json[chapterCode]?.c?.length>0 && icf_json[chapterCode]?.b !== 'S'"
                          class="m-2 mx-4"
                          color="tertiary"
                          size="lg"
                          @click="zoom_in(chapterCode)">
                        Genauer
                        <i class="fas fa-search-plus mx-4"></i>
                      </MDBBtn>
                    </MDBCol>
                  </MDBRow>
                </MDBCardFooter>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBCardBody>
        <MDBCardFooter>
          <MDBCol class="d-flex justify-content-start">
            <MDBBtn color="primary" @click="router.push({path: `/medview/${patientid}`})">Zurück</MDBBtn>
          </MDBCol>
        </MDBCardFooter>
      </MDBCard>
    </MDBAnimation>

  </MDBCard>
</template>

<script setup lang="ts">
import {
  MDBAnimation,
  MDBBadge,
  MDBBreadcrumb,
  MDBBreadcrumbItem,
  MDBBtn,
  MDBCard,
  MDBCardBody,
    MDBCardHeader,
  MDBCardTitle,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBInput,
  MDBNavbar,
  MDBRow,
  MDBSwitch, MDBLoading, MDBCardFooter,
} from "mdb-vue-ui-kit";

import {computed, ref, watch, onMounted, PropType} from "vue";
import {icf_store} from "../icf_store";
import {useRoute, useRouter} from "vue-router";
import ICFThumbCard from "./ICFThumbCard.vue";
import {ICFStruct} from "../app_store";


const props = defineProps({
  icfs: {type: Object as PropType<Record<string, ICFStruct>>, required: false},
  patientid: {type: String, required: true}
})

const router = useRouter()
const route = useRoute()

const showAll = ref(true)
const icf_json = icf_store.getState().icf_json

const searchInput = ref('')
let searchCount = ref(0)

const animation = ref('zoom-in')
const animation_trigger = ref<InstanceType<typeof MDBAnimation> | null>(null);


const topMostIcfLevel = computed(() => {
  if (showAll.value) return Object.assign({}, {'t': 'ICF Module', 'c': ['b', 's', 'd', 'e'], 'p': '', 'h': ''});
  return Object.assign({}, {
    't': 'Problembereiche',
    'c': Object.keys(icf_store.getState().icf_json_view),
    'p': '',
    'h': ''
  })
})

const currICF = computed(() => {
  if (icf_store.getState().activeICFLevels.length == 0) return topMostIcfLevel.value
  return Object.assign({}, icf_json[icf_store.getState().activeICFLevels.slice(-1).toString()]);
});


function zoom_in(chapterCode: string) {
  icf_store.addToActiveIcfLevels(chapterCode.toString())
  animation.value = 'zoom-in'
  animation_trigger.value?.startAnimation()
}

function zoom_out() {
  icf_store.popFromActiveIcfLevels()
  animation.value = 'zoom-out'
  animation_trigger.value?.startAnimation()
}


const iterate = (val: string) => {
  searchCount.value = 0
  Object.keys(icf_json).forEach(key => {
    icf_store.setIcfJsonBadge(key, '')
    let f = icf_json[key]['h'].toLowerCase().split(' ').includes(val)
    let f2 = icf_json[key]['t'].toLowerCase().split(' ').includes(val)
    if (f || f2) {
      icf_store.setIcfJsonBadge(key, 'x')
      searchCount.value++;
      icf_store.markAncestors(key, 'x')
    }
  })
}


const clearSearch = () => {
  Object.keys(icf_json).forEach(key => {
    icf_store.setIcfJsonBadge(key, '')
  })
  searchInput.value = ''
  searchCount.value = 0
}

watch(showAll, () => {
  if (!showAll.value) {
    if (icf_store.getState().selection.size > 0) {
      icf_store.getState().selection.forEach((code) => icf_store.markAncestors(code, 'S'))
      icf_store.getFilteredICF(['S'])
    }
  }
}, {immediate: true, deep: false})

</script>

