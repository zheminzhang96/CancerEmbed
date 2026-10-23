'use strict';
// Handwritten illustrative content only. Never fetch from the live retrieval API.
const examples = [
  {id:'example-a',name:'Example A',label:'lymphoma',notes:8,summary:'Illustrative history: persistent lymph node enlargement with fatigue. Subsequent imaging documents lymphadenopathy. This text is fictional and does not describe a patient.',matches:[['Reference A','lymphoma','Shared example evidence: lymph node findings and a similar symptom trajectory.',0.84,0.73],['Reference B','lymphoma','Shared example evidence: fatigue and progressive lymphadenopathy.',0.79,0.68],['Reference C','breast','Overlapping example finding: an enlarged regional lymph node.',0.65,0.76]]},
  {id:'example-b',name:'Example B',label:'breast',notes:6,summary:'Illustrative history: a breast finding prompts imaging and further assessment. Clinical documentation accumulates across several encounters. This text is fictional and does not describe a patient.',matches:[['Reference D','breast','Shared example evidence: a breast finding followed by imaging evaluation.',0.86,0.77],['Reference E','breast','Shared example evidence: a similar sequence of assessment and investigations.',0.80,0.71],['Reference F','lymphoma','Overlapping example finding: regional lymph node enlargement.',0.63,0.74]]},
  {id:'example-c',name:'Example C',label:'pancreas',notes:7,summary:'Illustrative history: abdominal symptoms lead to repeated assessment and abdominal imaging. The notes describe evolving findings before diagnosis. This text is fictional and does not describe a patient.',matches:[['Reference G','pancreas','Shared example evidence: abdominal symptoms and a comparable imaging workup.',0.82,0.72],['Reference H','pancreas','Shared example evidence: a similar progression of abdominal findings.',0.77,0.66],['Reference I','lymphoma','Overlapping example finding: nonspecific abdominal symptoms.',0.62,0.75]]},
  {id:'example-d',name:'Example D',label:'myeloma',notes:9,summary:'Illustrative history: persistent back discomfort and fatigue prompt laboratory testing and imaging. Later encounters document anemia and further hematology assessment. This text is fictional and does not describe a patient.',matches:[['Reference J','myeloma','Shared example evidence: bone discomfort, anemia, and a similar sequence of hematology investigations.',0.83,0.72],['Reference K','myeloma','Shared example evidence: fatigue and bone-related findings across repeated assessments.',0.78,0.67],['Reference L','lymphoma','Overlapping example findings: fatigue and anemia during hematology evaluation.',0.64,0.75]]},
  {id:'example-e',name:'Example E',label:'prostate',notes:6,summary:'Illustrative history: urinary symptoms prompt clinical assessment and prostate-focused laboratory testing. Subsequent encounters document imaging and specialist evaluation before diagnosis. This text is fictional and does not describe a patient.',matches:[['Reference M','prostate','Shared example evidence: urinary symptoms followed by prostate-focused investigations.',0.85,0.74],['Reference N','prostate','Shared example evidence: a comparable sequence of laboratory testing and specialist assessment.',0.79,0.69],['Reference O','pancreas','Overlapping example finding: nonspecific discomfort during an evolving diagnostic workup.',0.61,0.76]]}
];
const preview = {selected:examples[0].id};
const byId = id => document.getElementById(id);
const labels = {lymphoma:'Lymphoma',breast:'Breast',pancreas:'Pancreas',myeloma:'Myeloma',prostate:'Prostate'};
const badge = label => `<span class="badge ${label}">${labels[label]}</span>`;
function renderCases(){
  const search=byId('previewSearch').value.trim().toLowerCase();
  const rows=examples.filter(row=>(row.name+' '+labels[row.label]).toLowerCase().includes(search));
  byId('previewCases').innerHTML=rows.length?rows.map(row=>`<button class="patient-item${row.id===preview.selected?' active':''}" data-example="${row.id}" aria-pressed="${row.id===preview.selected}"><div class="patient-main"><span>${row.name}</span>${badge(row.label)}</div><div class="patient-sub">Synthetic case · ${row.notes} illustrative notes</div></button>`).join(''):'<div class="preview-empty">No matching illustrative cases.</div>';
  byId('previewCases').querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{preview.selected=button.dataset.example;renderCases();renderCase();}));
}
function renderCase(){
  const row=examples.find(item=>item.id===preview.selected);
  const supcon=byId('previewMethod').value==='supcon';
  const topK=Number(byId('previewTopK').value);
  byId('previewQuery').innerHTML=`<div class="card-header"><div><div class="card-title">Query · ${row.name}</div><div class="muted">Synthetic example</div></div>${badge(row.label)}</div><div class="meta-grid"><div class="meta"><span>Input window</span><strong>Pre-diagnosis</strong></div><div class="meta"><span>Example notes</span><strong>${row.notes}</strong></div><div class="meta"><span>Data</span><strong>Illustrative only</strong></div></div><div class="summary-list"><div class="summary-heading">Illustrative clinical summary</div><article class="summary"><div class="summary-meta">Relative time: before diagnosis</div><div class="summary-text">${row.summary}</div></article></div>`;
  const neighbors=[...row.matches].sort((a,b)=>b[supcon?3:4]-a[supcon?3:4]).slice(0,topK);
  byId('previewNeighbors').innerHTML=neighbors.map((match,index)=>`<article class="neighbor-card"><div class="card-header"><div><div class="card-title">#${index+1} ${match[0]}</div><div class="muted">Synthetic reference case</div></div>${badge(match[1])}</div><div class="similarity-strip"><div><span>Illustrative cosine similarity</span><strong>${match[supcon?3:4].toFixed(3)}</strong></div></div><div class="summary-list"><article class="summary"><div class="summary-meta">Example supporting evidence</div><div class="summary-text">${match[2]}</div></article></div></article>`).join('');
  byId('previewStatus').textContent=`${topK} synthetic matches · ${supcon?'Transformer + SupCon':'Transformer'}`;
}
byId('previewSearch').addEventListener('input',renderCases);
byId('previewMethod').addEventListener('change',renderCase);
byId('previewTopK').addEventListener('change',renderCase);
renderCases();renderCase();
