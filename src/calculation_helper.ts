import {Auspraegung} from "./constants";

const getWhodasSum = (whodas: Record<string,number>) => {
  if (Object.values(whodas).length===0) return 0
  return Object.values(whodas).reduce((accumulator, currentValue) => accumulator + currentValue)
}

const describeWhodasSum = (whodasSum: number) => {
  return Auspraegung[Math.ceil(whodasSum / 12)]
}

const normalizeWhodasSum = (whodasSum: number) => {
  return Math.floor(whodasSum * 100 / 48)
}

const avg = (arr:number[]) => arr.reduce((acc,v,i,a)=>(acc+v/a.length),0);

export {getWhodasSum,describeWhodasSum,normalizeWhodasSum}