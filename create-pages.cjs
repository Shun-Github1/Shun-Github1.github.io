const fs = require('node:fs');
const data = JSON.parse(fs.readFileSync('content.json', 'utf8'));
const template = fs.readFileSync('templates/page.html', 'utf8');
const preview = process.argv.includes('--preview');
const output = preview ? 'preview' : 'dist';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const visible = items => items.filter(item => item.published !== false);
function safeUrl(value) {
 if (typeof value !== 'string' || !/^(https?:\/\/|\/(?!\/)|mailto:)/i.test(value)) throw Error('Links must start with /, https://, http:// or mailto:');
 return escape(value);
}
function links(item) { return (item.links || []).map(link => `<a href="${safeUrl(link.url)}">${escape(link.label)}</a>`).join(''); }
function entry(item, heading='h2') {
 if (!item.title) throw Error('Every item needs a title');
 return `<article class="content-entry${item.image ? ' has-image' : ''}"${item.id ? ` id="${escape(item.id)}"` : ''}>${item.image ? `<img class="entry-image ${item.imageKind === 'paper' ? 'paper-preview' : ''}" src="${safeUrl(item.image)}" alt="${escape(item.imageAlt || item.title)}" loading="lazy">` : ''}<div class="entry-copy">${item.placeholder ? '<p class="meta placeholder-label">Placeholder</p>' : ''}<${heading}>${escape(item.title)}</${heading}>${item.year || item.date ? `<p class="meta">${escape(item.year || item.date)}</p>` : ''}${item.summary ? `<p>${escape(item.summary)}</p>` : ''}${item.description ? `<p>${escape(item.description)}</p>` : ''}${(item.paragraphs || []).map(p => `<p>${escape(p)}</p>`).join('')}<div class="links">${links(item)}</div></div>${item.architecture ? fs.readFileSync('templates/architecture.html','utf8') : ''}</article>`;
}
const example = (title, id) => ({id,title,summary:'Example placement — replace with your title and abstract.',year:'Year'});
const dissertations = visible(data.academic.dissertations || (data.academic.dissertation ? [data.academic.dissertation] : []));
const essays = visible(data.academic.essays);
const academic = `<h1 class="sr-only">Academic works</h1><section class="works-section"><h2>Dissertations</h2>${dissertations.map(item=>entry(item,'h3')).join('')}</section><section class="works-section"><h2>Selected essays</h2>${essays.map(item=>entry(item,'h3')).join('')}</section><section class="profile-section"><div class="self-introduction"><h2>${escape(data.name)}</h2>${data.introduction.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}</div><aside class="academic-sidebar"><div class="portrait-frame"><img class="profile-photo" src="${safeUrl(data.portrait)}" alt="${escape(data.name)}" width="800" height="800"></div></aside></section>`;

if (preview) { fs.mkdirSync(output,{recursive:true}); for (const file of ['style.css','app.js','diagram.js','gallery.css','gallery.js']) fs.copyFileSync(`dist/${file}`,`${output}/${file}`); fs.cpSync('dist/assets',`${output}/assets`,{recursive:true}); fs.cpSync('dist/vendor',`${output}/vendor`,{recursive:true}); }
const roomPages={};
for (const page of ['academic','projects','newsletter','ironclads']) {
 const title = page[0].toUpperCase()+page.slice(1);
 const items = page === 'academic' ? [] : visible(data[page]);
 const content = page === 'academic' ? academic : `<h1 class="sr-only">${title}</h1>${items.length ? items.map(item=>entry(item)).join('') : '<p class="empty-state">No posts published.</p>'}`;
 let html = template.replace(/<title>.*?<\/title>/,`<title>${title} — ${escape(data.name)}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(data.name)} — ${title}">`).replace('data-page="academic"',`data-page="${page}"`).replace(' aria-current="page"','').replace(`href="${page === 'academic' ? '/' : '/'+page+'/'}" data-route>${title}</a>`,`href="${page === 'academic' ? '/' : '/'+page+'/'}" aria-current="page" data-route>${title}</a>`).replace('Shun Kwok</a>',`${escape(data.name)}</a>`).replaceAll('shun.kwok@gmail.com',escape(data.email)).replace('{{CONTENT}}',content);
 if(data.sampleSources && page === 'ironclads') html=html.replace('</footer>', '<details class="sample-sources"><summary>Sample text · sources</summary><p>Adapted and fictionalised for layout review; not the site owner’s work.</p>'+data.sampleSources.map(s=>'<a href="'+safeUrl(s.url)+'">'+escape(s.label)+'</a>').join(' · ')+'</details></footer>');

 roomPages[page]=content;
 const dir=page === 'academic' ? output : `${output}/${page}`;
 fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(`${dir}/index.html`,html);
}
console.log(`Built four pages in ${output}/`);

fs.mkdirSync(`${output}/software`,{recursive:true});
fs.writeFileSync(`${output}/software/index.html`,'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/projects/"><link rel="canonical" href="/projects/"><title>Projects</title></head><body><a href="/projects/">Projects</a></body></html>');

fs.writeFileSync(`${output}/gallery-content.json`,JSON.stringify(data));

fs.writeFileSync(`${output}/room-pages.json`,JSON.stringify(roomPages));

fs.mkdirSync(output+'/blog',{recursive:true});
fs.writeFileSync(output+'/blog/index.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/projects/"><link rel="canonical" href="/projects/"><title>Projects</title></head><body><a href="/projects/">Projects</a></body></html>');
