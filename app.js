const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const today = new Date(); today.setHours(0,0,0,0);
const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const palette = ['#9588e8','#f0ad8d','#70c6a5','#7eafe7','#d58ebc','#d3b36c'];
const icons = ['✦','⌘','∑','◈','✎','⌁'];
const dateISO = d => { const x=new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
const plusDays = (d,n) => {let x=new Date(d);x.setDate(x.getDate()+n);return x;};
const fmt = d => new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'});
const seed = {
 subjects:[
  {id:1,name:'Mathematics',color:palette[0],topics:['Algebra','Calculus','Trigonometry','Probability'],done:2},
  {id:2,name:'Physics',color:palette[1],topics:['Mechanics','Waves','Electricity','Optics'],done:1},
  {id:3,name:'Computer Science',color:palette[2],topics:['Data structures','Algorithms','DBMS','Networking'],done:3}
 ],
 tasks:[
  {id:1,title:'Practice integration problems',subject:'Mathematics',due:dateISO(plusDays(today,1)),done:false},
  {id:2,title:'Complete mechanics assignment',subject:'Physics',due:dateISO(plusDays(today,2)),done:false},
  {id:3,title:'Revise database normalisation',subject:'Computer Science',due:dateISO(today),done:true}
 ],
 sessions:[
  {id:1,title:'Calculus revision',subject:'Mathematics',date:dateISO(today),time:'09:00',duration:60},
  {id:2,title:'Mechanics practice',subject:'Physics',date:dateISO(today),time:'11:00',duration:45},
  {id:3,title:'DSA problem solving',subject:'Computer Science',date:dateISO(today),time:'16:00',duration:60},
  {id:4,title:'Algebra practice',subject:'Mathematics',date:dateISO(plusDays(today,1)),time:'10:00',duration:60},
  {id:5,title:'Optics notes',subject:'Physics',date:dateISO(plusDays(today,2)),time:'14:00',duration:45}
 ],
 exams:[],
 logs:[]
};
let data;
try { data=JSON.parse(localStorage.getItem('studymateData')) || seed; } catch { data=seed; }
data.subjects.forEach(s=>{if(!Array.isArray(s.completedTopics)){s.completedTopics=(s.topics||[]).slice(0,Number(s.done)||0);}s.done=s.completedTopics.length;});
function save(){data.subjects.forEach(s=>s.done=(s.completedTopics||[]).length);localStorage.setItem('studymateData',JSON.stringify(data));}
function escapeHTML(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2300);}
function subjectColor(name){return data.subjects.find(s=>s.name===name)?.color||palette[4];}
function go(view){$$('.view').forEach(v=>v.classList.toggle('active',v.id===view+'View'));$$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===view));const titles={dashboard:'Good afternoon 👋',subjects:'Your subjects',tasks:'Tasks & assignments',timetable:'Your timetable',reports:'Your progress'};$('#pageTitle').textContent=titles[view];if(view==='reports')renderCharts();if(view==='timetable')renderWeek();}
$$('.nav-link').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.goto)));
$('#todayLabel').textContent=today.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();
$('#datePill').textContent=today.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}).toUpperCase();

