import {Store} from "./store";
import _icf_json from "./assets/icf_codes3.json";

interface ICFItemStructure extends Object {
    'a': string,
    'b': string,
    'c': Array<string>
    'm': string,
    'h': string,
    't': string,
    'p': string
}

interface User extends Object {
    age: Number,
    sex: string,
}

interface Icf extends Object {
    pageLoading: boolean,
    dataSource: string,
    activeICFLevels: Array<string>
    selection: Set<string>
    icf_json: Record<string, ICFItemStructure>
    icf_json_view: Record<string, ICFItemStructure>
}

class IcfStore extends Store<Icf> {
    protected data(): Icf {
        return {
            pageLoading: false,
            dataSource: 'browser',
            activeICFLevels: new Array<string>(0),
            selection: new Set,
            icf_json: Object.assign({}, _icf_json),
            icf_json_view: Object.assign({}, {}),
        };
    }

    setDataSource(s: string) {
        this.state.dataSource = s
    }

    clearAllItems() {
        this.state.selection.clear()
        this.state.icf_json = Object.assign({}, _icf_json)
        this.state.icf_json_view = Object.assign({}, {})
    }

    addToActiveIcfLevels(code: string) {
        this.state.activeICFLevels.push(code)
    }

    popFromActiveIcfLevels() {
        this.state.activeICFLevels.pop()
    }

    jumpToLocation(location: string) {
        this.state.activeICFLevels = location === 'base' ? this.state.activeICFLevels.slice(0, 0) : this.state.activeICFLevels.slice(0, this.state.activeICFLevels.indexOf(location) + 1)
    }

    addToSelection(k: string) {
        if (k.length===0) return
        this.state.selection.add(k)
        this.setIcfJsonBadge(k, 'S')
    }

    getIcfByBadge(badge:string) {
        return Object.values(this.state.icf_json).filter(x => x.b ===badge)
    }

    setIcfJsonBadge(k: keyof typeof this.state.icf_json, c: string) {
        this.state.icf_json[k]['b'] = c
    }

    markAncestors(code: string, badge: string) {
        this.setIcfJsonBadge(code, badge)
        if (this.state.icf_json[code]['a'] !== '') {
            if (((code.length > 3) && (badge === 'S')) || (badge === 'x'))
                this.markAncestors(this.state.icf_json[code]['a'], badge)
        }
    }

    getFilteredICF(badgeKeys: Array<string>) {
        this.state.icf_json_view = Object.fromEntries(Object.entries(this.state.icf_json)
            .filter((o) =>  badgeKeys.includes(o[1].b)))
    }

}


export const icf_store: IcfStore = new IcfStore()
