import {createRemoteJWKSet,jwtVerify} from 'jose';
export const OWNER='hd@haodao.org';
const keys=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const now=()=>Math.floor(Date.now()/1000);
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),n=>n.toString(16).padStart(2,'0')).join('');
export class AuthError extends Error {constructor(status,message){super(message);this.status=status;}}
const deny=(status,message)=>{throw new AuthError(status,message)};
const cookie=(request,name)=>(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';
export const sessionCookie=(token='',age=28800)=>`__Host-haodao_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
export async function verifyGoogle(token,clientId,nonce,keySet=keys){
 const {payload:p}=await jwtVerify(token,keySet,{algorithms:['RS256'],issuer:['https://accounts.google.com','accounts.google.com'],audience:clientId,requiredClaims:['sub','email','email_verified','iat','exp','nonce'],maxTokenAge:'10m'});
 if(p.nonce!==nonce||p.email_verified!==true||typeof p.sub!=='string'||!p.sub||typeof p.email!=='string')deny(401,'Google 登入驗證失敗，請重新登入。');
 const email=p.email.toLowerCase();
 if(!email.endsWith('@gmail.com')&&(!p.hd||p.hd!==email.split('@')[1]))deny(403,'請使用 Gmail 或 Google Workspace 管理的帳號登入。');
 return {email,sub:p.sub};
}
export async function getSession(request,env){
 const token=cookie(request,'__Host-haodao_session');if(!/^[a-f0-9]{64}$/.test(token))return null;
 return env.DB.prepare('SELECT s.token_hash,s.csrf,u.email,u.role FROM admin_sessions s JOIN admin_users u ON u.email=s.email AND u.google_sub=s.google_sub WHERE s.token_hash=? AND s.expires>?').bind(await hash(token),now()).first();
}
export function requireOwner(user){if(user?.email!==OWNER||user?.role!=='owner')deny(403,'只有最高權限管理者可以管理登入名單與連接設定。');}
export async function startLogin(request,env){
 if(!env.GOOGLE_CLIENT_ID)deny(503,'Google 登入尚待完成設定。');
 const challenge=random(),nonce=random();
 await env.DB.prepare('INSERT INTO admin_challenges(token_hash,nonce,expires) VALUES(?,?,?)').bind(await hash(challenge),nonce,now()+600).run();
 return {data:{clientId:env.GOOGLE_CLIENT_ID,nonce},cookie:`__Host-haodao_challenge=${challenge}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=600`};
}
export async function googleLogin(request,env,body,verify=verifyGoogle){
 if(!env.GOOGLE_CLIENT_ID)deny(503,'Google 登入尚待完成設定。');
 const challenge=cookie(request,'__Host-haodao_challenge');
 if(!/^[a-f0-9]{64}$/.test(challenge)||typeof body.credential!=='string'||body.credential.length>16000)deny(401,'請重新開啟 Google 登入。');
 const record=await env.DB.prepare('DELETE FROM admin_challenges WHERE token_hash=? AND expires>? RETURNING nonce').bind(await hash(challenge),now()).first();
 if(!record)deny(401,'登入已過期，請重新登入。');
 let identity;try{identity=await verify(body.credential,env.GOOGLE_CLIENT_ID,record.nonce)}catch(error){if(error instanceof AuthError)throw error;deny(401,'Google 登入驗證失敗，請重新登入。');}
 const {email,sub}=identity;
 // The fixed owner is seeded by migration; only an unbound allowed identity may bind once.
 await env.DB.prepare('UPDATE admin_users SET google_sub=? WHERE email=? AND google_sub IS NULL').bind(sub,email).run();
 const user=await env.DB.prepare('SELECT email,role FROM admin_users WHERE email=? AND google_sub=?').bind(email,sub).first();
 if(!user)deny(403,'此 Google 帳號尚未獲授權，請聯絡最高權限管理者。');
 const token=random(),csrf=random();
 await env.DB.prepare('INSERT INTO admin_sessions(token_hash,csrf,email,google_sub,expires) SELECT ?,?,email,google_sub,? FROM admin_users WHERE email=? AND google_sub=?').bind(await hash(token),csrf,now()+28800,email,sub).run();
 return {data:{authenticated:true,csrf,user},cookie:sessionCookie(token)};
}
export async function listUsers(env,user){requireOwner(user);return (await env.DB.prepare('SELECT email,role,created_at,google_sub IS NOT NULL AS has_logged_in FROM admin_users ORDER BY role DESC,email').all()).results;}
export async function changeUser(env,user,body){
 requireOwner(user);
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)deny(400,'請填寫完整的 Google 帳號電子郵件。');
 if(email===OWNER)deny(403,'最高權限管理者不能移除或變更權限。');
 if(body.action==='add')await env.DB.prepare("INSERT INTO admin_users(email,role,created_at) VALUES(?,'editor',?) ON CONFLICT(email) DO NOTHING").bind(email,now()).run();
 else if(body.action==='remove')await env.DB.batch([env.DB.prepare('DELETE FROM admin_sessions WHERE email=?').bind(email),env.DB.prepare("DELETE FROM admin_users WHERE email=? AND role='editor'").bind(email)]);
 else deny(400,'不支援此操作。');
 return {ok:true};
}