function render(){
 renderDashboard();renderSubjects();renderTasks();renderWeek();
}
function renderDashboard(){
 const done=data.tasks.filter(t=>t.done).length,total=data.tasks.length;
 $('#completedStat').innerHTML=`${done}<span>/${total}</span>`;
 $('#taskProgress').style.width=(total?done/total*100:0)+'%';
 const todayMinutes=data.logs.filter(l=>l.date===dateISO(today)).reduce((a,l)=>a+l.minutes,0);
 $('#studyTimeStat').innerHTML=`${(todayMinutes/60).toFixed(todayMinutes%60?1:0)}<span>h</span>`;
 $('#timeProgress').style.width=Math.min(100,todayMinutes/180*100)+'%';
 $('#subjectStat').textContent=data.subjects.length;
 $('#subjectDots').innerHTML=data.subjects.slice(0,6).map(s=>`<i style="background:${s.color}"></i>`).join('');
 const upcoming=data.exams.filter(e=>e.date>=dateISO(today)).sort((a,b)=>a.date.localeCompare(b.date))[0];
 $('#examStat').textContent=upcoming?`${Math.ceil((new Date(upcoming.date)-today)/86400000)}d`:'—';
 $('#examName').textContent=upcoming?escapeHTML(upcoming.name):'Add an exam date';
 $('#examDays').textContent=upcoming?Math.ceil((new Date(upcoming.date)-today)/86400000):'—';
 const sessions=data.sessions.filter(s=>s.date===dateISO(today)).sort((a,b)=>a.time.localeCompare(b.time));
 $('#todaySchedule').innerHTML=sessions.length?sessions.map(s=>`<div class="schedule-item"><div class="schedule-time">${s.time}</div><div class="schedule-color" style="background:${subjectColor(s.subject)}"></div><div class="schedule-info"><b>${escapeHTML(s.title)}</b><small>${escapeHTML(s.subject)} · ${s.duration} min</small></div><span class="schedule-tag">${s.duration} min</span></div>`).join(''):'<div class="empty-state">No study sessions planned for today. Add one in your timetable.</div>';
 const tasks=data.tasks.filter(t=>!t.done).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,4);
 $('#upcomingTasks').innerHTML=tasks.length?tasks.map(t=>`<div class="deadline-item"><div class="deadline-icon">✓</div><div><b>${escapeHTML(t.title)}</b><small>${escapeHTML(t.subject)}</small></div><span class="deadline-date">${fmt(t.due)}</span></div>`).join(''):'<div class="empty-state">All caught up. Add a task when you need one.</div>';
 $('#dashboardSubjects').innerHTML=data.subjects.length?data.subjects.map(s=>{s.done=(s.completedTopics||[]).length;let p=s.topics.length?Math.round(s.done/s.topics.length*100):0;return `<div class="progress-row"><div class="progress-label"><b>${escapeHTML(s.name)}</b><span>${s.done}/${s.topics.length} topics · ${p}%</span></div><div class="progress-track"><i style="width:${p}%;background:${s.color}"></i></div></div>`}).join(''):'<div class="empty-state">Add your first subject to track progress.</div>';
}
function renderSubjects(){
 $('#subjectGrid').innerHTML=data.subjects.length?data.subjects.map((s,i)=>{s.done=(s.completedTopics||[]).length;let p=s.topics.length?Math.round(s.done/s.topics.length*100):0;return `<article class="subject-card"><div class="subject-card-top"><div class="subject-symbol" style="background:${s.color}22;color:${s.color}">${icons[i%icons.length]}</div><button class="text-btn" data-topic="${s.id}">＋ Topic</button></div><h4>${escapeHTML(s.name)}</h4><p>${s.topics.length} topics · ${s.done} completed</p><div class="progress-row"><div class="progress-label"><b>Course progress</b><span>${p}%</span></div><div class="progress-track"><i style="width:${p}%;background:${s.color}"></i></div></div><div class="subject-topics">${s.topics.map((t,j)=>`<label style="margin-right:9px;display:inline-flex;gap:4px;align-items:center"><input type="checkbox" data-topic-check="${s.id}|${j}" ${(s.completedTopics||[]).includes(t)?'checked':''}>${escapeHTML(t)}</label>`).join('')}</div></article>`}).join(''):'<div class="empty-state">No subjects yet. Add a subject to get started.</div>';
 $$('[data-topic]').forEach(b=>b.onclick=()=>openModal('topic',Number(b.dataset.topic)));
 $$('[data-topic-check]').forEach(c=>c.onchange=()=>{let [sid,idx]=c.dataset.topicCheck.split('|').map(Number),s=data.subjects.find(x=>x.id===sid),topic=s?.topics[idx];if(!s||!topic)return;s.completedTopics=s.completedTopics||[];if(c.checked&&!s.completedTopics.includes(topic))s.completedTopics.push(topic);if(!c.checked)s.completedTopics=s.completedTopics.filter(x=>x!==topic);s.done=s.completedTopics.length;save();render();});
}
let currentFilter='all';
function renderTasks(){
 let tasks=data.tasks.filter(t=>currentFilter==='all'||(currentFilter==='done'?t.done:!t.done)).sort((a,b)=>a.due.localeCompare(b.due));
 $('#taskList').innerHTML=tasks.length?tasks.map(t=>`<div class="task-row"><div class="task-name"><input class="task-check" type="checkbox" data-task="${t.id}" ${t.done?'checked':''}><div><b>${escapeHTML(t.title)}</b><small>${t.done?'Completed':'Assignment / study task'}</small></div></div><span class="task-subject">${escapeHTML(t.subject)}</span><span class="task-due">${fmt(t.due)}</span><span class="status ${t.done?'done':''}">${t.done?'Completed':'Pending'}</span></div>`).join(''):'<div class="empty-state">Nothing to show here yet.</div>';
 $$('[data-task]').forEach(c=>c.onchange=()=>{let t=data.tasks.find(x=>x.id===Number(c.dataset.task));t.done=c.checked;save();render();toast(t.done?'Task completed — nice work!':'Task moved to pending');});
}
$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');currentFilter=b.dataset.filter;renderTasks();});
function renderWeek(){
 const start=plusDays(today,-today.getDay());
 $('#weekGrid').innerHTML=Array.from({length:7},(_,i)=>{let d=plusDays(start,i),iso=dateISO(d),sessions=data.sessions.filter(s=>s.date===iso).sort((a,b)=>a.time.localeCompare(b.time));return `<div class="day-col ${iso===dateISO(today)?'today':''}"><div class="day-name">${dayNames[d.getDay()]}</div><div class="day-number">${d.getDate()}</div>${sessions.map(s=>`<div class="session-chip" style="background:${subjectColor(s.subject)}22;color:#59517f">${escapeHTML(s.title)}<small>${s.time} · ${s.duration}m</small></div>`).join('')||'<div style="text-align:center;color:#c0c0ce;font-size:9px">—</div>'}</div>`}).join('');
}
let hoursChart,taskChart;
function renderCharts(){
 const labels=Array.from({length:7},(_,i)=>dayNames[plusDays(today,i-6).getDay()]);
 const values=Array.from({length:7},(_,i)=>{let d=dateISO(plusDays(today,i-6));return data.logs.filter(l=>l.date===d).reduce((a,l)=>a+l.minutes,0)/60;});
 const done=data.tasks.filter(t=>t.done).length,pending=data.tasks.length-done;
 if(hoursChart)hoursChart.destroy();if(taskChart)taskChart.destroy();
 hoursChart=new Chart($('#hoursChart'),{type:'bar',data:{labels,datasets:[{data:values,backgroundColor:'#9b8eed',borderRadius:6,maxBarThickness:27}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'#a1a2b1',font:{size:10}}},y:{beginAtZero:true,grid:{color:'#f1f0f6'},ticks:{color:'#a1a2b1',font:{size:9}}}}}});
 taskChart=new Chart($('#taskChart'),{type:'doughnut',data:{labels:['Completed','Pending'],datasets:[{data:[done,pending],backgroundColor:['#8d7ce5','#f0b18e'],borderWidth:0,hoverOffset:4}]},options:{cutout:'72%',plugins:{legend:{display:false}}}});
 const total=data.logs.reduce((a,l)=>a+l.minutes,0);$('#totalHours').textContent=(total/60).toFixed(1)+'h';$('#reportCompleted').textContent=done;$('#topicsCovered').textContent=data.subjects.reduce((a,s)=>a+s.done,0);$('#completionRate').textContent=(data.tasks.length?Math.round(done/data.tasks.length*100):0)+'%';
}
const backdrop=$('#modalBackdrop'),form=$('#itemForm'),fields=$('#modalFields');let modalType='',modalSubject=null;
function field(label,name,type='text',value='',opts='',required=true){return `<div class="field"><label>${label}</label>${type==='select'?`<select name="${name}" ${required?'required':''}>${opts}</select>`:`<input name="${name}" type="${type}" value="${value}" ${required?'required':''}>`}</div>`}
function openModal(type,subjectId=null){
 modalType=type;modalSubject=subjectId;let title='',html='';
 if(type==='subject'){title='Add a subject';html=field('Subject name','name')+field('Exam date (optional)','exam','date','','',false);}
 if(type==='task'){title='Add a task or assignment';html=(data.subjects.length?'': '<p class="empty-state">Tip: add a subject first so you can organise this task.</p>')+field('Task title','title')+`<div class="form-grid">${field('Subject','subject','select','','<option value="">Choose subject</option>'+data.subjects.map(s=>`<option>${escapeHTML(s.name)}</option>`).join(''))}${field('Due date','due','date',dateISO(today))}</div>`;}
 if(type==='session'){title='Plan a study session';html=(data.subjects.length?'': '<p class="empty-state">Tip: add a subject first so you can organise this session.</p>')+field('Session title','title')+`<div class="form-grid">${field('Subject','subject','select','','<option value="">Choose subject</option>'+data.subjects.map(s=>`<option>${escapeHTML(s.name)}</option>`).join(''))}${field('Date','date','date',dateISO(today))}</div><div class="form-grid">${field('Start time','time','time','09:00')}${field('Duration (minutes)','duration','number','45')}</div>`;}
 if(type==='topic'){title='Add a topic';html=field('Topic name','topic');}
 $('#modalTitle').textContent=title;fields.innerHTML=html;backdrop.classList.add('show');
}
function closeModal(){backdrop.classList.remove('show');form.reset();}
backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&backdrop.classList.contains('show'))closeModal();});
$('#modalClose').onclick=$('#cancelModal').onclick=closeModal;
$('#addSubjectBtn').onclick=()=>openModal('subject');$('#addTaskBtn').onclick=$('#quickAdd').onclick=()=>openModal('task');$('#addSessionBtn').onclick=()=>openModal('session');
form.onsubmit=e=>{e.preventDefault();let f=Object.fromEntries(new FormData(form).entries());
 if(modalType==='subject'){if(!f.name.trim())return;let s={id:Date.now(),name:f.name.trim(),color:palette[data.subjects.length%palette.length],topics:[],done:0};data.subjects.push(s);if(f.exam)data.exams.push({id:Date.now()+1,name:s.name+' exam',date:f.exam});}
 if(modalType==='task')data.tasks.push({id:Date.now(),title:f.title,subject:f.subject,due:f.due,done:false});
 if(modalType==='session')data.sessions.push({id:Date.now(),title:f.title,subject:f.subject,date:f.date,time:f.time,duration:Number(f.duration)});
 if(modalType==='topic'){let s=data.subjects.find(x=>x.id===modalSubject);if(s)s.topics.push(f.topic);}
 save();closeModal();render();toast('Saved to your StudyMate planner');};
