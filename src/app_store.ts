import {Store} from "./store";
import {backendClientId, backendClientKey, backendURL} from "./process_vars";
import _patientinput from './assets/mock-patientinput.json'
import moment from "moment";
import {UserData, user_store} from "./user_store";
import {getWhodasSum, normalizeWhodasSum} from "./calculation_helper";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

export interface Explanation extends Object {
    created: string
    last_modified: string
    creator: string
    validator?: string
    refcode: string
    text: string
}
export interface PatientCase extends Object {
    title: string,
    history: string,
    diagnoses: string,
    pic: string
}

/**
 * Data structure of icf_codes3.json
 * a: ancestors (level above)
 * c: children (level below)
 * t: title
 * h: explanation
 * p: picture
 */
export interface ICFItemStructure extends Object {
    'a': string,
    'b': string,
    'c': Array<string>
    'm': string,
    'h': string,
    't': string,
    'p': string
}

export interface WhodasEnvItemStructure {
    "s": string,
    "t": string,
    "d": string,
    e?: Array<string>,
    "l": string,
    "p": Array<string>
}

/**
 * For saving ICF Quantifier values and selection state (0: not touched, -1: deselected, 1: selected)
 */
export interface ICFStruct {
    value: number,
    selected: number
}

export interface MergeProperties {
    operation: string,
    source1: string,
    source2: string,
}

export interface DataStoreAPI {
        id: string,
    created: string,
    last_modified: string,
    owner: string,
    creator: string,
    owner_institution: string,
    data: any
    diagnoses?: string,
    merge?: MergeProperties
}

export interface DataStore {
    id?: string,
    date?: string,
    owner?: string,
    creator: string,
    whodas: Record<string, number>
    env: Record<string, number>
    icf: Record<string, ICFStruct>
    coreset: string
    sf36: Record<string, number>
    uxquestionnaire: Record<string,number>
    merge?: MergeProperties
}


export interface DataStoreStatistics {
    id?: string,
    date?: string,
    owner?: string,
    creator: string,
    modules: {
        whodas: number
        env: number
        icf: number
        coreset: number
        sf36: number
        uxquestionnaire: number
    }
}

interface ApplicationData extends Object {
    current_patient_id: string
    current_patient_diagnoses: string
    active_icf: string

    patient_data: DataStore
    users_of_this_institution: Array<UserData>
    api_all_patient_records: Array<DataStore>
    api_patient_records: Array<DataStore>
}

class AppStore extends Store<ApplicationData> {
    protected data(): ApplicationData {
        return {
            current_patient_id: '',
            current_patient_diagnoses:'',
            active_icf: '',
            patient_data: this.emptyDataStore(), // current dataset
            users_of_this_institution: [],
            api_all_patient_records: [], // all patients
            api_patient_records: [] // current patient all datasets

        };
    }

    set_current_patient_id(current_patient_id: string): void {
        if (current_patient_id !== this.state.current_patient_id) {
            // TODO: Set Data from API
            this.clearData()
        }
        this.state.current_patient_id = current_patient_id;
    }

    set_active_icf(active_icf: string): void {
        this.state.active_icf = active_icf;
    }

    emptyDataStore(): DataStore {
        return {id: '', date: '', owner: '', creator: user_store.getState().id, whodas: {}, env: {}, icf: {}, coreset: '', sf36: {}, uxquestionnaire: {}, merge: undefined};
    }

    clearData() {
        this.state.current_patient_id = '';
        this.state.current_patient_diagnoses = '';
        this.state.active_icf = '';
        this.state.patient_data = this.emptyDataStore()
        this.state.api_patient_records = []
    }


    /**
     * getting cumulative Datasets from API for certain questions e.g. mean WHODAS of institution patients
     * @param k
     * @param d
     */

    getWhodasWholePatientDatasets() {
        let target: Record<string, number[]> = {}
        let filtered_whodas = this.state.api_all_patient_records.filter(x => Object.keys(x.whodas).length !== 0)
        for (let i = 1; i < 13; i++) {
            let istr = i.toString();
            target[istr] = filtered_whodas.map(x => Object.keys(x.whodas).includes(istr) ? x.whodas[istr] : 0)
        }
        return target
    }

