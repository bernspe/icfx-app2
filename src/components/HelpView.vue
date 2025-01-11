<script setup lang="ts">

import {
  MDBCard,
  MDBCardHeader,
  MDBCardFooter,
  MDBCardBody,
  MDBCol,
  MDBRow,
  MDBIcon,
  MDBBtn,
  MDBListGroup,
  MDBListGroupItem,
    MDBContainer
} from "mdb-vue-ui-kit";
import {useRoute, useRouter} from "vue-router";

const router = useRouter()

const movie_docs = [
  {
    title: 'Einen simulierten Patientenfall erstellen',
    url: "https://youtu.be/O3xgK_KsBno",
    thumb: "https://img.youtube.com/vi/O3xgK_KsBno/0.jpg",
    groups: ['patient']
  },
          {
    title: 'Als Behandler einen simulierten Patientfall bearbeiten',
    url: "https://youtu.be/b830DAYxXBs",
    thumb: "https://img.youtube.com/vi/b830DAYxXBs/0.jpg",
    groups: ['nurse','physiotherapist','physician','psychologist','caremanager']
  },
      {
    title: 'Der ICF Browser',
    url: "https://youtu.be/Noh7WS6coIs",
    thumb: "https://img.youtube.com/vi/Noh7WS6coIs/0.jpg",
    groups: ['nurse','physiotherapist','physician','psychologist','caremanager']
  },
]

</script>

<template>
  <MDBContainer>
  <MDBCard class="m-2" id="videohelp">
    <MDBCardHeader>
      <h1 class="text-secondary">Erklärbereich</h1>
    </MDBCardHeader>
    <MDBCardBody>
      <MDBListGroup light>
        <MDBListGroupItem v-for="m in movie_docs" class="align-items-center">
          <MDBRow>
            <h2 class="text-primary">{{ m.title }}</h2>
          </MDBRow>
          <MDBRow>
            <div>
              <a :href="m.url" target="_blank">
                <img :src="m.thumb" class="img-fluid rounded"
                     style="max-height: 150px; width: auto; object-fit: contain"/>
                <div class="mask" style="background-color: rgba(100, 0, 0, 0.1); border-radius: 10px;">
                  <div class="d-flex justify-content-center align-items-center h-100">
                    <p class="text-white mt-3">
                      <MDBIcon icon="play" size="lg" class="me-2"/>
                      Abspielen
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </MDBRow>
        </MDBListGroupItem>
      </MDBListGroup>
    </MDBCardBody>
    <MDBCardFooter>
      <MDBRow>
        <MDBCol class="justify-content-start">
          <MDBBtn color="tertiary" @click="router.back()">Zurück</MDBBtn>
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
  </MDBCard>

  <MDBCard class="m-2" id="references">
    <MDBCardHeader>
      <h1 class="text-secondary" >Quellennachweis</h1>
    </MDBCardHeader>
    <MDBCardBody>
      <h2>ICF Bilder</h2>
      <p>TAI TAKAHASHI, International University of Health and Welfare and TAI Human Research.Inc.</p>
      <a href="https://www.icfillustration.com/" target="_blank">Zur Bildbibliothek von Tai Takahashi</a>
      <hr>
      <h2>Übrige Bilder</h2>
      <p>Fotos, Vektorzeichnungen und Piktogramme wurden von <a href="https://freepik.com" target="_blank"> freepik.com</a> käuflich erworben.</p>
    </MDBCardBody>
    <MDBCardFooter>
      <MDBRow>
        <MDBCol class="justify-content-start">
          <MDBBtn color="tertiary" @click="router.back()">Zurück</MDBBtn>
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
  </MDBCard>

      <MDBCard class="m-2" id="studydocs">
    <MDBCardHeader>
      <h1 class="text-secondary">Unterlagen zur klinischen Studie</h1>
    </MDBCardHeader>
    <MDBCardBody>
      <h2>Antragsunterlagen</h2>
      <ul>
        <li><a href="https://docs.google.com/document/d/1CQV_gv8FUwgbBgTABFA6zXVsMzQLg9134ZRW8HJrOeE/edit?usp=sharing">Studienprotokoll</a> </li>
        <li><a href="https://docs.google.com/document/d/1OST-HbrsLD0iW9Ajdsz5YQAP8nJ9E_i8GusjvdrsJRE/edit?usp=sharing">Patienteninformation</a> </li>
        <li><a href="https://docs.google.com/document/d/1eA7yBG-SsNhjzmYkD-R5KR0PcPXYFWNva5YHF5TWvUQ/edit?usp=sharing">Probandeninformation Behandler</a> </li>
      </ul>

      <h2>Registrierung</h2>
      <p>Die Studie ist im Register für klinische Studien registriert. Nummer: <a href="https://www.drks.de/search/de/trial/DRKS00035069" target="_blank"> DRKS00035069 </a></p>
    </MDBCardBody>
    <MDBCardFooter>
      <MDBRow>
        <MDBCol class="justify-content-start">
          <MDBBtn color="tertiary" @click="router.back()">Zurück</MDBBtn>
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
  </MDBCard>
    </MDBContainer>
</template>

<style scoped>

</style>