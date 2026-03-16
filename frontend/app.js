/* THREE.JS STARTUP ANIMATION */
(function(){
  const cv=document.getElementById('tc');
  const W=innerWidth,H=innerHeight;
  cv.width=W;cv.height=H;
  const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  R.setSize(W,H);R.setPixelRatio(Math.min(devicePixelRatio,2));
  R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
  R.toneMapping=THREE.ReinhardToneMapping;R.toneMappingExposure=1.5;
  const S=new THREE.Scene();
  S.fog=new THREE.FogExp2(0x000000,0.032);
  const cam=new THREE.PerspectiveCamera(58,W/H,0.1,200);
  cam.position.set(0,4,20);cam.lookAt(0,0,0);

  // Lights
  S.add(new THREE.AmbientLight(0x0a0a1a,0.6));
  const gl=new THREE.PointLight(0xf5c842,0,35);gl.position.set(0,4,6);gl.castShadow=true;S.add(gl);
  const rl1=new THREE.DirectionalLight(0xf5c842,0);rl1.position.set(-10,8,3);S.add(rl1);
  const rl2=new THREE.DirectionalLight(0x6633ff,0);rl2.position.set(10,-5,-4);S.add(rl2);
  const fl=new THREE.PointLight(0xffffff,0,25);fl.position.set(0,-6,10);S.add(fl);

  // Keyboard key geometry
  const kg=new THREE.BoxGeometry(1.35,0.36,1.35);
  const baseMat=()=>new THREE.MeshStandardMaterial({color:0x16161e,metalness:.82,roughness:.18});
  const glowMat=()=>new THREE.MeshStandardMaterial({color:0x1c1608,metalness:.7,roughness:.12,emissive:new THREE.Color(0xf5c842),emissiveIntensity:0});

  const rows=[
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M']
  ];
  const keys=[];const kg2=new THREE.Group();S.add(kg2);
  const glowKeys=['E','C','H','T','Y'];

  rows.forEach((row,ri)=>{
    row.forEach((ch,ci)=>{
      const isGlow=glowKeys.includes(ch);
      const m=isGlow?glowMat():baseMat();
      const mesh=new THREE.Mesh(kg,m);
      const tx=(ci-row.length/2+.5)*1.52-(ri*.3);
      const ty=-ri*1.52;
      const ang=Math.random()*Math.PI*2;
      const rad=14+Math.random()*9;
      mesh.position.set(Math.cos(ang)*rad,Math.sin(ang)*rad+(Math.random()-.5)*6,(Math.random()-.5)*22-8);
      mesh.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
      mesh.castShadow=true;
      keys.push({mesh,tx,ty,tz:0,sx:mesh.position.x,sy:mesh.position.y,sz:mesh.position.z,delay:.08+Math.random()*.45,isGlow});
      kg2.add(mesh);
    });
  });
  kg2.position.set(.3,1.1,0);

  // Particles
  const PC=600;const PP=new Float32Array(PC*3);const PV=[];
  for(let i=0;i<PC;i++){
    const r=14+Math.random()*12,t=Math.random()*Math.PI*2,p=Math.random()*Math.PI;
    PP[i*3]=r*Math.sin(p)*Math.cos(t);PP[i*3+1]=r*Math.sin(p)*Math.sin(t);PP[i*3+2]=r*Math.cos(p);
    PV.push(new THREE.Vector3((Math.random()-.5)*.022,(Math.random()-.5)*.022,(Math.random()-.5)*.022));
  }
  const PG=new THREE.BufferGeometry();PG.setAttribute('position',new THREE.BufferAttribute(PP,3));
  const PM=new THREE.PointsMaterial({color:0xf5c842,size:.09,transparent:true,opacity:0,sizeAttenuation:true,blending:THREE.AdditiveBlending});
  S.add(new THREE.Points(PG,PM));

  // Torus rings
  const mkRing=(r,t,c,op)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,128),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,blending:THREE.AdditiveBlending}));return m;};
  const ring1=mkRing(5.8,.025,0xf5c842,0);ring1.rotation.x=Math.PI/2;S.add(ring1);
  const ring2=mkRing(7.5,.018,0x7744ff,0);ring2.rotation.x=Math.PI/2.2;ring2.rotation.y=Math.PI/5;S.add(ring2);
  const ring3=mkRing(4.2,.015,0xffffff,0);ring3.rotation.x=Math.PI/3;ring3.rotation.z=Math.PI/4;S.add(ring3);

  // Ground mirror
  const gm=new THREE.Mesh(new THREE.PlaneGeometry(32,32),new THREE.MeshStandardMaterial({color:0x000000,metalness:1,roughness:.05,transparent:true,opacity:0}));
  gm.rotation.x=-Math.PI/2;gm.position.y=-3.5;gm.receiveShadow=true;S.add(gm);

  function eob(t){return t===1?1:1-Math.pow(2,-10*t)}
  function eback(t){const c=1.70158,c3=c+1;return 1+c3*Math.pow(t-1,3)+c*Math.pow(t-1,2)}
  function eioc(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function lerp(a,b,t){return a+(b-a)*t}
  function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v))}

  let t0=null,done=false;
  function frame(ts){
    if(done)return;
    requestAnimationFrame(frame);
    if(!t0)t0=ts;
    const T=(ts-t0)/1000;

    // Particles
    PM.opacity=clamp(T/.28,0,1)*.65;
    for(let i=0;i<PC;i++){PP[i*3]+=PV[i].x;PP[i*3+1]+=PV[i].y;PP[i*3+2]+=PV[i].z;PP[i*3]*=.9996;PP[i*3+1]*=.9996;PP[i*3+2]*=.9996;}
    PG.attributes.position.needsUpdate=true;

    // Keys fly in
    keys.forEach(k=>{
      const kt=clamp((T-k.delay)/.62,0,1);const e=eback(kt);
      k.mesh.position.set(lerp(k.sx,k.tx,e),lerp(k.sy,k.ty,e),lerp(k.sz,k.tz,e));
      const re=eob(kt);
      k.mesh.rotation.x+=(-.22-k.mesh.rotation.x)*re*.14;
      k.mesh.rotation.y+=(0-k.mesh.rotation.y)*re*.14;
      k.mesh.rotation.z+=(0-k.mesh.rotation.z)*re*.14;
      if(k.isGlow&&kt>.82){
        const pulse=(Math.sin(T*5)+1)*.5;
        k.mesh.material.emissiveIntensity=lerp(0,.35+pulse*.18,(kt-.82)*5.5);
      }
    });

    // Lights
    const lt=clamp((T-.38)/.75,0,1);
    gl.intensity=lerp(0,5,eob(lt));rl1.intensity=lerp(0,1.8,eob(lt));rl2.intensity=lerp(0,1,eob(lt));fl.intensity=lerp(0,2,eob(lt));

    // Rings
    const rt=clamp((T-.48)/.75,0,1);
    ring1.material.opacity=rt*.42;ring2.material.opacity=rt*.22;ring3.material.opacity=rt*.15;
    ring1.rotation.z=T*.32;ring2.rotation.y=-T*.22;ring3.rotation.x+=.008;
    const rs=eback(Math.min(rt*1.4,1));
    ring1.scale.setScalar(lerp(.4,1,rs));ring2.scale.setScalar(lerp(.4,1,rs));ring3.scale.setScalar(lerp(.3,1,rs));
    gm.material.opacity=rt*.2;

    // Camera arc: start right/high, sweep to straight-on
    const ct=clamp(T/1.9,0,1),ce=eioc(ct);
    const ca=lerp(.75,0,ce),cr=lerp(24,17,ce),ch=lerp(7,3.8,ce);
    cam.position.set(Math.sin(ca)*cr,ch,Math.cos(ca)*cr);
    cam.lookAt(0,.6,0);

    // Keyboard tilt
    kg2.rotation.x=lerp(.28,-.18,eob(clamp((T-.28)/.85,0,1)));

    // Final flash
    if(T>1.72){const ft=clamp((T-1.72)/.3,0,1);gl.intensity=lerp(5,14,ft);ring1.material.opacity=lerp(.42,0,ft);ring2.material.opacity=lerp(.22,0,ft);ring3.material.opacity=lerp(.15,0,ft);}

    R.render(S,cam);
    if(T>=2.08&&!done){done=true;transition();}
  }

  function transition(){
    const su=document.getElementById('startup');
    su.classList.add('out');
    document.getElementById('app').classList.add('vis');
    setTimeout(()=>{su.classList.add('off');R.dispose();},750);
  }
  requestAnimationFrame(frame);
  addEventListener('resize',()=>{const nW=innerWidth,nH=innerHeight;cam.aspect=nW/nH;cam.updateProjectionMatrix();R.setSize(nW,nH);});
})();

