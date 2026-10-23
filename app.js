'use strict';
const $ = id => document.getElementById(id);
const definitions = {
  retrieval: {labels:['H@1','P@1','H@5','P@5','H@10','P@10'],defaultMetric:2,description:'H@K: percentage of queries with at least one same-cancer patient in the top K. P@K: mean percentage of same-cancer patients within the top K.'},
  classification: {labels:['Accuracy','F1','ROC-AUC','Precision','Recall'],defaultMetric:0,description:'Five-class cancer classification. Accuracy is micro-averaged; F1, ROC-AUC, precision, and recall are macro-averaged across the five classes.'}
};
let task = 'retrieval';
let results;
function setTask(next){
  task=next;
  document.querySelectorAll('[data-task]').forEach(button=>{const active=button.dataset.task===task;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  $('metric').replaceChildren(...definitions[task].labels.map((label,i)=>new Option(label,String(i))));
  $('metric').value=String(definitions[task].defaultMetric);
  render();
}
function el(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
function render(){
  if(!results)return;
  const cohort=$('cohort').value, index=Number($('metric').value), metric=definitions[task].labels[index];
  const group=$('comparison').value;
  const rows=[...results[group][task]].sort((a,b)=>(b[cohort][index]??-1)-(a[cohort][index]??-1));
  $('chartTitle').textContent=`${cohort==='external'?'External UMC':'Internal reserve'} · ${metric} (%)`;
  $('metricDefinition').replaceChildren(el('p',definitions[task].description));
  $('chart').replaceChildren(...rows.map(row=>{const value=row[cohort][index];const node=el('div',undefined,'bar-row');const track=el('div',undefined,'track');const bar=el('div',undefined,'bar'+(row.method==='CancerEmbed (Temporal Transformer + SupCon)'?' featured':''));bar.style.width=`${value??0}%`;track.append(bar);node.append(el('span',row.method,'bar-label'),track,el('strong',value===null?'—':value.toFixed(1)));return node;}));
  const thead=el('thead'),head=el('tr');head.append(el('th','Method'),...definitions[task].labels.map(label=>el('th',label+' (%)')));thead.append(head);
  const tbody=el('tbody');rows.forEach(row=>{const tr=el('tr');tr.append(el('td',row.method),...row[cohort].map(value=>el('td',value===null?'—':value.toFixed(1))));tbody.append(tr);});$('resultsTable').replaceChildren(thead,tbody);
  const source=results.sources[group][task];
  $('resultStatus').textContent=`${rows.length} methods · ${cohort==='external'?'53 external patients':'2,286 internal reserve patients'} · Final PDF ${source.label}`;
  $('resultSource').textContent=`Read ${source.label} in the paper ↗`;
  $('resultSource').href=results.source.url+'#page='+source.page;
  $('resultInterpretation').textContent=group==='ablation'?'Table 3 compares metric-learning objectives; its proposed-method rows provide reference points. Main SupCon variants are in Tables 1–2.':'Temporal Transformer + SupCon has the highest reported external H@5 and P@5. SupCon decreases CSA hit rate while modestly increasing its neighborhood precision.';
}
document.querySelectorAll('[data-task]').forEach(button=>button.addEventListener('click',()=>setTask(button.dataset.task)));
$('comparison').addEventListener('change',render);
$('cohort').addEventListener('change',render);$('metric').addEventListener('change',render);
$('downloadResults').disabled=true;
fetch('results.json').then(response=>{if(!response.ok)throw new Error('Results unavailable');return response.json();}).then(data=>{results=data;setTask(task);renderCohorts();$('downloadResults').disabled=false;}).catch(()=>{$('resultStatus').textContent='Results could not be loaded. Serve the website over HTTP or inspect the tables in the linked paper.';});
$('downloadResults').addEventListener('click',()=>{if(!results)return;const cohort=$('cohort').value;const group=$('comparison').value;const source=results.sources[group][task];const lines=[['Method',...definitions[task].labels.map(label=>label+' (%)'),'Cohort','Source'],...results[group][task].map(row=>[row.method,...row[cohort],cohort,source.label])];const csv=lines.map(row=>row.map(value=>'"'+String(value??'').replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=el('a');a.href=url;a.download=`cancerembed-${group}-${task}-${cohort}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('expandFigure').addEventListener('click',()=>$('figureDialog').showModal());$('closeFigure').addEventListener('click',()=>$('figureDialog').close());$('figureDialog').addEventListener('click',event=>{if(event.target===$('figureDialog'))$('figureDialog').close();});
const cancerColors=['#df397f','#29975e','#337eb7','#8057b6','#eaa320'];
function renderCohorts(){
  for(const cohort of ['internal','external']){
    const total=results.cohorts[cohort].reduce((a,b)=>a+b,0);
    $(cohort+'Distribution').replaceChildren(...results.cohorts.labels.map((name,i)=>{
      const count=results.cohorts[cohort][i],percent=count/total*100;
      const row=el('div',undefined,'bar-row');
      const track=el('div',undefined,'track'),bar=el('div',undefined,'bar');
      bar.style.width=percent+'%';bar.style.background=cancerColors[i];track.append(bar);
      row.append(el('span',name+' · '+count.toLocaleString(),'bar-label'),track,el('strong',percent.toFixed(1)+'%'));
      return row;
    }));
  }
}
const embeddingViews={
  all:['embedding-spaces','Figure 2: all four UMAP panels and three held-out patient trajectories.','Internal patients are colored by cancer type; external UMC patients are black. Square = first state; star = complete history.'],
  temporal:['embedding-temporal','Figure 2a: temporal Transformer UMAP.','Temporal Transformer: cancer-structured internal representations before DML. External UMC patients are black.'],
  supcon:['embedding-supcon','Figure 2b: temporal Transformer plus SupCon UMAP.','Temporal Transformer + SupCon: cancer structure remains visible alongside increased local mixing. External UMC patients are black.'],
  csa:['embedding-csa','Figure 2c: CSA UMAP.','CSA: broader, more overlapping cancer-associated regions, alongside strong external retrieval. External UMC patients are black.'],
  'csa-supcon':['embedding-csa-supcon','Figure 2d: CSA plus SupCon UMAP.','CSA + SupCon: increased mixing accompanies higher external P@5 and lower H@5. External UMC patients are black.']
};
document.querySelectorAll('[data-embedding]').forEach(button=>button.addEventListener('click',()=>{
  const [asset,alt,caption]=embeddingViews[button.dataset.embedding];
  $('embeddingImage').src='assets/'+asset+'.png';$('embeddingImage').alt=alt;
  $('embeddingFull').href=$('embeddingImage').getAttribute('src');$('embeddingCaption').textContent=caption;
  document.querySelectorAll('[data-embedding]').forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));});
}));