$('#notificationBtn').onclick=()=>{let due=data.tasks.filter(t=>!t.done&&t.due<=dateISO(plusDays(today,1)));toast(due.length?`${due.length} task(s) due today or tomorrow`:'You’re all clear — no urgent deadlines!');};

let timerSeconds=25*60,timerTotal=25*60,timerInterval=null,timerRunning=false,timerKind='focus';
function updateTimer(){let m=Math.floor(timerSeconds/60),s=timerSeconds%60;$('#timerDisplay').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;let deg=(1-timerSeconds/timerTotal)*360;$('#timerRing').style.background=`conic-gradient(#8878ed ${deg}deg,#e9e6fb ${deg}deg)`;}
function pauseTimer(){clearInterval(timerInterval);timerRunning=false;$('#timerStart').textContent='Resume focus';}
$('#timerStart').onclick=()=>{if(timerRunning){pauseTimer();return;}timerRunning=true;$('#timerStart').textContent='Pause';timerInterval=setInterval(()=>{timerSeconds--;updateTimer();if(timerSeconds<=0){pauseTimer();if(timerKind==='focus'){data.logs.push({date:dateISO(today),minutes:timerTotal/60});save();renderDashboard();toast('Focus session complete — take a break!');}else toast('Break complete — ready to focus?');}},1000);};
$('#timerReset').onclick=()=>{pauseTimer();timerSeconds=timerTotal;$('#timerStart').textContent='Start focus';updateTimer();};
$$('.mode').forEach(b=>b.onclick=()=>{$$('.mode').forEach(x=>x.classList.remove('active'));b.classList.add('active');pauseTimer();timerKind=b.dataset.mode;timerTotal=Number(b.dataset.minutes)*60;timerSeconds=timerTotal;$('#timerMode').textContent=timerKind==='focus'?'FOCUS SESSION':timerKind==='short'?'SHORT BREAK':'LONG BREAK';$('#timerStart').textContent='Start focus';updateTimer();});
updateTimer();render();