    statisticsCalculator(k: string, d: DataStore) {
        if (k === 'whodas') return (Object.keys(d.whodas || {})?.length != 0) ? Object.values(d.whodas).reduce((a, b) => b > 0 ? a + 1 : a) : 0
        if (k === 'env') return (Object.keys(d.env|| {})?.length != 0) ? Object.values(d.env).reduce((a, b) => b != 4 ? a + 1 : a) : 0
        if (k === 'icf') return (Object.keys(d.icf|| {})?.length != 0) ? Object.values(d.icf).map(icf => icf.selected > 0 ? 1 as number : 0 as number).reduce((a, b) => a + b) : 0
        if (k === 'coreset') return (d.coreset?.length != 0) ? 1 : 0
        if (k === 'sf36') return (Object.keys(d.sf36 || {})?.length != 0) ? Object.keys(d.sf36).length : 0
        if (k === 'uxquestionnaire') return (Object.keys(d.uxquestionnaire || {})?.length != 0) ? Object.keys(d.uxquestionnaire).length : 0
        return 0
    }

    getPatientStatisticsFromAPI(patient_id: string): DataStoreStatistics[] {
        // TODO: load fulfillment statistics from API
        const loaded_data: DataStore[] = JSON.parse(JSON.stringify(_patientinput)).filter((i: DataStore) => i.owner === patient_id);
        //const load_sorted_data = loaded_data.sort((a: DataStore, b: DataStore) => b.date ? b.date.localeCompare(a.date ? a.date : '') : 0);
        return loaded_data.map(d => ({
            id: d.id, owner: d.owner, creator: d.creator, date: d.date,
            modules: {
                whodas: this.statisticsCalculator('whodas', d),
                env: this.statisticsCalculator('env', d),
                icf: this.statisticsCalculator('icf', d),
                coreset: this.statisticsCalculator('coreset', d),
                sf36: this.statisticsCalculator('sf36', d),
                uxquestionnaire: this.statisticsCalculator('uxquestionnaire', d),
            }
        }))
    }

    transformAPIResponse(d:DataStoreAPI):DataStore {
        return {id:d.id,creator:d.creator,owner:d.owner, date: d.last_modified, merge: d.merge,
                whodas:d.data?.whodas || {}, env: d.data?.env || {}, icf: d.data.icf || {},coreset: d.data?.coreset || '',sf36: d.data?.sf36 || {}, uxquestionnaire: d.data?.uxquestionnaire || {}}
    }

    putCreatorsLastDatasetToCurrentData() {
        let idx= this.state.api_patient_records.map(d=>d.creator).indexOf(user_store.getState().id)
        if (idx >= 0) { this.state.patient_data = this.state.api_patient_records[idx]}
    }