/* AMBIENT PARTICLES */
(function(){
  const cv=document.getElementById('cvs'),ctx=cv.getContext('2d');
  let W,H,P=[];
  const rs=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};rs();addEventListener('resize',rs);
  for(let i=0;i<55;i++)P.push({x:Math.random()*1600,y:Math.random()*1000,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,r:Math.random()*1.4+.3,o:Math.random()*.25+.05});
  const frame=()=>{
    ctx.clearRect(0,0,W,H);
    P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(245,200,66,${p.o})`;ctx.fill();});
    P.forEach((a,i)=>P.slice(i+1).forEach(b=>{const dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);if(d<90){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(245,200,66,${(1-d/90)*.055})`;ctx.lineWidth=.5;ctx.stroke();}}));
    requestAnimationFrame(frame);
  };frame();
})();

/* RIPPLE */
document.querySelectorAll('.tbtn').forEach(b=>b.addEventListener('click',function(e){const r=document.createElement('span');r.className='rpl';const rc=b.getBoundingClientRect(),sz=Math.max(rc.width,rc.height);r.style.cssText=`width:${sz}px;height:${sz}px;left:${e.clientX-rc.left-sz/2}px;top:${e.clientY-rc.top-sz/2}px`;b.appendChild(r);setTimeout(()=>r.remove(),500);}));

