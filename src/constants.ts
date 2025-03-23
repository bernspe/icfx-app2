const AuspraegungBeschwerden = ['Keine Probleme','Wenige Probleme','Einige Probleme','Starke Probleme','Sehr starke Probleme oder gar nicht möglich']
const Auspraegung = ['keine','geringe','mäßige','starke','maximale']
type HEX = `#${string}`;
const InactiveColor = '#dddfda'
const AuspraegungColor =  ['#f0f3bd','#fb8b24','#e36414','#9a031e','#5f0f40']
const AuspraegungTextColor='#2b2b2b'
const UmweltFaktoren = ['Dadurch vollständig beeinträchtigt','Dadurch stark beeinträchtigt','Dadurch mäßig beeinträchtigt','Dadurch leicht beeinträchtigt','Dadurch gar nicht beeinträchtigt','Unterstützt ein wenig','Unterstützt mäßig','Unterstützt substantiell','Beeinflussen mein Leben sehr stark postitiv']
const UmweltColor_old = ['#97322b','#97682b','#97682b', '#97832b'     ,'#bfdb82',  '#afd363', '#a0ca45','#8cb534','#75972b']

const UmweltColor = ['#5f0f40','#9a031e','#e36414','#fb8b24','#f0f3bd','#02c39a','#00a896','#028090','#05668d']
const UmweltTextColor = '#2b2b2b'

const selector_types = ['scroller','slider']
const wbauth_token_label ='WB_token'
const wbauth_username_label = 'WB_username'
const wbauth_usermode_label = 'WB_usermode'
const wbauth_current_journey_location_label = 'WB_journey_location'
const dateformat = "DD.MM.YYYY"

const dateTimeFormat = "DD.MM.YYYY, hh:mm"
const db_dateformat = "YYYY-MM-DD"
const language = "de-DE"
const startLabel = 'Start'

const statusLabels = ['Wartet','Aktiv','Beendet']

const roles =[
      {name: 'Patient/in',icon:'patient.jpg',group:'patient'},
  {name: 'Ärztin / Arzt',icon:'physician.jpg',group:'physician'},
    {name: 'Krankenschwester / Pfleger',icon:'nurse.jpg',group:'nurse'},
    {name: 'Physiotherapeut/in',icon:'physiotherapist.jpg',group:'physiotherapist'},
    {name: 'Psycholog/in',icon:'psychologist.jpg',group:'psychologist'},
    {name: 'Sozialarbeiter/in',icon:'caremanager.jpg',group:'caremanager'},
]

const mergeOperations = [
  {operation: 'and', icon: 'sets_logical_and.svg', descriptor_de: 'und', descriptor_en: 'and'},
  {
    operation: 'or',
    icon: 'sets_logical_or.svg',
    descriptor_de: 'oder',
    descriptor_en: 'or'
  },
  {operation: 'right', icon: 'sets_logical_right.svg', descriptor_de: 'rechts', descriptor_en: 'right'},
  {operation: 'left', icon: 'sets_logical_left.svg', descriptor_de: 'links', descriptor_en: 'left'},
]

const modules = ['whodas','env','coreset','icf','sf36']

const default_page_time = 10

export {dateTimeFormat,
  wbauth_usermode_label,wbauth_token_label,wbauth_username_label,wbauth_current_journey_location_label,
  Auspraegung,AuspraegungBeschwerden,InactiveColor, AuspraegungColor,AuspraegungTextColor,
  UmweltFaktoren,UmweltColor, UmweltTextColor,
    selector_types,
  dateformat,
  db_dateformat,language,startLabel, statusLabels, roles, modules,
default_page_time,
mergeOperations}

