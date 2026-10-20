const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const THREE=require('three');
const source=fs.readFileSync('dist/gallery.js','utf8');
const data=JSON.parse(fs.readFileSync('dist/gallery-content.json','utf8'));
async function boot({page='academic',reduced=false,mobile=false,webgl=true,hash=''}={}){
 const {window,document}=parseHTML(fs.readFileSync(page==='academic'?'dist/index.html':`dist/${page}/index.html`,'utf8'));
 for(const a of document.querySelectorAll('a[href]'))if(a.getAttribute('href').startsWith('/'))a.href=new URL(a.getAttribute('href'),'https://example.test').href;
 const calls=[], assigned=[], errors=[];let clock=0,frameId=0;const frames=new Map();const listeners={};const storage=new Map();
 const originalCreate=document.createElement.bind(document);
 document.createElement=function(tag){const el=originalCreate(tag);if(tag==='canvas'){el.getContext=()=>new Proxy({measureText:s=>({width:s.length*17})},{get:(o,k)=>o[k]||(()=>{})});el.getBoundingClientRect=()=>({left:0,top:0,width:1280,height:680});}if(tag==='dialog'){el.showModal=()=>{el.open=true};el.close=()=>{el.open=false;el.dispatchEvent(new window.Event('close'))}}return el;};
 class Renderer{constructor(){if(!webgl)throw Error('WebGL unavailable');this.domElement=document.createElement('canvas')}setPixelRatio(){}setClearColor(){}setSize(){}dispose(){}render(s,c){s.updateMatrixWorld(true);c.updateMatrixWorld(true);calls.push({scene:s,camera:c,position:c.position.clone()});}}
 class Loader{load(url,cb){cb(new THREE.Texture());}}
 const location={origin:'https://example.test',pathname:page==='academic'?'/':`/${page}/`,hash,assign:x=>assigned.push(x)};
 const context=vm.createContext({document,console:{warn:(...x)=>errors.push(x),log:console.log},URL,location,history:{pushState:(s,t,p)=>{location.pathname=p}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},performance:{now:()=>clock},matchMedia:q=>({matches:q.includes('reduced')?reduced:mobile,addEventListener(){}}),innerWidth:mobile?390:1280,innerHeight:768,devicePixelRatio:1,fetch:async()=>({ok:true,json:async()=>data}),addEventListener:(n,f)=>listeners[n]=f,requestAnimationFrame:f=>{frames.set(++frameId,f);return frameId},cancelAnimationFrame:id=>frames.delete(id)});
 const exports={...THREE,WebGLRenderer:Renderer,TextureLoader:Loader};
 const vendor=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v)},{context});
 const module=new vm.SourceTextModule(source,{context});await module.link(()=>vendor);await module.evaluate();
 function advance(){clock+=5000;const current=[...frames.values()];frames.clear();current.forEach(f=>f(clock));}
 function clickRoute(page){const a=[...document.querySelectorAll('header nav a')].find(a=>a.textContent.toLowerCase()===page);a.href=new URL(a.getAttribute('href'),'https://example.test').href;const event=new window.Event('click',{bubbles:true,cancelable:true});event.button=0;a.dispatchEvent(event);}
 return {document,calls,assigned,errors,frames,location,advance,clickRoute,listeners,storage};
}
(async()=>{
 const a=await boot();assert(a.document.body.classList.contains('gallery-mode'));assert.equal(a.document.querySelectorAll('.gallery-exhibits button').length,3);
 const initial=a.calls.at(-1);assert.equal(initial.scene.children.length,5);assert.equal(initial.camera.position.x,0);
 a.clickRoute('ironclads');assert(a.frames.size>0);assert.equal(a.location.pathname,'/ironclads/');a.advance();assert.equal(a.calls.at(-1).camera.position.x,90);assert.equal(a.document.querySelector('[aria-current="page"]').textContent,'Ironclads');
 // Test a wall target is actually on the view frustum, not a fixed overlay.
 const camera=a.calls.at(-1).camera;const world=new THREE.Vector3(90-4.1,6.2,-7.68);const projected=world.clone().project(camera);assert(Math.abs(projected.x)<1&&Math.abs(projected.y)<1&&projected.z<1);
 const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(projected.x,projected.y),camera);const hits=ray.intersectObjects(a.calls.at(-1).scene.children,true);assert(hits.some(h=>h.object.userData.room===3));
 a.document.querySelector('.gallery-toolbar button').onclick();assert(a.document.querySelector('dialog').open);assert(a.document.querySelector('dialog').textContent.includes('Fleets, Trade and State Power'));
 a.document.querySelector('.reader-close').onclick();assert(!a.document.querySelector('dialog').open);
 a.clickRoute('blog');a.clickRoute('projects');a.advance();assert.equal(a.calls.at(-1).camera.position.x,30);assert(!a.document.querySelector('.gallery-shell').classList.contains('in-transit'));
 a.location.pathname='/';a.listeners.popstate();a.advance();assert.equal(a.calls.at(-1).camera.position.x,0);
 a.document.querySelector('.view-switch').onclick();assert(!a.document.body.classList.contains('gallery-mode'));assert.equal(a.storage.get('pavilion-view'),'reading');
 const r=await boot({reduced:true});assert(!r.document.body.classList.contains('gallery-mode'));r.document.querySelector('.view-switch').onclick();r.clickRoute('ironclads');assert.equal(r.frames.size,0);assert.equal(r.calls.at(-1).camera.position.x,90);
 const m=await boot({mobile:true});assert(!m.document.body.classList.contains('gallery-mode'));
 const h=await boot({hash:'#dissertation'});assert(!h.document.body.classList.contains('gallery-mode'));
 const f=await boot({webgl:false});assert(!f.document.body.classList.contains('gallery-mode'));assert(f.document.querySelector('#content'));assert(f.errors.length);
 const direct=await boot({page:'ironclads'});assert.equal(direct.calls.at(-1).camera.position.x,90);
 direct.document.querySelector('.view-switch').onclick();assert.equal(direct.assigned.length,0);
 console.log('PASS: 3D geometry and raycast, five-room navigation, interrupted transitions, history, reading dialog, reduced motion, mobile default, deep links and WebGL fallback. Renderer is mocked; pixel output is not verified.');
})().catch(e=>{console.error(e);process.exitCode=1});
