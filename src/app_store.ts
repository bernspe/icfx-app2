import {Store} from "./store";
import {backendClientId, backendClientKey} from "./process_vars";
import _patientinput from './assets/mock-patientinput.json'
import moment from "moment";
import {UserData, user_store} from "./user_store";
import {getWhodasSum, normalizeWhodasSum} from "./calculation_helper";

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
    }
}

interface ApplicationData extends Object {
    current_patient_id: string
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

    emptyDataStore() {
        return {id: '', date: '', owner: '', creator: '', whodas: {}, env: {}, icf: {}, coreset: '', sf36: {}};
    }

    clearData() {
        this.state.current_patient_id = '';
        this.state.active_icf = '';
        this.state.patient_data = this.emptyDataStore()
        this.state.api_patient_records = []
    }


    setMockApiRecords() {
        this.state.api_all_patient_records = JSON.parse(JSON.stringify(_patientinput))
    }

    /**
     * getting cumulative Datasets from API for certain questions e.g. mean WHODAS of institution patients
     * @param k
     * @param d
     */
    getWholePatientDatasets() {
        return this.state.api_all_patient_records
            .filter(x=>Object.keys(x.whodas).length!==0)
            .map(x => normalizeWhodasSum(getWhodasSum(x.whodas)))
    }

    getWhodasWholePatientDatasets() {
        let target:Record<string,number[]> = {}
        let filtered_whodas =  this.state.api_all_patient_records.filter(x=>Object.keys(x.whodas).length!==0)
        for (let i=1; i<13; i++) {
            let istr = i.toString();
            target[istr] = filtered_whodas.map(x=>Object.keys(x.whodas).includes(istr) ? x.whodas[istr] : 0)
        }
       return target
    }

    statisticsCalculator(k: string, d: DataStore) {
        if (k === 'whodas') return (Object.keys(d.whodas)?.length != 0) ? Object.values(d.whodas).reduce((a, b) => b > 0 ? a + 1 : a) : 0
        if (k === 'env') return (Object.keys(d.env)?.length != 0) ? Object.values(d.env).reduce((a, b) => b != 4 ? a + 1 : a) : 0
        if (k === 'icf') return (Object.keys(d.icf)?.length != 0) ? Object.values(d.icf).map(icf => icf.selected > 0 ? 1 as number : 0 as number).reduce((a, b) => a + b) : 0
        if (k === 'coreset') return (d.coreset?.length != 0) ? 1 : 0
        if (k === 'sf36') return (Object.keys(d.sf36 || {})?.length != 0) ? Object.keys(d.sf36).length : 0
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
            }
        }))
    }

    loadDataFromApi(patient_id: string): Promise<Array<DataStore>> {
        return new Promise((resolve, reject) => {
            let loaded_data: DataStore[] = this.state.api_patient_records;

            // TODO: API call

            if (this.state.api_patient_records.length === 0) {
                loaded_data = JSON.parse(JSON.stringify(_patientinput)).filter((i: DataStore) => i.owner === patient_id)
            }

            const load_sorted_data = loaded_data.sort((a: DataStore, b: DataStore) => moment(b.date).diff(moment(a.date)));
            this.state.api_patient_records = load_sorted_data
            resolve(load_sorted_data)
        })
    }

    setDataToApiPatientRecords(patient_records: DataStore[]) {
        this.state.api_patient_records = patient_records;
    }

    setCurrentData(data: DataStore): void {
        this.state.patient_data = data;
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
            if (data.creator !== user_store.getState().id) {
                post_type = 'POST'
            }
            // console.log('SAving ', post_type, data)
            // TODO: Make the PATCH or POST request with data as parameter
            // MOCK
            if (post_type == 'POST') {

                data.date = today.format('YYYY-MM-DD HH:mm:ss')
                data.owner = this.state.current_patient_id
                data.creator = user_store.getState().id
                this.state.api_patient_records.push(data)
                // ENDMOCK
            }

            // Response of PATCH/POST
            this.state.patient_data = data;
            this.state.api_patient_records[this.state.api_patient_records.length - 1] = data
            resolve(data)
        })
    }

    setUsersOfThisInstitution(userarray: Array<UserData>) {
        this.state.users_of_this_institution = userarray;
    }
}

export const
    app_store: AppStore = new AppStore()