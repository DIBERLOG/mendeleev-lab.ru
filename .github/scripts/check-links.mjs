// Checks that local src/href references in HTML files point to existing files.
// LINKCHECK_ALLOW: known pre-existing gaps, one "file: ref" per line.
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {join,dirname,resolve,relative,sep} from 'node:path';
const root=resolve(process.argv[2]||'.');
const allow=new Set((process.env.LINKCHECK_ALLOW||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean));
const html=[];
(function walk(d){for(const f of readdirSync(d)){if(f==='.git'||f==='node_modules')continue;const p=join(d,f);statSync(p).isDirectory()?walk(p):p.endsWith('.html')&&html.push(p);}})(root);
let missing=0;
for(const file of html){
 const text=readFileSync(file,'utf8');
 for(const [,ref] of text.matchAll(/(?:src|href)=["']([^"'#?]+)/g)){
  if(/^(?:[a-z]+:|\/\/|data:|\$\{|\{)/i.test(ref))continue;
  const target=ref.startsWith('/')?join(root,ref):join(dirname(file),ref);
  const ok=existsSync(target)&&(!statSync(target).isDirectory()||existsSync(join(target,'index.html')));
  if(ok)continue;
  const id=`${relative(root,file).split(sep).join('/')}: ${ref}`;
  if(allow.has(id)){console.log(`allowed: ${id}`);continue;}
  missing++;console.log(`missing: ${id}`);
 }
}
console.log(`${html.length} HTML files, ${missing} missing local references`);
process.exit(missing?1:0);
