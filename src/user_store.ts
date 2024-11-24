import {Store} from "./store";
import {backendURL, backendClientKey, backendClientId} from "./process_vars";
import axios from 'axios'
import moment from "moment";
import _userdata from "./assets/mock-userdata.json";

import {
    dateformat,
    db_dateformat, default_page_time,
    wbauth_token_label, wbauth_usermode_label,
    wbauth_username_label
} from "./constants";


export interface InstitutionData {
  id: string,
  name: string,
  suffix: string
}

export interface UserData {
  id: string,
  pseudonym: string,
    translated_pseudonym?: string,
  last_login: string,
  groups: Array<string>,
  institution: InstitutionData
}



export interface RemoteInstitutionDataset extends Object {
    id: string,
    created: string,
    expires: string,
    name: string,
    logo_url: string,
}
export interface RemoteUserAPI {
    id: string,
    pseudonym: string,
    email: string,
    groups: Array<Record<'name', string>>
    institution: RemoteInstitutionDataset
}

export interface User extends Object {
    oauth_credentials: Record<string, string>,
    access_token: string,
    authenticated: boolean,
    times_per_page: Array<number>,
    id: string,
    pseudonym: string,
    institution:RemoteInstitutionDataset | InstitutionData,
    groups: Array<string>,

}

class UserStore extends Store<User> {
    protected data(): User {
        return {
            oauth_credentials: Object.assign({}, {
                client_id: backendClientId(),
                client_secret: backendClientKey(),
            }),
            access_token: '',
            authenticated: false,
            times_per_page: [default_page_time],
            id: '',
            pseudonym: '',
            institution:Object.assign({}, {
                id: '',
                created: '',
                expires: '',
                name: '',
                logo_url: ''}),
            groups: [],
        };
    }

    clear_userdata() {
        this.state.access_token = ''
        this.state.authenticated = false
        this.state.id = ''
        this.state.times_per_page=[default_page_time]
                  this.state.pseudonym= ''
        this.state.institution=Object.assign({}, {
                id: '',
                created: '',
                expires: '',
                name: '',
                logo_url: ''})
            this.state.groups= []
    }

    get_token_from_browser() {
        return new Promise<string>((resolve, reject) => {
            let s = window.localStorage.getItem(wbauth_token_label)
            if (s) resolve(s)
            else reject('no Token')
        })
    }

    get_username_from_browser() {
        return new Promise<string>((resolve, reject) => {
            let s = window.localStorage.getItem(wbauth_username_label)
            if (s) resolve(s)
            else reject('no Username')
        })
    }

    set_user(r: RemoteUserAPI | User | UserData) {
        this.state.id = r.id
        this.state.pseudonym = r.pseudonym
        this.state.groups =  r.groups.map((x) => (typeof x === 'string') ? x :x.name)
        this.state.institution = Object.assign({}, r.institution)
    }

    connect_user_to_api() {
        return new Promise<string>((resolve, reject) => {
            this.get_token_from_browser()
                .then((token) => {
                    console.log('Trying to log in with browser token ... ')
                    this.checkToken(token)
                        .then((r) => {
                            this.state.authenticated = true
                            this.set_user(r)
                            console.log('... succeeded')
                            resolve('connected')
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


    set_username(username: string) {
        this.state.id = username
        window.localStorage.setItem(wbauth_username_label, username)
    }

    increment_last_time_per_page(increment: number) {
        if (this.state.times_per_page[this.state.times_per_page.length-1]<120)
         this.state.times_per_page[this.state.times_per_page.length-1]+=increment
    }

    add_new_time_per_page() {
        this.state.times_per_page.push(default_page_time)
    }

    set_institution(institution_id: string, institution_name: string) {
        this.state.institution.id=institution_id
        this.state.institution.name=institution_name
    }



    set_userdata_from_response(r: Record<string, any>) {
        return new Promise<string>((resolve, reject) => {
            this.state.authenticated=true
            this.state.id = r.id
            this.state.pseudonym = r.pseudonym
        this.state.groups = r.groups.map((x: { name: any; }) => x.name)
        this.state.institution = Object.assign({}, r.institution_link)
            resolve('assigned')
        })
    }

    getUserFromUserID(id: string) {
        return new Promise<UserData>((resolve, reject) => {
            let idx = _userdata.map(x=>x.id).indexOf(id)
            if (idx > -1) {
                let u = _userdata[idx]
                resolve(u)
            } else reject({})

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
    login(username: string, password: string): Promise<string> {
        this.state.id = username.length > 0 ? username : this.state.id
        let pw = password ? password : 'password'
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                var data = new FormData();
                data.append('client_id', this.state.oauth_credentials.client_id);
                data.append('client_secret', this.state.oauth_credentials.client_secret);
                data.append('grant_type', 'password');
                data.append('username', this.state.id);
                data.append('password', pw);
                var config = {
                    method: 'POST',
                    url: backendURL() + "o/token/",
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


    trigger_token(email: string|undefined): Promise<string> {
        return new Promise((resolve, reject) => {
                            var data = new FormData();
              if (email) data.append('token_email', email);
            setTimeout(() => {
                var config = {
                    method: 'POST',
                    url: backendURL() + `users/${this.state.id}/email_user_token/`,
                    headers: {
                        authorization: `Bearer ${this.state.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    data: data
                };
                axios(config)
                    .then((response) => {
                        resolve(response.data.username)
                    }).catch((error) => {
                    console.log("...failed:", error);
                    reject()
                })
            }, 1000)
        })
    }


    updateAccountDetails(payload: Record<string, any> | null): Promise<Record<string, any>> {
        return new Promise((resolve, reject) => {
            if (!payload) {
                reject('Nothing to update')
                return
            }
            setTimeout(() => {
                if (this.state.id) {
                    const config = {
                        url: backendURL() + "users/" + this.state.id + '/',
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
                    axios(config).then((response) => {
                        this.set_userdata_from_response(response.data)
                            .then(() => resolve(response))
                    }).catch((e) => {
                        if (e.statusCode=='401') this.state.authenticated=false
                        reject(e)
                    })
                } else {
                    reject('UpdateAccount: No User active')
                }
            }, 1000)
        })
    }

        setUserGroup(group: string): Promise<Record<string, string>> {
        return new Promise((resolve, reject) => {
            if (!group) {
                reject('Nothing to update')
                return
            }
            setTimeout(() => {
                if (this.state.id) {
                    const config = {
                        url: backendURL() + "users/" + this.state.id + '/setgroup/',
                        method: 'POST',
                        headers: {
                            authorization: `Bearer ${this.state.access_token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        data: {group: group, replace:true}
                    }
                    axios(config).then((response) => {
                        this.state.groups=response.data.groups
                        resolve(response.data)
                    }).catch((e) => {
                        reject(e)
                    })
                } else {
                    reject('SetGroup: No User active')
                }
            }, 1000)
        })
    }


    email_to_user(to_email: string, add_info: string, email_type: 'startitem', folder: 'user') {
        return new Promise((resolve, reject) => {
            if (this.state.authenticated) {
                var config = {
                    method: 'GET',
                    url: backendURL() + `users/${this.state.id}/email_user/`,
                    headers: {
                        authorization: `Bearer ${this.state.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    params: {
                        email: to_email,
                        type: email_type,
                        folder: folder,
                        add_info: add_info
                    }
                };
                axios(config).then((response) => {
                    resolve(response.data)
                }).catch((e) => {
                    reject(e);
                })
            } else reject('Not authenticated')
        })
    }

}

export const
    user_store: UserStore = new UserStore()