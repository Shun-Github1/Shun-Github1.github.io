import * as THREE from './vendor/three.module.min.js';

const ROOMS=['academic','projects','newsletter','ironclads','blog'];
const LABELS=['Academic','Projects','Newsletter','Ironclads','Blog'];
const SPACING=30;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const narrow=matchMedia('(max-width: 700px)');
const pathFor=i=>i===0?'/':`/${ROOMS[i]}/`;
let active=Math.max(0,ROOMS.indexOf(document.body.dataset.page));
let data,renderer,scene,camera,animation=null,raf=0,enabled=false;
let picked=[],roomGroups=[],boardMeshes=[],textures=[];
let fallbackPage=active;
const shell=document.createElement('section');shell.className='gallery-shell';shell.setAttribute('aria-label','Three-dimensional exhibition');
const controls=document.createElement('div');controls.className='gallery-toolbar';
const read=document.createElement('button');read.textContent='Read this room';
const status=document.createElement('span');status.className='gallery-status';status.setAttribute('role','status');
controls.append(read,status);
const exhibits=document.createElement('div');exhibits.className='gallery-exhibits';exhibits.setAttribute('aria-label','Wall exhibits');
const mode=document.createElement('button');mode.className='view-switch';mode.textContent='Enter 3D pavilion';mode.hidden=true;
const dialog=document.createElement('dialog');dialog.className='reading-room';dialog.setAttribute('aria-labelledby','reader-title');
const close=document.createElement('button');close.className='reader-close';close.textContent='Close';
const reader=document.createElement('div');dialog.append(close,reader);close.onclick=()=>dialog.close();
let lastFocus=null;dialog.addEventListener('close',()=>{if(lastFocus?.isConnected)lastFocus.focus()});
shell.append(exhibits,controls);document.body.append(shell,mode,dialog);
const ink=0xb9b7a0,dimInk=0x656c5c;
const lineMat=new THREE.LineBasicMaterial({color:ink,transparent:true,opacity:.48});
const faintMat=new THREE.LineBasicMaterial({color:dimInk,transparent:true,opacity:.38});
const solidMat=new THREE.MeshBasicMaterial({color:0x272d27});
function line(points,parent,material=lineMat){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const l=new THREE.Line(g,material);parent.add(l);return l}
function box(w,h,d,x,y,z,parent,color=0x2c332b){const geometry=new THREE.BoxGeometry(w,h,d);const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color}));mesh.position.set(x,y,z);parent.add(mesh);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),lineMat);edges.position.copy(mesh.position);parent.add(edges);return mesh}
function frame(w,h,x,y,z,parent){box(w+.22,.09,.12,x,y-h/2,z,parent);box(w+.22,.09,.12,x,y+h/2,z,parent);box(.09,h,.12,x-w/2,y,z,parent);box(.09,h,.12,x+w/2,y,z,parent)}
function canvasTexture(draw,w=1200,h=900){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.fillStyle='#283027';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#a4a58b';ctx.fillStyle='#e5e2cf';draw(ctx,w,h);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t}
function wrap(ctx,text,x,y,max,lineHeight,maxLines=20){let row='',count=0;for(const word of String(text||'').split(/\s+/)){const test=row+word+' ';if(ctx.measureText(test).width>max&&row){ctx.fillText(row.trim(),x,y);y+=lineHeight;count++;row='';if(count>=maxLines)return y;}row+=word+' ';}if(row)ctx.fillText(row.trim(),x,y);return y+lineHeight}
function plate(texture,w,h,x,y,z,parent){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));m.position.set(x,y,z);parent.add(m);frame(w,h,x,y,z+.04,parent);return m}
function roomItems(i){if(i===0)return [data.academic.dissertation,...data.academic.essays].filter(x=>x&&x.published!==false);return(data[ROOMS[i]]||[]).filter(x=>x.published!==false)}
function boardTexture(i){return canvasTexture((c,w,h)=>{
 c.fillStyle='#b5b69d';c.font='22px sans-serif';c.fillText(`0${i+1}   /   ${LABELS[i].toUpperCase()}`,62,65);
 const items=roomItems(i);let y=125;
 if(i===0&&data.introduction){c.fillStyle='#eee9d8';c.font='54px Georgia';c.fillText(data.introduction.title||data.name,62,y);y+=55;c.fillStyle='#c5c9b7';c.font='28px Georgia';y=wrap(c,data.introduction.paragraphs?.[0],62,y,w-124,39,3)+20;}
 items.slice(0,i===0?2:3).forEach((item,index)=>{c.strokeStyle='#68735d';c.beginPath();c.moveTo(62,y);c.lineTo(w-62,y);c.stroke();y+=45;c.fillStyle='#ebe7d4';c.font='43px Georgia';y=wrap(c,item.title,62,y,w-124,51,2);c.fillStyle='#bdc4af';c.font='28px Georgia';y=wrap(c,item.summary,62,y+7,w-124,40,2)+36;});
 c.fillStyle='#bec2ad';c.font='22px sans-serif';c.fillText('Select this wall to read',62,h-38);
 });}
