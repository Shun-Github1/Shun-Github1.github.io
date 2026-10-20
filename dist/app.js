// Ordinary navigation remains usable without the gallery.
function openLinkedNote(){let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}const t=document.getElementById(id);const n=t?.querySelector('details');if(n){n.open=true;t.scrollIntoView()}}
addEventListener('hashchange',openLinkedNote);if(location.hash)openLinkedNote();
