import {Store} from "./store";
import {backendURL, backendClientKey, backendClientId} from "./process_vars";
import axios from 'axios'
import {v4 as uuidv4} from 'uuid';
import moment from "moment";
import _userdata from "./assets/mock-userdata.json";

import {
    dateformat,
    db_dateformat, default_page_time, roles,
    wbauth_token_label, wbauth_usermode_label,
    wbauth_username_label
} from "./constants";


export interface UserData {
    id: string,
    pseudonym: string,
    translated_pseudonym?: string,
    last_login?: string,
    avatar?: string,
    gender?: string,
    groups: Array<string>,
    is_staff: boolean,
    institution: RemoteInstitutionDataset
    diagnoses: string,
    patient_case?: number
}


export interface RemoteInstitutionDataset extends Object {
    id: string,
    name: string,
    logo_url?: string,
    suffix?: string
    case_simulation?: boolean
}

export interface RemoteUserAPI {
    id: string,
    pseudonym: string,
    groups: Array<string>
    is_staff?: boolean
    institution: RemoteInstitutionDataset
    diagnoses: string,
    patient_case?: number
}

export interface User extends Object {
    oauth_credentials: Record<string, string>,
    access_token: string,
    mock_mode: boolean,
    authenticated: boolean,
    userdata: Array<RemoteUserAPI>,
    times_per_page: Array<number>,
    id: string,
    pseudonym: string,
    institution: RemoteInstitutionDataset,
    groups: Array<string>,
    is_staff: boolean,
    diagnoses: string
    patient_case?: number
}

class UserStore extends Store<User> {
    protected data(): User {
        return {
            oauth_credentials: Object.assign({}, {
                client_id: backendClientId(),
                client_secret: backendClientKey(),
            }),
            access_token: '',
            mock_mode: false,
            authenticated: false,
            userdata: [],
            times_per_page: [default_page_time],
            id: '',
            pseudonym: '',
            diagnoses: '',
            institution: Object.assign({}, {
                id: '',
                name: '',
                logo_url: ''
            }),
            groups: [],
            is_staff: false,
        };
    }

    clear_userdata() {
        this.state.access_token = ''
        this.state.mock_mode = false
        this.state.authenticated = false
        this.state.userdata = []
        this.state.id = ''
        this.state.times_per_page = [default_page_time]
        this.state.pseudonym = ''
        this.state.institution = Object.assign({}, {
            id: '',
            name: '',
            logo_url: ''
        })
        this.state.groups = []
        this.state.is_staff = false
        this.state.diagnoses = ''
        this.state.patient_case = undefined
    }

    setMockMode(mode: boolean): void {
        this.state.mock_mode = mode
    }

    get_token_from_browser() {
        return new Promise<string>((resolve, reject) => {
            let s = window.localStorage.getItem(wbauth_token_label)
            if (s) resolve(s)
            else reject('no Token')
        })
    }


    set_user(r: User | UserData | RemoteUserAPI) {
        this.state.id = r.id
        this.state.pseudonym = r.pseudonym
        this.state.groups = r.groups
        this.state.is_staff = r.is_staff || false
        this.state.diagnoses = r.diagnoses
        this.state.institution = Object.assign({}, r['institution'])
        this.state.patient_case = r.patient_case
    }

    connect_user_to_api():Promise<RemoteUserAPI> {
        return new Promise<RemoteUserAPI>((resolve, reject) => {
            this.get_token_from_browser()
                .then((token) => {
                    console.log('Trying to log in with browser token ... ')
                    this.checkToken(token)
                        .then((r) => {
                            this.clear_userdata()
                            this.set_access_token(token)
                            this.state.authenticated = true
                            this.set_user(r)
                            console.log('... succeeded')
                            resolve(r)
                        }).catch((e) => {
                        console.log('... failed, because ', e)
                        reject(e)
                    })
                })
                .catch((e) => {
                    this.state.authenticated = false
                    console.log(e)
                    reject('login required')
                })
        })
    }

    set_access_token(access_token: string) {
        this.state.access_token = access_token
        this.state.authenticated = true
        window.localStorage.setItem(wbauth_token_label, access_token)
    }

    clear_tokens() {
        window.localStorage.removeItem(wbauth_token_label)
    }

    increment_last_time_per_page(increment: number) {
        if (this.state.times_per_page[this.state.times_per_page.length - 1] < 70) // Deckeln der Zeiten bei 70s pro Seite
            this.state.times_per_page[this.state.times_per_page.length - 1] += increment
    }

    add_new_time_per_page() {
        this.state.times_per_page.push(default_page_time)
    }

    set_institution(institution_id: string, institution_name: string, url?: string) {
        this.state.institution.id = institution_id
        this.state.institution.name = institution_name
        this.state.institution.logo_url = url
    }

    set_userdata_from_response(r: Record<string, any>) {
        return new Promise<string>((resolve, reject) => {
            this.state.authenticated = true
            this.state.id = r.id
            this.state.pseudonym = r.pseudonym
            this.state.groups = r.groups
            this.state.diagnoses = r.diagnoses
            this.state.institution = Object.assign({}, r.institution)
            resolve('assigned')
        })
    }