/* TYPING APP */
const WP="the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most great need large often hand high place world still own life few move live keep leave put while seem turn play change off face point never where whole number family system early free real fact body music light voice power town fine drive short road cut stop form under last reach once book late miss idea eat run close strong easy hard open left right size fast slow kind show both hold step".split(" ").filter((w,i,a)=>a.indexOf(w)===i&&w.length>1);
const QS=["The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.","In the middle of difficulty lies opportunity. The measure of intelligence is the ability to change.","Life is what happens when you're busy making other plans. All you need is love.","It does not matter how slowly you go as long as you do not stop. Everything has beauty.","The greatest glory in living lies not in never falling but in rising every time we fall.","The future belongs to those who believe in the beauty of their dreams and work toward them every day.","Spread love everywhere you go. Let no one ever come to you without leaving happier than before.","Success is not final, failure is not fatal. It is the courage to continue that counts.","Believe you can and you're halfway there. The only limit to our realization will be our doubts.","Your time is limited so don't waste it living someone else's life. Stay hungry. Stay foolish."];
const getDQ=()=>{const d=new Date();return QS[(d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate())%QS.length]};
let S={mode:'time',to:30,wo:25,words:[],started:false,finished:false,startTime:null,tLeft:30,tIv:null,wIv:null,cIv:null,wi:0,ci:0,cor:0,wrg:0,tot:0,wHist:[],kF:{},kE:{},punct:false,nums:false};
let C={sound:false,caret:true};let RC=null;
let ax=null;function pk(ok){if(!C.sound)return;try{if(!ax)ax=new(window.AudioContext||window.webkitAudioContext)();const o=ax.createOscillator(),g=ax.createGain();o.connect(g);g.connect(ax.destination);o.frequency.value=ok?680:220;o.type='sine';g.gain.setValueAtTime(.04,ax.currentTime);g.gain.exponentialRampToValueAtTime(.001,ax.currentTime+.06);o.start();o.stop(ax.currentTime+.06);}catch(e){}}
function genW(n=100){const out=[];for(let i=0;i<n;i++){let w=WP[~~(Math.random()*WP.length)];if(S.nums&&Math.random()<.12)w=''+~~(Math.random()*100);if(S.punct&&i>0&&Math.random()<.18)out[out.length-1]+=['.',',','!','?',';'][~~(Math.random()*5)];out.push(w);}return out;}
function init(){killIv();S.started=false;S.finished=false;S.wi=0;S.ci=0;S.cor=0;S.wrg=0;S.tot=0;S.wHist=[];S.kF={};S.kE={};S.tLeft=S.to;if(S.mode==='time')S.words=genW(130);else if(S.mode==='words')S.words=genW(S.wo);else if(S.mode==='quote')S.words=QS[~~(Math.random()*QS.length)].split(' ');else if(S.mode==='daily')S.words=getDQ().split(' ');hideSc('rs');hideSc('hs');document.getElementById('tsec').style.display='block';renderW();syncSt();updT();document.getElementById('sv1').classList.remove('live');document.getElementById('sv1').textContent='--';document.getElementById('sv2').textContent='--';document.getElementById('tval').classList.remove('dng');document.getElementById('pgf').style.width='0%';document.getElementById('fov').classList.remove('g');document.getElementById('wd').classList.remove('act');document.getElementById('cwarn').classList.remove('on');setTimeout(foc,80);}
function renderW(){const el=document.getElementById('wd');[...el.children].forEach(c=>{if(!c.id&&!c.classList.contains('caret'))c.remove()});let car=el.querySelector('.caret');if(car)car.remove();S.words.forEach((word,wi)=>{const wd=document.createElement('span');wd.className='wr';wd.dataset.wi=wi;[...word].forEach((ch,ci)=>{const s=document.createElement('span');s.className='ch';s.dataset.wi=wi;s.dataset.ci=ci;s.textContent=ch;wd.appendChild(s);});const sp=document.createElement('span');sp.className='ch spc';sp.dataset.wi=wi;sp.dataset.ci=word.length;sp.innerHTML='&nbsp;';wd.appendChild(sp);el.appendChild(wd);});car=document.createElement('div');car.className='caret';el.appendChild(car);posCaret(0,0);}
function posCaret(wi,ci){if(!C.caret)return;const el=document.getElementById('wd');const car=el.querySelector('.caret');if(!car)return;const wd=el.querySelector(`.wr[data-wi="${wi}"]`);if(!wd)return;const ch=wd.querySelector(`.ch[data-ci="${ci}"]`)||wd.lastElementChild;if(!ch)return;const er=el.getBoundingClientRect(),cr=ch.getBoundingClientRect();car.style.left=(cr.left-er.left+el.scrollLeft)+'px';car.style.top=(cr.top-er.top+el.scrollTop)+'px';car.style.height=cr.height+'px';}
function scrollW(){const el=document.getElementById('wd');const wd=el.querySelector(`.wr[data-wi="${S.wi}"]`);if(!wd)return;const er=el.getBoundingClientRect(),wr=wd.getBoundingClientRect();const rt=wr.top-er.top+el.scrollTop;if(rt>er.height*.5)el.scrollTo({top:rt-er.height*.28,behavior:'smooth'});}
const hi=document.getElementById('hi');
hi.addEventListener('keydown',e=>{if(S.finished)return;if(e.key==='Tab'){e.preventDefault();return}if(e.key==='Escape'){e.preventDefault();goHome();return}if(e.key==='Backspace'){e.preventDefault();doBk();return}if(e.getModifierState)document.getElementById('cwarn').classList.toggle('on',e.getModifierState('CapsLock'));if(!S.started&&e.key.length===1)startT();});
hi.addEventListener('input',e=>{if(S.finished)return;const v=hi.value;hi.value='';if(!v)return;const ch=v[v.length-1];if(ch===' ')advW();else typeC(ch);});
function typeC(ch){const wi=S.wi,ci=S.ci,word=S.words[wi];if(!word)return;S.tot++;S.kF[ch]=(S.kF[ch]||0)+1;const el=document.getElementById('wd');const wd=el.querySelector(`.wr[data-wi="${wi}"]`);if(!wd)return;const ok=ch===word[ci];if(ci<word.length){const c=wd.querySelector(`.ch[data-ci="${ci}"]`);c.classList.add(ok?'ok':'ng');if(ok)S.cor++;else{S.wrg++;S.kE[ch]=(S.kE[ch]||0)+1;}}else{const ex=document.createElement('span');ex.className='ch ex';ex.textContent=ch;ex.dataset.wi=wi;ex.dataset.ci=ci;wd.insertBefore(ex,wd.querySelector('.spc'));S.wrg++;}pk(ok);S.ci++;posCaret(wi,S.ci);const car=el.querySelector('.caret');if(car){car.classList.add('typ');clearTimeout(car._t);car._t=setTimeout(()=>car.classList.remove('typ'),800);}syncSt();syncPg();}
function advW(){const wi=S.wi,word=S.words[wi];const el=document.getElementById('wd');const wd=el.querySelector(`.wr[data-wi="${wi}"]`);if(wd)for(let ci=S.ci;ci<word.length;ci++){const c=wd.querySelector(`.ch[data-ci="${ci}"]`);if(c&&!c.classList.contains('ok')&&!c.classList.contains('ng')){c.classList.add('ng');S.wrg++;}}S.wi++;S.ci=0;scrollW();posCaret(S.wi,0);syncSt();syncPg();if(S.mode!=='time'&&S.wi>=S.words.length)finish();}
function doBk(){if(S.ci>0){S.ci--;const el=document.getElementById('wd');const wd=el.querySelector(`.wr[data-wi="${S.wi}"]`);if(wd){const c=wd.querySelector(`.ch[data-ci="${S.ci}"]`);if(c){if(c.classList.contains('ok'))S.cor--;if(c.classList.contains('ng'))S.wrg--;c.classList.remove('ok','ng');if(c.classList.contains('ex'))c.remove();}S.tot=Math.max(0,S.tot-1);}posCaret(S.wi,S.ci);syncSt();}}
function startT(){S.started=true;S.startTime=Date.now();document.getElementById('fov').classList.add('g');document.getElementById('wd').classList.add('act');document.getElementById('sv1').classList.add('live');if(S.mode==='time')S.tIv=setInterval(tick,1000);S.wIv=setInterval(liveWpm,500);if(S.mode!=='time')S.cIv=setInterval(updT,1000);}
function tick(){S.tLeft--;updT();if(S.tLeft<=5)document.getElementById('tval').classList.add('dng');if(S.tLeft<=0)finish();}
function liveWpm(){if(!S.started||S.finished)return;const min=(Date.now()-S.startTime)/60000;if(min<.01)return;const w=Math.round((S.cor/5)/min);animV('sv1',w);S.wHist.push({t:Math.round(min*60),wpm:w});if(S.mode!=='time')updT();}
function updT(){const el=document.getElementById('tval');if(S.mode==='time'){el.textContent=S.tLeft;}else if(S.started&&S.startTime){const s=Math.floor((Date.now()-S.startTime)/1000);el.textContent=s<60?s+'s':Math.floor(s/60)+':'+(s%60).toString().padStart(2,'0');}else el.textContent=S.mode==='words'?S.wo+'w':'--';}
function syncSt(){const t=S.cor+S.wrg,acc=t>0?Math.round((S.cor/t)*100):0;if(S.started)animV('sv2',acc+'%');document.getElementById('sv3').textContent=S.cor;document.getElementById('sv4').textContent=S.wrg;}
function animV(id,val){const el=document.getElementById(id);if(el.textContent===String(val))return;el.textContent=val;el.classList.remove('flip');void el.offsetWidth;el.classList.add('flip');}
function syncPg(){let p=0;if(S.mode==='time')p=((S.to-S.tLeft)/S.to)*100;else p=(S.wi/S.words.length)*100;document.getElementById('pgf').style.width=Math.min(100,p)+'%';}
function killIv(){clearInterval(S.tIv);clearInterval(S.wIv);clearInterval(S.cIv);S.tIv=S.wIv=S.cIv=null;}
function finish(){if(S.finished)return;S.finished=true;killIv();document.getElementById('pgf').style.width='100%';const el=Date.now()-S.startTime;const sec=S.started?el/1000:S.to;const min=sec/60;const wpm=Math.round((S.cor/5)/Math.max(min,.001));const raw=Math.round((S.tot/5)/Math.max(min,.001));const t=S.cor+S.wrg;const acc=t>0?Math.round((S.cor/t)*100):100;animCtr('rwpm',wpm,800);document.getElementById('racc').textContent=acc+'%';document.getElementById('rraw').textContent=raw;document.getElementById('rch').textContent=S.tot;document.getElementById('rcor').textContent=S.cor;document.getElementById('rerr').textContent=S.wrg;document.getElementById('rtm').textContent=Math.round(sec)+'s';document.getElementById('tsec').style.display='none';showSc('rs');renderChart();saveH({wpm,acc,errors:S.wrg,chars:S.tot,time:Math.round(sec),mode:S.mode});}
function animCtr(id,target,dur=700){const el=document.getElementById(id);const st=Date.now();const tick=()=>{const p=Math.min(1,(Date.now()-st)/dur);const e=1-Math.pow(1-p,4);el.textContent=Math.round(e*target);if(p<1)requestAnimationFrame(tick);else el.textContent=target;};tick();}
function renderChart(){if(RC){RC.destroy();RC=null;}const ctx2=document.getElementById('rcht').getContext('2d');let data=S.wHist;if(data.length<2){const w=parseInt(document.getElementById('rwpm').textContent)||0,t=S.started?Math.round((Date.now()-S.startTime)/1000):S.to;data=[{t:0,wpm:0},{t,wpm:w}];}RC=new Chart(ctx2,{type:'line',data:{labels:data.map(d=>d.t+'s'),datasets:[{label:'WPM',data:data.map(d=>d.wpm),borderColor:'#f5c842',backgroundColor:(c)=>{const g=c.chart.ctx.createLinearGradient(0,0,0,150);g.addColorStop(0,'rgba(245,200,66,.22)');g.addColorStop(1,'rgba(245,200,66,0)');return g;},borderWidth:2,pointBackgroundColor:'#f5c842',pointRadius:3,pointHoverRadius:5,tension:.45,fill:true}]},options:{responsive:true,maintainAspectRatio:false,animation:{duration:900,easing:'easeOutQuart'},plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(14,14,18,.97)',titleColor:'rgba(232,232,240,.4)',bodyColor:'#f5c842',borderColor:'rgba(255,255,255,.08)',borderWidth:1,padding:10,cornerRadius:8}},scales:{x:{ticks:{color:'rgba(232,232,240,.22)',font:{family:'JetBrains Mono',size:10}},grid:{color:'rgba(255,255,255,.04)'}},y:{ticks:{color:'rgba(232,232,240,.22)',font:{family:'JetBrains Mono',size:10}},grid:{color:'rgba(255,255,255,.04)'},beginAtZero:true}}}});}
function saveH(e){try{let h=JSON.parse(localStorage.getItem('et3'))||[];h.unshift({...e,date:new Date().toISOString()});if(h.length>100)h=h.slice(0,100);localStorage.setItem('et3',JSON.stringify(h));}catch(_){}}
function setMode(m,btn){S.mode=m;document.querySelectorAll('.tbtn[data-mode]').forEach(b=>b.classList.remove('on'));btn.classList.add('on');document.getElementById('topts').style.display=m==='time'?'flex':'none';document.getElementById('wopts').style.display=m==='words'?'flex':'none';document.getElementById('cwrap').classList.toggle('on',m==='custom');document.getElementById('dtag').classList.toggle('on',m==='daily');if(m!=='custom')init();}
function setTO(t,btn){S.to=t;document.querySelectorAll('#topts .tbtn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');init();}
function setWO(w,btn){S.wo=w;document.querySelectorAll('#wopts .tbtn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');init();}
function togOpt(k,btn){S[k]=!S[k];btn.classList.toggle('on',S[k]);init();}
function applyCustom(){const tx=document.getElementById('cta').value.trim();if(!tx)return;S.words=tx.split(/\s+/).filter(Boolean);document.getElementById('cwrap').classList.remove('on');init();}
function showSc(id){document.getElementById(id).classList.add('on')}
function hideSc(id){document.getElementById(id).classList.remove('on')}
function restart(){init()}function newT(){S.words=[];init()}
function goHome(){killIv();hideSc('rs');hideSc('hs');document.getElementById('tsec').style.display='block';init();}
function foc(){hi.focus();document.getElementById('wd').classList.add('act')}
const KB=[['`','1','2','3','4','5','6','7','8','9','0','-','='],['q','w','e','r','t','y','u','i','o','p','[',']','\\'],['a','s','d','f','g','h','j','k','l',';',"'"],['z','x','c','v','b','n','m',',','.','/'],['  ']];
function buildKB(){const el=document.getElementById('kbrd');el.innerHTML='';KB.forEach((row,ri)=>{const r=document.createElement('div');r.className='krow';row.forEach((k,ki)=>{const ke=document.createElement('div');const tr=k.trim();let cls='key';if(!tr)cls+=' ksp';else if(k==='\\')cls+=' kw2';ke.className=cls;ke.dataset.k=tr||' ';ke.textContent=!tr?'space':k;ke.style.animationDelay=(ri*row.length+ki)*.012+'s';r.appendChild(ke);});el.appendChild(r);});}
function applyHM(){const f=S.kF,e=S.kE,mx=Math.max(...Object.values(f),1);document.querySelectorAll('.key').forEach(el=>{const k=el.dataset.k,fr=(f[k]||0)/mx;if(fr>0){const R2=Math.round(245*fr),G=Math.round(200*fr),B=Math.round(66*fr);el.style.background=`rgba(${R2},${G},${B},${fr*.8+.1})`;el.style.color=fr>.55?'#0c0c0f':'var(--tx)';el.style.borderColor=`rgba(245,200,66,${fr*.6})`;el.style.boxShadow=fr>.3?`0 0 ${fr*14}px rgba(245,200,66,${fr*.28})`:'';} const er=e[k]||0;if(er>0){const es=document.createElement('span');es.style.cssText='position:absolute;top:1px;right:2px;font-size:7px;color:var(--re);font-family:var(--fm)';es.textContent=er;el.appendChild(es);}});const tk=Object.entries(f).sort((a,b)=>b[1]-a[1]),te=Object.entries(e).sort((a,b)=>b[1]-a[1]);const tot=Object.values(f).reduce((a,b)=>a+b,0);document.getElementById('hmst').innerHTML=`<div class="rcard"><div class="rl">Most Used</div><div class="rv a">${tk[0]?tk[0][0]:'--'}</div></div><div class="rcard"><div class="rl">Total Keys</div><div class="rv">${tot}</div></div><div class="rcard"><div class="rl">Top Error</div><div class="rv r">${te[0]?te[0][0]:'--'}</div></div>`;}
function toggleHeatmap(){const hs=document.getElementById('hs');if(hs.classList.contains('on')){hideSc('hs');if(S.finished)showSc('rs');else document.getElementById('tsec').style.display='block';}else{document.getElementById('tsec').style.display='none';hideSc('rs');buildKB();applyHM();showSc('hs');}}
function openSettings(){document.getElementById('sscrim').classList.add('on')}
function closeSett(){document.getElementById('sscrim').classList.remove('on')}
function closeSBg(e){if(e.target===document.getElementById('sscrim'))closeSett()}
const TH={dark:{bg:'#0c0c0f',ac:'#f5c842',gr:'#4ade80',re:'#f87171'},coffee:{bg:'#16110d',ac:'#d49060',gr:'#a3c080',re:'#e07070'},ocean:{bg:'#080e1a',ac:'#5db4f7',gr:'#45d4b4',re:'#f07070'},neon:{bg:'#080f09',ac:'#00ff9d',gr:'#00ff9d',re:'#ff4444'},rose:{bg:'#150f12',ac:'#f4a4c4',gr:'#a4d4b4',re:'#f47484'},light:{bg:'#f0f0eb',ac:'#c9841a',gr:'#2a7e52',re:'#c23030'}};
function applyTheme(t){const th=TH[t]||TH.dark;const r=document.documentElement.style;r.setProperty('--bg',th.bg);r.setProperty('--ac',th.ac);r.setProperty('--ag',th.ac+'44');r.setProperty('--ad',th.ac);r.setProperty('--cc',th.ac);r.setProperty('--gr',th.gr);r.setProperty('--re',th.re);const light=t==='light';r.setProperty('--tx',light?'#1a1a1a':'#e8e8f0');r.setProperty('--td',light?'rgba(26,26,26,.6)':'rgba(232,232,240,.45)');r.setProperty('--tf',light?'rgba(26,26,26,.3)':'rgba(232,232,240,.2)');r.setProperty('--glass',light?'rgba(0,0,0,.04)':'rgba(255,255,255,.035)');r.setProperty('--gb',light?'rgba(0,0,0,.1)':'rgba(255,255,255,.08)');}
function share(){const w=document.getElementById('rwpm').textContent,a=document.getElementById('racc').textContent;const tx=`EchoType\nWPM: ${w}  |  Accuracy: ${a}`;if(navigator.share)navigator.share({title:'EchoType',text:tx}).catch(()=>{});else navigator.clipboard.writeText(tx).then(()=>toast('Copied!'));}
function toast(m){const el=document.getElementById('toast');el.textContent=m;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2500);}
let tb=false;
document.addEventListener('keydown',e=>{if(e.key==='Tab'){tb=true;e.preventDefault()}if(e.key==='Enter'&&tb){e.preventDefault();restart()}if(e.key==='Escape'){e.preventDefault();goHome()}});
document.addEventListener('keyup',e=>{if(e.key==='Tab')tb=false});
document.addEventListener('keypress',e=>{if(document.activeElement!==hi&&!S.finished)foc()});
buildKB();init();