function drawing(i){return canvasTexture((c,w,h)=>{c.lineWidth=2;c.strokeStyle='#b0b69b';c.fillStyle='#dcdcc5';c.font='24px serif';c.fillText(['ARCHIVE / PLATE I','WRITING MACHINES','THE PRINTED PAGE','NAVAL STUDIES / PLATE IV','WORKING PAPERS'][i],45,55);
 const seg=(p)=>{c.beginPath();p.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.stroke()};
 if(i===3){
 // Original schematic, deliberately not a claim about a specific vessel.
 seg([[70,460],[145,560],[830,560],[1040,460],[70,460]]);seg([[145,485],[995,485]]);seg([[270,455],[270,390],[690,390],[690,455]]);c.strokeRect(340,325,65,65);c.strokeRect(535,325,65,65);seg([[465,390],[465,170],[490,210],[465,210]]);seg([[465,240],[230,455]]);seg([[465,240],[780,455]]);for(let x=170;x<880;x+=60){c.beginPath();c.arc(x,510,7,0,Math.PI*2);c.stroke();}for(let y=590;y<690;y+=26)seg([[60,y],[1050,y]]);
 c.font='20px serif';c.fillText('Hull · machinery · armament',70,745);seg([[80,805],[1040,805]]);for(let x=80;x<=1040;x+=96)seg([[x,795],[x,815]]);
 }else if(i===1){c.strokeRect(170,320,760,330);c.strokeRect(280,185,540,130);for(let y=380;y<600;y+=55)for(let x=230;x<900;x+=60){c.beginPath();c.arc(x,y,18,0,Math.PI*2);c.stroke();}seg([[120,675],[990,675]]);seg([[280,185],[260,140],[850,140],[820,185]]);
 }else if(i===2){for(let x=100;x<1000;x+=300){c.strokeRect(x,170,250,560);for(let y=210;y<690;y+=26)seg([[x+25,y],[x+220-(y%3)*30,y]]);}}
 else {for(let j=0;j<5;j++){const x=150+j*140,y=200+(j%2)*70;c.strokeRect(x,y,110,450);for(let yy=y+40;yy<y+420;yy+=32)seg([[x+15,yy],[x+95,yy]]);}seg([[80,740],[1080,740]]);}
 },1200,900)}
