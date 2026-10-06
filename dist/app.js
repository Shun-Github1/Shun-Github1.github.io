const page=document.body.dataset.page;
document.querySelectorAll('[data-route]').forEach(link=>link.addEventListener('click',e=>{
 if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 if(new URL(link.href).pathname===location.pathname)return;
 e.preventDefault();document.body.classList.add('departing');setTimeout(()=>location.assign(link.href),360);
}));
addEventListener('pageshow',()=>document.body.classList.remove('departing'));
// Open an essay when arriving through its homepage link.
function openLinkedNote(){
 const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
 const note=target?.querySelector('details');
 if(note){note.open=true;target.scrollIntoView();}
}
addEventListener('hashchange',openLinkedNote);
if(location.hash)openLinkedNote();
