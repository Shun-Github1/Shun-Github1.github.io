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
 return `<article class="content-entry"${item.id ? ` id="${escape(item.id)}"` : ''}>${item.placeholder ? '<p class="meta placeholder-label">Placeholder</p>' : ''}<${heading}>${escape(item.title)}</${heading}>${item.year || item.date ? `<p class="meta">${escape(item.year || item.date)}</p>` : ''}${item.summary ? `<p>${escape(item.summary)}</p>` : ''}${item.description ? `<p>${escape(item.description)}</p>` : ''}${(item.paragraphs || []).map(p => `<p>${escape(p)}</p>`).join('')}<div class="links">${links(item)}${item.architecture ? '<button class="diagram-launch" id="open-diagram">View architecture</button>' : ''}</div></article>`;
}
const example = (title, id) => ({id,title,summary:'Example placement — replace with your title and abstract.',year:'Year'});
const dissertation = data.academic.dissertation?.published === false ? null : data.academic.dissertation;
const essays = visible(data.academic.essays);
const academic = `<div class="academic-layout"><section class="academic-content">${data.introduction ? `<div class="self-introduction"><h1>${escape(data.introduction.title || data.name)}</h1>${data.introduction.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}</div>` : '<h1 class="sr-only">Academic</h1>'}<section class="dissertation"><h2>Dissertation</h2>${dissertation ? entry(dissertation,'h3') : preview ? entry(example('Dissertation title','dissertation-example'),'h3') : '<p class="empty-state">Not uploaded.</p>'}</section><section class="essay-list"><h2>Selected essays</h2>${essays.length ? essays.map(item=>entry(item,'h3')).join('') : preview ? [example('First essay title','essay-one'),example('Second essay title','essay-two')].map(item=>entry(item,'h3')).join('') : '<p class="empty-state">No essays uploaded.</p>'}</section></section><aside class="academic-sidebar"><div class="portrait-frame"><img class="profile-photo" src="${safeUrl(data.portrait)}" alt="${escape(data.name)}" width="800" height="800"></div></aside></div>`;
if (preview) { fs.mkdirSync(output,{recursive:true}); for (const file of ['style.css','app.js','diagram.js']) fs.copyFileSync(`dist/${file}`,`${output}/${file}`); fs.cpSync('dist/assets',`${output}/assets`,{recursive:true}); }
for (const page of ['academic','projects','newsletter','ironclads','blog']) {
 const title = page[0].toUpperCase()+page.slice(1);
 const items = page === 'academic' ? [] : visible(data[page]);
 const content = page === 'academic' ? academic : `<h1 class="sr-only">${title}</h1>${items.length ? items.map(item=>entry(item)).join('') : '<p class="empty-state">No posts published.</p>'}`;
 let html = template.replace(/<title>.*?<\/title>/,`<title>${title} — ${escape(data.name)}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(data.name)} — ${title}">`).replace('data-page="academic"',`data-page="${page}"`).replace(' aria-current="page"','').replace(`href="${page === 'academic' ? '/' : '/'+page+'/'}" data-route>`,`href="${page === 'academic' ? '/' : '/'+page+'/'}" aria-current="page" data-route>`).replace('Shun Kwok</a>',`${escape(data.name)}</a>`).replaceAll('shun.kwok@gmail.com',escape(data.email)).replace('{{CONTENT}}',content);
 if(data.sampleSources) html=html.replace('</footer>', '<details class="sample-sources"><summary>Sample text · sources</summary><p>Adapted and fictionalised for layout review; not the site owner’s work.</p>'+data.sampleSources.map(s=>'<a href="'+safeUrl(s.url)+'">'+escape(s.label)+'</a>').join(' · ')+'</details></footer>');
 if (items.some(item=>item.architecture)) html=html.replace('</body>',fs.readFileSync('templates/architecture.html','utf8')+'</body>');
 const dir=page === 'academic' ? output : `${output}/${page}`;
 fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(`${dir}/index.html`,html);
}
console.log(`Built five pages in ${output}/`);

fs.mkdirSync(`${output}/software`,{recursive:true});
fs.writeFileSync(`${output}/software/index.html`,'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/projects/"><link rel="canonical" href="/projects/"><title>Projects</title></head><body><a href="/projects/">Projects</a></body></html>');
