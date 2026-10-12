const SB={
 on(){return !!(SITE.supabaseUrl&&SITE.supabaseKey)},
 url(){return SITE.supabaseUrl.replace(/\/$/,'')},
 sess(){try{return JSON.parse(localStorage.getItem('sb_sess')||'null')}catch(e){return null}},
 async token(){let s=this.sess();if(!s)return SITE.supabaseKey;
  if(s.expires_at*1000-Date.now()<60000&&s.refresh_token){
   const r=await fetch(this.url()+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:SITE.supabaseKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});
   if(r.ok){s=await r.json();localStorage.setItem('sb_sess',JSON.stringify(s))}else{localStorage.removeItem('sb_sess');return SITE.supabaseKey}}
  return s.access_token},
 async h(x){return{apikey:SITE.supabaseKey,Authorization:'Bearer '+await this.token(),...x}},
 async q(path,opt={}){const r=await fetch(this.url()+'/rest/v1/'+path,{...opt,headers:await this.h({'Content-Type':'application/json',Prefer:'return=representation',...(opt.headers||{})})});
  if(!r.ok)throw new Error(await r.text()||r.status);return r.status==204?null:r.json()},
 async login(email,password){const r=await fetch(this.url()+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:SITE.supabaseKey,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const j=await r.json();if(!r.ok)throw new Error(j.error_description||j.msg||'تعذّر تسجيل الدخول');localStorage.setItem('sb_sess',JSON.stringify(j));return j},
 logout(){localStorage.removeItem('sb_sess')},
 upload(file,path,onp){return new Promise(async(res,rej)=>{try{const x=new XMLHttpRequest(),h=await this.h({'x-upsert':'false'});
  x.open('POST',this.url()+'/storage/v1/object/lesson-files/'+path);for(const k in h)x.setRequestHeader(k,h[k]);
  x.setRequestHeader('Content-Type',file.type||'application/octet-stream');
  x.upload.onprogress=e=>onp&&e.lengthComputable&&onp(e.loaded/e.total);
  x.onload=()=>x.status<300?res(this.url()+'/storage/v1/object/public/lesson-files/'+path):rej(new Error(x.responseText));
  x.onerror=()=>rej(new Error('مشكلة في الاتصال'));x.send(file)}catch(e){rej(e)}})}
};