    loadDataFromApi(patient_id: string): Promise<Array<DataStore>> {
        return new Promise((resolve, reject) => {
            if (user_store.getState().access_token) { // API CALL
                if (user_store.getState().authenticated && !user_store.getState().mock_mode) {
                    var config = {
                        method: 'GET',
                        url: backendURL() + "users/" + patient_id + '/usersicfdata/',
                        headers: {
                            authorization: `Bearer ${user_store.getState().access_token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                    };
                    axios(config).then((response:{data: Array<DataStoreAPI>}) => {
                        let loaded_data = response.data.map(r=>this.transformAPIResponse(r))
                        const load_sorted_data = loaded_data.sort((a: DataStore, b: DataStore) => moment(b.date).diff(moment(a.date)));
                        this.state.api_patient_records = load_sorted_data
                        this.putCreatorsLastDatasetToCurrentData()
                        this.state.current_patient_diagnoses = response.data[0]?.diagnoses || ''
                        resolve(load_sorted_data)
                    }).catch((e) => {
                        console.log('Retrieval of ICFDATA results failed', e)
                        resolve(this.state.api_patient_records)
                        //reject(e);
                    })
                } else reject('Not authenticated')
            } else { // LOAD FROM MOCK DATA
                let loaded_data: DataStore[] = this.state.api_patient_records;

                if (this.state.api_patient_records.length === 0) {
                    loaded_data = JSON.parse(JSON.stringify(_patientinput)).filter((i: DataStore) => i.owner === patient_id)
                }

                const load_sorted_data = loaded_data.sort((a: DataStore, b: DataStore) => moment(b.date).diff(moment(a.date)));
                this.state.api_patient_records = load_sorted_data
                this.putCreatorsLastDatasetToCurrentData()
                resolve(load_sorted_data)
            }
        })
    }

    setDataToApiPatientRecords(patient_records: DataStore[]) {
        this.state.api_patient_records = patient_records;
    }

    setCurrentData(data: DataStore): void {
        this.state.patient_data = data;
    }

    icfDataAPIRequest(method: string, d: DataStore): Promise<DataStoreAPI> {
        return new Promise((resolve, reject) => {
            if (user_store.getState().authenticated) {
                var config = {
                    method: method,
                    url: backendURL() + `icfdata/${method==='PATCH' ? d.id+'/' : ''}`,
                    headers: {
                        authorization: `Bearer ${user_store.getState().access_token}`,
                        'Content-Type': 'application/json'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    data: {data: {whodas:d.whodas,env:d.env,icf:d.icf,coreset:d.coreset,sf36:d.sf36,uxquestionnaire: d.uxquestionnaire},
                        merge: d.merge,
                        owner: this.state.current_patient_id}
                };
                axios(config).then((response) => {
                    resolve(response.data)
                }).catch((e) => {
                    reject(e);
                })
            } else reject('Not authenticated')

        })
    }

    saveDataToApi(d: DataStore) {
        return new Promise((resolve, reject) => {
            let today = moment()
            let post_type = 'PATCH'
            let data: DataStore = JSON.parse(JSON.stringify(d))
            if (data.date) {
                let d = moment(data.date).diff(today, 'days') < -1
                post_type = d ? 'POST' : 'PATCH'
            }
            if ((!Object.keys(data).includes('id')) || (data.id?.length===0)) {
                post_type = 'POST'
            }
            if (!user_store.getState().mock_mode)
                this.icfDataAPIRequest(post_type, d).then(response => {
                    data = this.transformAPIResponse( response)
                    this.state.patient_data = data;
                    this.state.api_patient_records[this.state.api_patient_records.length - 1] = data
                    resolve(data)
                }).catch((e) => reject(e))
            // MOCK
            else {
                if (post_type == 'POST') {

                    data.date = today.format('YYYY-MM-DD HH:mm:ss')
                    data.owner = this.state.current_patient_id
                    data.creator = user_store.getState().id
                    data.id=uuidv4()
                    this.state.api_patient_records.push(data)
                    // ENDMOCK
                }

                // Response of PATCH/POST
                this.state.patient_data = data;
                this.state.api_patient_records[this.state.api_patient_records.length - 1] = data
                resolve(data)
            }
        })
    }

    updateUserDiagnoses(targetUser: string, diagnoses: string): Promise<string> {
        return new Promise((resolve, reject) => {
                       setTimeout(() => {
                if (targetUser && user_store.getState().access_token) {
                    const config = {
                        url: backendURL() + "users/" + targetUser + '/setdiagnoses/',
                        method: 'POST',
                        headers: {
                            authorization: `Bearer ${user_store.getState().access_token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        data: {diagnoses: diagnoses}
                    }
                    console.log(config)
                    axios(config).then((response) => {
                        this.state.current_patient_diagnoses=response.data.diagnoses
                resolve(this.state.current_patient_diagnoses)
                    }).catch((e) => {
                        reject(e)
                    })
                } else {
                    reject('UpdateAccount: No User active')
                }
            }, 1000)
        })
    }


    loadExplanationsFromApi(refcode: string): Promise<Array<Explanation>> {
        return new Promise((resolve, reject) => {
            if (user_store.getState().access_token) { // API CALL
                if (user_store.getState().authenticated && !user_store.getState().mock_mode) {
                    var config = {
                        method: 'GET',
                        url: backendURL() + "explain/getexplanationsbyrefcode/",
                        headers: {
                            authorization: `Bearer ${user_store.getState().access_token}`,
                            'Content-Type': 'application/json'
                        },
                        params: {
                            refcode: refcode
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                    };
                    axios(config).then((response:{data: Array<Explanation>}) => {
                        resolve(response.data)
                    }).catch((e) => {
                        console.log('Retrieval of Explanations failed', e)
                        reject(e);
                    })
                } else reject('Not authenticated')
            }
        })
    }

}

export const
    app_store: AppStore = new AppStore()