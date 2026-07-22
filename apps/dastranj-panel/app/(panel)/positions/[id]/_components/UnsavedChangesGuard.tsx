'use client';
import { useEffect } from 'react';

export function UnsavedChangesGuard({formIds}:{formIds:string[]}){
  useEffect(()=>{let dirty=false; const forms=formIds.map((id)=>document.getElementById(id)).filter((item):item is HTMLFormElement=>item instanceof HTMLFormElement); const change=()=>{dirty=true}; const submit=()=>{dirty=false}; forms.forEach((form)=>{form.addEventListener('input',change);form.addEventListener('submit',submit)}); const unload=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue=''}}; window.addEventListener('beforeunload',unload); return()=>{forms.forEach((form)=>{form.removeEventListener('input',change);form.removeEventListener('submit',submit)});window.removeEventListener('beforeunload',unload)}},[formIds]);
  return null;
}