function buildRoom(i){const g=new THREE.Group();g.position.x=i*SPACING;scene.add(g);roomGroups.push(g);
 box(29,.15,22,0,-.1,2,g,0x222820);box(29,13,.2,0,6.4,-8,g,0x293026);
 // Rear wall pilasters, cornices and a genuinely vaulted wire roof.
 box(29,.12,.35,0,10.7,-7.8,g);box(29,.1,.35,0,.7,-7.8,g);
 for(const x of [-14,14]){for(const z of [-7.4,5.5]){box(.28,8.8,.28,x,4.4,z,g);box(.65,.25,.65,x,.2,z,g);box(.58,.18,.58,x,8.9,z,g);}
 line([[x,0,-7.4],[x,0,11]],g,faintMat);}
 for(const z of [-7.4,-1,5.5]){const pts=[];for(let s=0;s<=48;s++){const a=Math.PI*s/48;pts.push([-14*Math.cos(a),8.9+4*Math.sin(a),z]);}line(pts,g);}
 for(let x=-12;x<=12;x+=3){const yy=8.9+4*Math.sqrt(1-(x/14)**2);line([[x,yy,-7.4],[x,yy,5.5]],g,faintMat);}
 for(let x=-14;x<15;x+=3.5)line([[x,.02,-8],[x,.02,13]],g,faintMat);for(let z=-6;z<14;z+=3)line([[-14,.02,z],[14,.02,z]],g,faintMat);
 const board=plate(boardTexture(i),15,11.25,-4.1,6.2,-7.68,g);board.userData={room:i,kind:'read'};picked.push(board);boardMeshes.push(board);
 const art=plate(drawing(i),6.8,5.1,7.7,7.1,-7.65,g);art.userData={room:i,kind:'read'};picked.push(art);
 if(i===0){art.scale.x=.75;new THREE.TextureLoader().load(data.portrait,t=>{t.colorSpace=THREE.SRGBColorSpace;art.material.map=t;art.material.needsUpdate=true;textures.push(t);render()});}
 // Small physical exhibits provide clear parallax during camera travel.
 if(i===3)ship(g);else if(i===1)machine(g);else if(i===0||i===4)books(g);else papers(g);
}
function ship(g){const base=new THREE.Group();base.position.set(7,1.3,-2);g.add(base);box(8,.3,2.8,0,-.9,0,base);const shape=new THREE.Shape();shape.moveTo(-3.7,0);shape.lineTo(-2.9,-.65);shape.lineTo(2.8,-.65);shape.lineTo(3.8,0);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false});const mesh=new THREE.Mesh(geo,solidMat);mesh.position.z=-.5;base.add(mesh);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),lineMat);edges.position.copy(mesh.position);base.add(edges);box(3.4,.45,.9,0,.24,0,base);for(const x of [-.9,.9])box(.35,.75,.45,x,.8,0,base);line([[0,.3,0],[0,3,0]],base);line([[0,2.6,0],[-3.2,.15,0]],base);line([[0,2.6,0],[3.2,.15,0]],base);for(const x of [-1.7,1.7])box(.9,.12,.12,x,.65,.65,base);}
function machine(g){box(5,.25,2.8,7.5,1.3,-2,g);box(3.6,.7,1.8,7.5,1.85,-2,g);box(3.3,.15,.5,7.5,2.6,-2.6,g);for(let x=6.1;x<9;x+=.4)for(let z=-2.3;z<-1.2;z+=.35)box(.22,.08,.22,x,2.25,z,g);}
function books(g){box(5,.2,2,7.5,1.3,-2,g);for(let j=0;j<7;j++)box(.37,1.1+(j%3)*.2,1,6+j*.43,2,-2,g,0x30372c);}
function papers(g){box(5,.2,2.4,7.5,1.3,-2,g);for(let j=0;j<4;j++)box(2.7,.06,1.6,7.5+j*.07,1.5+j*.08,-2,g,0x3a4031);}
function render(){if(renderer&&enabled)renderer.render(scene,camera)}
const pose=i=>({position:new THREE.Vector3(i*SPACING,5.8,narrow.matches?28:13),target:new THREE.Vector3(i*SPACING-1,5.4,-7)});
function setPose(p){camera.position.copy(p.position);camera.lookAt(p.target);camera.updateMatrixWorld();}
function resize(){if(!renderer)return;const w=shell.clientWidth||innerWidth,h=shell.clientHeight||innerHeight-88;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(!animation)setPose(pose(active));render()}
function updateUI(){document.body.dataset.page=ROOMS[active];document.title=`${LABELS[active]} — ${data.name}`;document.querySelectorAll('header nav a').forEach(a=>{a.removeAttribute('aria-current');if(new URL(a.href).pathname===pathFor(active))a.setAttribute('aria-current','page')});status.textContent=`${String(active+1).padStart(2,'0')} / ${LABELS[active]}`;read.textContent=`Read ${LABELS[active]}`;exhibits.replaceChildren();roomItems(active).forEach(item=>{const b=document.createElement('button');b.textContent=item.title;b.onclick=()=>openReader(item.id);exhibits.append(b)});}
function navigate(i,push=true){if(i===active&&!animation)return;const old=active;active=i;if(push)history.pushState({room:ROOMS[i]},'',pathFor(i));updateUI();if(reduced.matches){animation=null;cancelAnimationFrame(raf);shell.classList.remove('in-transit');setPose(pose(i));render();return;}
 const from={position:camera.position.clone(),target:new THREE.Vector3(old*SPACING-1,5.4,-7)};const to=pose(i);const retreat=new THREE.Vector3(from.position.x,6.4,25);const approach=new THREE.Vector3(to.position.x,6.4,25);const curve=new THREE.CatmullRomCurve3([from.position,retreat,approach,to.position],false,'catmullrom',.3);
 animation={start:performance.now(),from,to,curve,duration:1000+Math.abs(i-old)*100};shell.classList.add('in-transit');cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
}
function tick(now){if(!animation||!enabled)return;const a=animation;const t=Math.min(1,(now-a.start)/a.duration);const e=t*t*(3-2*t);camera.position.copy(a.curve.getPoint(e));camera.lookAt(a.from.target.clone().lerp(a.to.target,e));render();if(t<1)raf=requestAnimationFrame(tick);else{setPose(a.to);animation=null;shell.classList.remove('in-transit');render();}}
function appendText(tag,text,parent){const el=document.createElement(tag);el.textContent=text||'';parent.append(el);return el}
function openReader(id){lastFocus=document.activeElement;reader.replaceChildren();appendText('h2',LABELS[active],reader).id='reader-title';if(active===0&&!id&&data.introduction){appendText('h3',data.introduction.title,reader);data.introduction.paragraphs.forEach(p=>appendText('p',p,reader));}const items=roomItems(active);for(const item of items){if(id&&item.id!==id)continue;const article=document.createElement('article');appendText('h3',item.title,article);if(item.year||item.date)appendText('p',item.year||item.date,article).className='meta';[item.summary,item.description,...(item.paragraphs||[])].filter(Boolean).forEach(p=>appendText('p',p,article));for(const link of item.links||[]){if(!/^(https?:\/\/|\/(?!\/)|mailto:)/i.test(link.url))continue;const a=appendText('a',link.label,article);a.href=link.url;article.append(document.createTextNode(' '));}reader.append(article);}if(data.sampleSources){const details=document.createElement('details');details.className='gallery-sample';appendText('summary','Sample text · sources',details);appendText('p','Fictionalised text for layout review.',details);data.sampleSources.forEach(s=>{const a=appendText('a',s.label,details);a.href=s.url;details.append(document.createElement('br'));});reader.append(details);}dialog.showModal();}
function stored(key){try{return localStorage.getItem(key)}catch{return null}}
function remember(value){try{localStorage.setItem('pavilion-view-v2',value)}catch{}}
function enable(){enabled=true;document.body.classList.add('gallery-mode');mode.textContent='Reading view';remember('3d');resize();updateUI();render();}
function disable(){enabled=false;cancelAnimationFrame(raf);animation=null;document.body.classList.remove('gallery-mode');mode.textContent='Enter 3D pavilion';remember('reading');if(active!==fallbackPage)location.assign(pathFor(active));}
read.onclick=()=>openReader();mode.onclick=()=>enabled?disable():enable();
document.querySelector('.skip')?.addEventListener('click',e=>{if(!enabled)return;e.preventDefault();if(active!==fallbackPage){remember('reading');location.assign(pathFor(active)+'#content');return;}disable();const main=document.getElementById('content');main.tabIndex=-1;main.focus();});
document.addEventListener('click',e=>{if(!enabled||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;const a=e.target.closest('a');if(!a)return;const url=new URL(a.href);if(url.origin!==location.origin||url.hash||url.search)return;const i=ROOMS.findIndex((_,j)=>pathFor(j)===url.pathname);if(i<0)return;e.preventDefault();if(dialog.open)dialog.close();navigate(i);});
addEventListener('popstate',()=>{if(!enabled)return;const i=ROOMS.findIndex((_,j)=>pathFor(j)===location.pathname);if(i>=0)navigate(i,false)});
addEventListener('resize',resize);reduced.addEventListener('change',()=>{if(reduced.matches&&animation){animation=null;cancelAnimationFrame(raf);shell.classList.remove('in-transit');setPose(pose(active));render()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&animation){animation=null;cancelAnimationFrame(raf);shell.classList.remove('in-transit');setPose(pose(active));}if(!document.hidden)render()});
try{
 const response=await fetch('/gallery-content.json');if(!response.ok)throw Error('Content unavailable');data=await response.json();
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x202420);renderer.domElement.setAttribute('aria-label','Five vaulted exhibition rooms with framed wall displays');renderer.domElement.setAttribute('role','img');shell.prepend(renderer.domElement);
 scene=new THREE.Scene();scene.fog=new THREE.Fog(0x202420,38,105);camera=new THREE.PerspectiveCamera(45,1,.1,240);ROOMS.forEach((_,i)=>buildRoom(i));
 // Connect the bays with a continuous colonnade and floor.
 box(ROOMS.length*SPACING,.12,10,60,-.15,18,scene,0x232a22);for(let x=-14;x<136;x+=5)line([[x,0,12],[x,0,23]],scene,faintMat);for(const z of [13,18,23])line([[-14,0,z],[136,0,z]],scene,faintMat);
 const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();function hit(event){const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(picked).find(h=>h.object.userData.room===active)}
 renderer.domElement.addEventListener('pointermove',e=>{renderer.domElement.style.cursor=!animation&&hit(e)?'pointer':'default'});renderer.domElement.addEventListener('click',e=>{if(!animation&&hit(e))openReader()});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();disable();mode.hidden=true;});
 mode.hidden=false;const preference=stored('pavilion-view-v2');if(!location.hash&&preference!=='reading')enable();else{setPose(pose(active));updateUI();}
}catch(error){console.warn('Pavilion unavailable; reading view retained.',error);enabled=false;document.body.classList.remove('gallery-mode');shell.remove();mode.hidden=true;renderer?.dispose();}