    /**
     * REturns users of this institution from API
     * for patients: returns the patient and all medprofs
     * for medprofs: returns all medprofs and all patients
     */
    getAPIUsersOfThisInstitution(force_refresh?: boolean): Promise<Array<RemoteUserAPI>> {
        return new Promise((resolve, reject) => {
            if (this.state.userdata.length === 0 || force_refresh) {
                if (this.state.institution.id !== '' && this.state.authenticated && !this.state.mock_mode) {
                    var config = {
                        method: 'GET',
                        url: backendURL() + "users/",
                        headers: {
                            authorization: `Bearer ${user_store.getState().access_token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                    };
                    axios(config).then((response) => {
                        this.state.userdata = response.data
                        resolve(response.data)
                    }).catch((e) => {
                        console.log('Retrieval of userdatalist failed', e)
                        reject(e);
                    })
                } else {
                    this.state.userdata = _userdata.filter(p => p.institution.id === user_store.getState().institution.id)
                    resolve(this.state.userdata)
                }
            }
        })
    }

    getAPIInstitutions(): Promise<Array<RemoteInstitutionDataset>> {
        return new Promise((resolve, reject) => {
            const config = {
                url: backendURL() + "institution/",
                method: 'GET',
            }
            axios(config).then((response) => {
                resolve(response.data)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    checkToken(token: string): Promise<RemoteUserAPI> {
        return new Promise((resolve, reject) => {
            // get and set auth user
            //console.log('Checking Token: ', rootState.token)
            this.state.access_token = token.length > 0 ? token : this.state.access_token
            if (this.state.access_token?.length != 0) {
                const config = {
                    url: backendURL() + "userinfo/",
                    method: 'GET',
                    headers: {
                        authorization: `Bearer ${this.state.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    xhrFields: {
                        withCredentials: true
                    }
                }
                axios(config).then((response) => {
                    this.set_userdata_from_response(response.data)
                    resolve(response.data)
                }).catch((e) => {
                    reject(e)
                })
            } else {
                reject('Missing Token')
            }
        })
    }


    // Login via own OAuth Server
    login(institution_id: string, pseudonym: string, password: string): Promise<string> {
        let pw = password ? password : 'password'
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                var data = new FormData();
                data.append('client_id', this.state.oauth_credentials.client_id);
                data.append('client_secret', this.state.oauth_credentials.client_secret);
                data.append('grant_type', 'password');
                data.append('institution_id', institution_id);
                data.append('pseudonym', pseudonym);
                data.append('password', pw);
                var config = {
                    method: 'POST',
                    url: backendURL() + "o/pseudonymtoken/",
                    data: data
                };
                //obtain token
                axios(config)
                    .then((response) => {
                        this.set_access_token(response.data.access_token)
                        resolve(response.data.access_token)
                    }).catch((error) => {
                    console.log("...failed:", error);
                    reject()
                })
            }, 1000)
        })
    }

    // Register through institution id
    register(institution_id: string, password: string, codename?: string, group?: string, casenumber?: number): Promise<string> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                var data = new FormData();
                data.append('client_id', this.state.oauth_credentials.client_id);
                data.append('client_secret', this.state.oauth_credentials.client_secret);
                data.append('grant_type', 'password');
                data.append('username', uuidv4());
                data.append('password', password);
                data.append('institution', institution_id);
                if (codename) data.append('codename', codename);
                if (group) data.append('group', group);
                if (casenumber) data.append('patient_case',casenumber.toString())
                var config = {
                    method: 'POST',
                    url: backendURL() + "register/",
                    data: data
                };
                //obtain token
                axios(config)
                    .then((response) => {
                        this.set_access_token(response.data.access_token)
                        resolve(response.data.access_token)
                    }).catch((error) => {
                    console.log("...failed:", error);
                    reject(error)
                })
            }, 1000)
        })
    }


    updateAccountDetails(payload: Record<string, any> | null, targetuser?: string): Promise<Record<string, any>> {
        return new Promise((resolve, reject) => {
            if (!payload) {
                reject('Nothing to update')
                return
            }
            setTimeout(() => {
                if (this.state.id) {
                    const config = {
                        url: backendURL() + "users/" + (targetuser ? targetuser : this.state.id) + '/',
                        method: 'PATCH',
                        headers: {
                            authorization: `Bearer ${this.state.access_token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        data: payload
                    }
                    console.log(config)
                    axios(config).then((response) => {
                        this.set_userdata_from_response(response.data)
                            .then(() => resolve(response))
                    }).catch((e) => {
                        if (e.statusCode == '401') this.state.authenticated = false
                        reject(e)
                    })
                } else {
                    reject('UpdateAccount: No User active')
                }
            }, 1000)
        })
    }

        getInstitutionsLeaderboard(): Promise<Array<[string,number,number]>> {
        return new Promise((resolve, reject) => {
            const config = {
                url: backendURL() + "institution/"+this.state.institution.id+'/getmedprofsperformance/',
                                        headers: {
                            authorization: `Bearer ${this.state.access_token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                method: 'GET',
            }
            axios(config).then((response) => {
                resolve(response.data)
            }).catch((e) => {
                reject(e)
            })
        })
    }

}

export const
    user_store: UserStore = new UserStore()