import type { Chapter } from './plan';

export type StudyActivity = 'active-recall' | 'problem-solving' | 'reading' | 'video-notes' | 'revision' | 'catch-up';
export type PlannedBlock = { id:string; title:string; subject:string; activity:StudyActivity; minutes:number; kind:'study'|'break'|'long-break'; reason:string };
const heavy = /mathematics|physics|chemistry/i;

/** Deterministic, student-centred day plan. No AI key or network request required. */
export function buildRealisticDayPlan(tasks: Chapter[], maxStudyMinutes = 180): PlannedBlock[] {
  const hard = tasks.filter(t => heavy.test(t.subject));
  const light = tasks.filter(t => !heavy.test(t.subject));
  const sorted: Chapter[] = [];
  while (hard.length || light.length) {
    if (hard.length) sorted.push(hard.shift()!);
    if (light.length) sorted.push(light.shift()!);
  }
  const blocks: PlannedBlock[] = [];
  let session = 0;
  let remaining = Math.max(40, maxStudyMinutes);
  sorted.forEach((task, index) => {
    if (remaining < 40) return;
    const minutes = Math.min(index === 0 ? 50 : 45, remaining);
    const activity: StudyActivity = /mathematics|physics|chemistry/i.test(task.subject)
      ? (index % 2 ? 'active-recall' : 'problem-solving')
      : (index % 2 ? 'reading' : 'active-recall');
    blocks.push({ id:`${task.id}-study`, title:task.title, subject:task.subject, activity, minutes, kind:'study', reason:activity==='problem-solving'?'Work examples independently before checking solutions':activity==='active-recall'?'Close the book and retrieve key ideas from memory':'Read a short section and make concise notes' });
    remaining -= minutes; session++;
    if (remaining > 0) {
      const long = session % 3 === 0;
      const breakMinutes = long ? 25 : 10;
      blocks.push({ id:`${task.id}-break`, title:long?'Long reset':'Short break', subject:'Break', activity:'catch-up', minutes:breakMinutes, kind:long?'long-break':'break', reason:long?'Walk, hydrate and rest your eyes':'Stand up, stretch and drink water' });
    }
  });
  blocks.push({ id:'daily-catch-up', title:'Daily catch-up buffer', subject:'Flex time', activity:'catch-up', minutes:20, kind:'study', reason:'Finish an unfinished question, clarify a doubt or move one task forward' });
  return blocks;
}
