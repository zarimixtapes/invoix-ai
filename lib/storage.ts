'use client';import {customers,templates} from './data';import {Customer,Invoice,Template} from './types';
const k={c:'invoix_customers_v3',t:'invoix_templates_v3',i:'invoix_invoices_v3'};
const get=<T,>(key:string,f:T):T=>{if(typeof window==='undefined')return f;const raw=localStorage.getItem(key);if(!raw){localStorage.setItem(key,JSON.stringify(f));return f}return JSON.parse(raw)};
const set=(key:string,v:any)=>localStorage.setItem(key,JSON.stringify(v));
export const getCustomers=()=>get<Customer[]>(k.c,customers);export const saveCustomers=(v:Customer[])=>set(k.c,v);
export const getTemplates=()=>get<Template[]>(k.t,templates);export const saveTemplates=(v:Template[])=>set(k.t,v);
export const getInvoices=()=>get<Invoice[]>(k.i,[]);export const saveInvoices=(v:Invoice[])=>set(k.i,v);
export const addInvoice=(v:Invoice)=>{const a=getInvoices();a.unshift(v);saveInvoices(a)};
