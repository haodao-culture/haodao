import {AuthError,getSession,startLogin,googleLogin,listUsers,changeUser,requireOwner,sessionCookie} from './auth.mjs';
import appsScript from './apps-script-template.mjs';

const ORIGIN='https://www.haodao.org';
const MEDIA='https://media.haodao.org/';
const UPLOAD_PREFIX='images/website-uploads/';
const SHEET_ID='1HFTFuq8yiqAXmhT5OFgcYYNgQc6J9yjcbzMrGXTy3x8';
const encoder=new TextEncoder();
const cities=['臺北市','新北市','桃園市','臺中市','臺南市','高雄市','基隆市','新竹市','嘉義市','新竹縣','苗栗縣','彰化縣','南投縣','雲林縣','嘉義縣','屏東縣','宜蘭縣','花蓮縣','臺東縣','澎湖縣','金門縣','連江縣'];
const stamp=()=>new Date(Date.now()+8*3600000).toISOString().slice(0,19)+'+08:00';
const today=()=>stamp().slice(0,10);
const unix=()=>Math.floor(Date.now()/1000);
const hex=b=>Array.from(new Uint8Array(b),n=>n.toString(16).padStart(2,'0')).join('');
const fromHex=s=>Uint8Array.from(s.match(/../g)||[],n=>parseInt(n,16));
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const hash=async s=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(s)));
class HttpError extends Error {constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new HttpError(status,message);};
const constantEqual=(a,b)=>{if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;};
function text(body,key,max,required=false){const v=body[key]??'';if(typeof v!=='string')fail(400,'欄位格式不正確。');const s=v.trim();if(s.length>max||(required&&!s))fail(400,'請確認必填欄位與文字長度。');return s;}
const eventObject=row=>({...row,photos:JSON.parse(row.photos),archived:row.end_date<today()});
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const sheetUrl=url=>/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url);
const allowedOrigin=(request,env)=>request.headers.get('Origin')===ORIGIN||(env.LOCAL_TEST==='true'&&request.headers.get('Origin')==='http://127.0.0.1:4180');
function reply(request,env,data,status=200,cookie){
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex','Referrer-Policy':'same-origin','Vary':'Origin'};
 if(allowedOrigin(request,env)){headers['Access-Control-Allow-Origin']=request.headers.get('Origin');headers['Access-Control-Allow-Credentials']='true';}
 if(cookie)headers['Set-Cookie']=cookie;
 return new Response(JSON.stringify(data),{status,headers});
}
async function limited(request,env,key,max,seconds){
 const address=request.headers.get('CF-Connecting-IP')||'local';
 const bucket=key+':'+await hash(address);
 const now=unix();
 const row=await env.DB.prepare('INSERT INTO rate_limits(bucket,count,expires) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END,expires=CASE WHEN expires<=? THEN ? ELSE expires END RETURNING count').bind(bucket,now+seconds,now,now,now+seconds).first();
 if(row.count>max)fail(429,'操作較頻繁，請稍後再試。');
}
const session=getSession;
async function admin(request,env,write=false){
 const current=await session(request,env);if(!current)fail(401,'請先登入管理者。');
 if(write&&!constantEqual(request.headers.get('X-CSRF-Token'),current.csrf))fail(403,'驗證已失效，請重新登入。');
 return current;
}
async function settings(env){
 const row=await env.DB.prepare("SELECT value FROM settings WHERE key='sheets'").first();
 return row?JSON.parse(row.value):{url:'',secret:''};
}
async function putSettings(env,value){await env.DB.prepare("INSERT INTO settings(key,value) VALUES('sheets',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify(value)).run();}
async function sendSheet(config,action,registration=null){
 if(!sheetUrl(config.url)||!config.secret)throw Error('Not configured');
 const payload=JSON.stringify({action,timestamp:unix(),spreadsheet_id:SHEET_ID,registration});
 const key=await crypto.subtle.importKey('raw',encoder.encode(config.secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signature=hex(await crypto.subtle.sign('HMAC',key,encoder.encode(payload)));
 let response=await fetch(config.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payload,signature}),redirect:'manual',signal:AbortSignal.timeout(12000)});
 for(let i=0;[301,302,303,307,308].includes(response.status)&&i<3;i++){
  const url=new URL(response.headers.get('Location'),config.url);
  if(url.protocol!=='https:'||!['script.google.com','script.googleusercontent.com'].includes(url.hostname)||url.port)throw Error('Unexpected redirect');
  response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(12000)});
 }
 if(!response.ok)throw Error('Not acknowledged');
 const result=await response.json();
 if(result.ok!==true||result.spreadsheet_id!==SHEET_ID||(registration&&result.id!==registration.id))throw Error('Not acknowledged');
}
async function syncOne(env,id){
 const row=await env.DB.prepare('SELECT r.*,e.title AS event_title FROM registrations r LEFT JOIN events e ON r.event_id=e.id WHERE r.id=?').bind(id).first();
 if(!row)return false;if(row.sheet_state==='synced')return true;
 const config=await settings(env);if(!config.url)return false;
 const registration=Object.fromEntries(['id','name','phone','line_id','city'].map(k=>[k,row[k]]));
 Object.assign(registration,{created_at:row.created_at.slice(0,19).replace('T',' '),event_title:row.event_title||'請志工協助安排適合的共學',consent:true});
 try{await sendSheet(config,'register',registration);await env.DB.prepare("UPDATE registrations SET sheet_state='synced',sheet_error='',sheet_synced_at=? WHERE id=?").bind(unix(),id).run();return true;}
 catch{await env.DB.prepare("UPDATE registrations SET sheet_state='pending',sheet_error='連線未完成，等待重試' WHERE id=?").bind(id).run();return false;}
}
async function syncPending(env){
 if(!(await settings(env)).url)return;
 const {results}=await env.DB.prepare("SELECT id FROM registrations WHERE sheet_state!='synced' ORDER BY created_at LIMIT 20").all();
 for(const row of results)if(!await syncOne(env,row.id))break;
}
function imageInfo(bytes){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),ascii=(a,b)=>String.fromCharCode(...bytes.slice(a,b));
 if(bytes.length<24)fail(400,'請上傳有效的 JPG、PNG 或 WebP 照片。');
 let width=0,height=0,extension='',type='';
 if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP'&&view.getUint32(4,true)+8===bytes.length){
  extension='webp';type='image/webp';const chunk=ascii(12,16);
  if(chunk==='VP8X'&&bytes.length>=30){width=1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16);height=1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16);}
  else if(chunk==='VP8L'&&bytes[20]===0x2f&&bytes.length>=25){const n=view.getUint32(21,true);width=1+(n&16383);height=1+((n>>>14)&16383);}
  else if(chunk==='VP8 '&&bytes.length>=30&&bytes[23]===0x9d&&bytes[24]===1&&bytes[25]===0x2a){width=view.getUint16(26,true)&16383;height=view.getUint16(28,true)&16383;}
 }else if(bytes[0]===137&&ascii(1,4)==='PNG'&&ascii(12,16)==='IHDR'){
  width=view.getUint32(16);height=view.getUint32(20);extension='png';type='image/png';
 }else if(bytes[0]===255&&bytes[1]===216&&bytes[bytes.length-2]===255&&bytes[bytes.length-1]===217){
  extension='jpg';type='image/jpeg';let i=2;
  while(i+9<bytes.length){if(bytes[i++]!==255)break;while(bytes[i]===255)i++;const marker=bytes[i++];if(marker===0xd9||marker===0xda)break;const size=view.getUint16(i);if(size<2||i+size>bytes.length)break;if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){height=view.getUint16(i+3);width=view.getUint16(i+5);break;}i+=size;}
 }
 if(!width||!height||width*height>30000000)fail(400,'請上傳有效的 JPG、PNG 或 WebP 照片（最多 3,000 萬畫素）。');
 return {width,height,extension,type};
}
async function mediaValid(env,url){
 if(!url)return true;
 const match=url.match(/^https:\/\/media\.haodao\.org\/(images\/website-uploads\/[a-f0-9]{64}\.(?:jpg|png|webp))$/);
 return !!match&&!!await env.MEDIA.head(match[1]);
}
async function saveEvent(env,body){
 const limits={title:120,kind:20,start_date:10,end_date:10,time_text:100,start_time:5,end_time:5,mode:10,region:20,location:300,description:15000,poster:500,registration_url:1000};
 const required=['title','kind','start_date','end_date','mode','description'];
 const fields=Object.fromEntries(Object.entries(limits).map(([key,max])=>[key,text(body,key,max,required.includes(key))]));
 if(!['courses','community'].includes(fields.kind)||!['線上','線下'].includes(fields.mode))fail(400,'請選擇活動類型與形式。');
 if(!['','北區','中區','嘉南區','高屏區'].includes(fields.region))fail(400,'請選擇地區。');
 if(!validDate(fields.start_date)||!validDate(fields.end_date)||fields.end_date<fields.start_date)fail(400,'請確認活動日期。');
 for(const key of ['start_time','end_time'])if(fields[key]&&!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(fields[key]))fail(400,'請使用有效的 24 小時制時間。');
 if(fields.start_date===fields.end_date&&fields.start_time&&fields.end_time&&fields.end_time<fields.start_time)fail(400,'結束時間不可早於開始時間。');
 if(fields.start_time||fields.end_time)fields.time_text='';
 if(fields.registration_url){try{const u=new URL(fields.registration_url);if(u.protocol!=='https:'||u.username||u.password)throw Error();}catch{fail(400,'報名網址需為有效的 HTTPS 網址。');}}
 const photos=body.photos??[];if(!Array.isArray(photos)||photos.length>20||photos.some(p=>typeof p!=='string'||!p))fail(400,'照片格式不正確，最多 20 張。');
 if(!await mediaValid(env,fields.poster))fail(400,'封面格式不正確。');
 for(const photo of photos)if(!await mediaValid(env,photo))fail(400,'照片格式不正確。');
 fields.photos=JSON.stringify(photos);
 const id=text(body,'id',64)||random();const now=stamp();
 if(body.id){
  if(!Number.isInteger(body.revision))fail(400,'請重新讀取活動後再編輯。');
  const updated=await env.DB.prepare('UPDATE events SET '+Object.keys(fields).map(k=>k+'=?').join(',')+',revision=revision+1,updated_at=? WHERE id=? AND revision=?').bind(...Object.values(fields),now,id,body.revision).run();
  if(!updated.meta.changes){const found=await env.DB.prepare('SELECT id FROM events WHERE id=?').bind(id).first();fail(found?409:404,found?'此活動已被更新，請關閉後重新開啟再編輯。':'找不到原活動。');}
 }else await env.DB.prepare('INSERT INTO events (id,'+Object.keys(fields).join(',')+',created_at,updated_at) VALUES ('+Array(Object.keys(fields).length+3).fill('?').join(',')+')').bind(id,...Object.values(fields),now,now).run();
 return eventObject(await env.DB.prepare('SELECT * FROM events WHERE id=?').bind(id).first());
}
async function register(request,env,body){
 await limited(request,env,'register',20,3600);
 const fields=Object.fromEntries(Object.entries({request_id:80,name:80,phone:30,line_id:100,city:20}).map(([k,max])=>[k,text(body,k,max,true)]));
 if(!/^[a-zA-Z0-9-]{16,80}$/.test(fields.request_id))fail(400,'請重新整理頁面後再提交。');
 if(!cities.includes(fields.city))fail(400,'請選擇所在地。');
 fields.phone=fields.phone.replace(/[\s-]/g,'');if(!/^09\d{8}$/.test(fields.phone))fail(400,'請輸入 09 開頭的 10 碼手機號碼。');
 if(body.consent!==true)fail(400,'請同意使用聯絡資料安排共學。');
 const eventId=text(body,'event_id',64)||null;
 if(eventId){const event=await env.DB.prepare('SELECT kind,end_date FROM events WHERE id=?').bind(eventId).first();if(!event||event.kind!=='community'||event.end_date<today())fail(400,'此場次已結束或無法報名，請重新選擇。');}
 const id=random();
 await env.DB.prepare('INSERT INTO registrations(id,request_id,event_id,name,phone,line_id,city,created_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING').bind(id,fields.request_id,eventId,fields.name,fields.phone,fields.line_id,fields.city,stamp()).run();
 const saved=await env.DB.prepare('SELECT id FROM registrations WHERE request_id=?').bind(fields.request_id).first();
 const synced=await syncOne(env,saved.id);
 return {ok:true,id:saved.id,localPreview:false,sheetSynced:synced,sheetConfigured:!!(await settings(env)).url};
}
export default {
 async fetch(request,env,context){
  try{
   const url=new URL(request.url),p=url.pathname;
   if(request.method==='OPTIONS'){
    if(!allowedOrigin(request,env))return reply(request,env,{error:'不允許的存取來源。'},403);
    const response=reply(request,env,{});response.headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');response.headers.set('Access-Control-Allow-Headers','Content-Type, X-CSRF-Token');return response;
   }
   if(request.method==='GET'){
    if(p==='/api/health')return reply(request,env,{ok:true,version:'2026-10-05'});
    if(p==='/api/session'){const s=await session(request,env);return reply(request,env,{authenticated:!!s,csrf:s?.csrf||null,user:s?{email:s.email,role:s.role}:null,localPreview:false});}
    if(p==='/api/admin/users')return reply(request,env,{users:await listUsers(env,await admin(request,env))});
    if(p==='/api/events'){const {results}=await env.DB.prepare('SELECT * FROM events ORDER BY start_date,id').all();return reply(request,env,{events:results.map(eventObject),today:today(),timeZone:'Asia/Taipei',sheetsConnected:!!(await settings(env)).url});}
    if(p==='/api/registrations'){await admin(request,env);const {results}=await env.DB.prepare('SELECT r.*,e.title AS event_title FROM registrations r LEFT JOIN events e ON e.id=r.event_id ORDER BY r.created_at DESC').all();return reply(request,env,{registrations:results});}
    if(p==='/api/sheets-setup'){
     requireOwner(await admin(request,env));let config=await settings(env);if(!config.secret){config.secret=random();await putSettings(env,config);}
     return reply(request,env,{url:config.url,connected:!!config.url,spreadsheet_url:`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`,code:appsScript.replace('__HAODAO_SHARED_SECRET__',config.secret)});
    }
    fail(404,'找不到此功能。');
   }
   if(request.method!=='POST')fail(405,'不支援此操作。');
   if(!allowedOrigin(request,env))fail(403,'請從本站提交表單。');
   if(request.headers.get('Content-Type')?.split(';')[0]!=='application/json')fail(415,'請使用 JSON 格式。');
   if(Number(request.headers.get('Content-Length'))>12*1024*1024)fail(413,'資料大小超過限制。');
   const raw=await request.text();if(raw.length>12*1024*1024)fail(413,'資料大小超過限制。');
   let body;try{body=JSON.parse(raw);}catch{fail(400,'資料格式不正確。');}
   if(!body||Array.isArray(body)||typeof body!=='object')fail(400,'資料格式不正確。');
   if(p==='/api/login')fail(410,'請改用 Google 帳號登入獨立管理後台。');
   if(p==='/api/auth/start'||p==='/api/auth/google'){
    await limited(request,env,'google-login',30,900);
    const result=p.endsWith('/start')?await startLogin(request,env):await googleLogin(request,env,body);
    return reply(request,env,result.data,200,result.cookie);
   }
   if(p==='/api/registrations')return reply(request,env,await register(request,env,body));
   const current=await admin(request,env,true);
   if(p==='/api/admin/users')return reply(request,env,await changeUser(env,current,body));
   if(p==='/api/logout'){await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(current.token_hash).run();return reply(request,env,{ok:true},200,'__Host-haodao_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');}
   if(p==='/api/events')return reply(request,env,{event:await saveEvent(env,body)});
   if(p==='/api/uploads'){
    await limited(request,env,'upload',100,3600);const b64=text(body,'data',11200000,true);
    if(!/^[A-Za-z0-9+/]+={0,2}$/.test(b64))fail(400,'照片格式不正確。');
    let bytes;try{bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));}catch{fail(400,'照片格式不正確。');}
    if(bytes.length>8*1024*1024)fail(413,'單張照片上限為 8 MB。');
    const image=imageInfo(bytes),name=UPLOAD_PREFIX+random()+'.'+image.extension;
    await env.MEDIA.put(name,bytes,{httpMetadata:{contentType:image.type,cacheControl:'public, max-age=31536000, immutable'},customMetadata:{width:String(image.width),height:String(image.height)}});
    return reply(request,env,{url:MEDIA+name});
   }
   if(p==='/api/registration-status'){
    if(!['待聯繫','已聯繫'].includes(body.status))fail(400,'狀態不正確。');
    const result=await env.DB.prepare('UPDATE registrations SET status=? WHERE id=?').bind(body.status,text(body,'id',64,true)).run();if(!result.meta.changes)fail(404,'找不到報名。');return reply(request,env,{ok:true});
   }
   if(p==='/api/sheets-connect'){
    requireOwner(current);
    const newUrl=text(body,'url',500,true);if(!sheetUrl(newUrl))fail(400,'請貼上 Google Apps Script 網頁應用程式 /exec 網址。');
    const config=await settings(env);if(!config.secret)fail(400,'請先取得並部署連接程式。');
    const candidate={...config,url:newUrl};try{await sendSheet(candidate,'ping');}catch{fail(400,'尚未連接成功。請確認已部署最新程式並完成 Google 授權。');}
    await putSettings(env,candidate);context.waitUntil(syncPending(env));return reply(request,env,{ok:true});
   }
   if(p==='/api/sheets-retry'){context.waitUntil(syncPending(env));return reply(request,env,{ok:true});}
   fail(404,'找不到此功能。');
  }catch(error){return reply(request,env,{error:(error instanceof HttpError||error instanceof AuthError)?error.message:'暫時無法完成，請保留內容並稍後再試。'},(error instanceof HttpError||error instanceof AuthError)?error.status:500);}
 },
 async scheduled(_event,env,context){
  context.waitUntil(Promise.all([syncPending(env),env.DB.prepare('DELETE FROM admin_sessions WHERE expires<?').bind(unix()).run(),env.DB.prepare('DELETE FROM admin_challenges WHERE expires<?').bind(unix()).run(),env.DB.prepare('DELETE FROM sessions WHERE expires<?').bind(unix()).run(),env.DB.prepare('DELETE FROM rate_limits WHERE expires<?').bind(unix()).run()]));
 }
};
export {imageInfo,validDate,constantEqual};
