# ICFx App 2

Die ICFx WebApp ermöglicht die Eingabe von Teilhabestörungen durch Betroffene und Behandler. Dabei wird die Eingabe auf Betroffenen-Seite durch Screening-Fragebögen in Leichter Sprache und mit Illustrationsunterstützung auf damit verlinkte ICF-Items kondensiert. Die Behandler erreichen dieses Ziel durch die Verwendung von Coresets oder den ICF-Browser. Beide Einschätzungen konvergieren demzufolge auf die ICF Klassifikation von Teilhabestörungen der WHO.
Die Speicherung der Eingaben erfolgt frictionless in einer API (Django Rest Framework).
Die Authentifizierung erfolgt über Pseudonyme (Lustige Tiernamen).

## Workflow Betroffener
 - Whodas-Fragebogen (12 Fragen)
 - Fragebogen zu den Kontextfaktoren (5 Fragen)
 - ICF Items (generiert aus den vorangegangenen Fragen)
 - SF-36 Fragebogen zur internen Validierung
 - SUS-Fragebogen zur Usability

## Workflow Behandler
 - Einwählen in die eigene Institution (Registrierung dort ist nur mit Codewort möglich)
 - Auswahl des Patienten-/Betroffenen-Pseudonyms aus der Liste
 - Auswahl der Coresets und Bearbeiten der daraus generierten ICF Items

## Testbetrieb
Ein Ausprobieren ist über folgenden Link möglich:
https://icfx2.renecol.org

Die Institutionen mit "St." am Anfang sind reine Testinstitutionen, teilweise mit Fake-Fällen ohne Verbindung zur API, so dass die Oberfläche darüber ausprobiert werden kann.





