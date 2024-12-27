import {computed, ref} from "vue";
import {language} from "./constants";
import __avtrans from './assets/avatar_transcriptions.json'

const _avtrans: Record<string, Record<string, string>> = __avtrans;

function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

const regIdentifier = /(?<noun>[\w|\W]*)\((?<bracket>[^)]+)\)/;

const lang = language.split('-')[0]

const adj_suffixes: Record<string, Record<string, string>> = {
    'de': {'m': 'er', 'w': 'e', 'n': 'es'}
}

const translate_pseudonym = (en_pseudonym: string) => {
    const adjective_img = en_pseudonym?.split(' ')[0]
    const noun_img = en_pseudonym?.split(' ')[1]
    let keys: Array<string> = Object.keys(_avtrans[lang])
    let adj = keys.includes(adjective_img) ? _avtrans[lang][adjective_img] : adjective_img
    let t_noun = keys.includes(noun_img) ? _avtrans[lang][noun_img] : noun_img
    let match = t_noun.match(regIdentifier)
    let t2_noun = t_noun
    if (match?.groups) {
        t2_noun = match.groups['noun']
        let sex = match.groups['bracket']
        if (sex) adj += adj_suffixes[lang][sex]
    }
    return capitalizeFirstLetter(adj) + ' ' + capitalizeFirstLetter(t2_noun)
}

const backtranslate_pseudonym = (nonen_pseudonym: string) => {
    const nonen_adjective = nonen_pseudonym?.split(' ')[0]?.toLowerCase()
    const nonen_noun = nonen_pseudonym?.split(' ')[1]?.toLowerCase()
    if (nonen_noun && nonen_adjective) {
        let vals: Array<string> = Object.values(_avtrans[lang])
        let keys: Array<string> = Object.keys(_avtrans[lang])
        let closest_adj = vals.filter((v, i) => v.toLowerCase().includes(nonen_adjective.substring(0,v.length-1)))?.sort((a, b) => a.length - b.length)[0]
        let closest_noun = vals.filter((v, i) => v.toLowerCase().includes(nonen_noun))?.sort((a, b) => a.length - b.length)[0]
        if (closest_adj && closest_noun) {
            let adj_idx = vals.findIndex(element => element.includes(closest_adj))
            let noun_idx = vals.findIndex(element => element.includes(closest_noun))
            if (noun_idx > -1 && adj_idx > -1) return keys[adj_idx] + ' ' + keys[noun_idx]
        }
    }
    return ''
}

export {translate_pseudonym, backtranslate_pseudonym}


