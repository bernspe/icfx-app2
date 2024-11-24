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

export {translate_pseudonym}


