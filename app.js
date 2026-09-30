(() => {
const cfg=window.VR_CONFIG,app=document.getElementById("app");
const title=`Visualizing Reverse Lesson${cfg.lessonLabel}`;
document.title=title;
let translator=null;

function sets(){return cfg.sets.filter(s=>s.enabled).slice(0,6)}
function home(){
 app.innerHTML=`<div class="shell">
 <div class="brand"><h1>${title}</h1><p>Question • Compare • Identify</p></div>
 <section class="hero"><h2>Choose your set.</h2>
 <p>One student opens <b>Full Picture</b>. The partner opens <b>Answer</b>.</p>
 <div class="set-grid">${sets().map(s=>`<div class="set-card"><div class="set-head">Set ${s.id}</div><div class="role-actions">
 <button class="full-btn" data-set="${s.id}" data-role="full">Full Picture</button>
 <button class="answer-btn" data-set="${s.id}" data-role="answer">Answer</button>
 </div></div>`).join("")}</div></section></div>`;
 document.querySelectorAll("[data-set]").forEach(b=>b.onclick=()=>viewer(+b.dataset.set,b.dataset.role));
}

function panel(){
 return `<section class="translation-panel">
 <div class="translation-top"><div class="translation-title">Need help? Japanese → English</div>
 <div class="translation-hint">${cfg.translation.helperText}</div></div>
 <div class="translation-row">
 <textarea id="ti" class="translation-input" maxlength="${cfg.translation.maxChars}" placeholder="${cfg.translation.placeholder}"></textarea>
 <button id="tb" class="translate-btn">Translate</button></div>
 <div id="rw" class="translation-result-wrap"><div id="tr" class="translation-result"></div><button id="cp" class="copy-btn">Copy</button></div>
 <div id="st" class="translation-status"></div></section>`;
}

function viewer(id,role){
 const s=sets().find(x=>x.id===id); if(!s)return home();
 const full=role==="full", path=full?s.full:s.answer;
 app.innerHTML=`<div class="shell">
 <div class="viewer-head"><h2>Set ${id} — ${full?"Full Picture":"Answer"}</h2>
 <div class="viewer-actions"><button class="utility-btn" id="fs">Full Screen</button><button class="home-btn" id="hm">← Home</button></div></div>
 <section class="image-stage" id="stage"><img src="${path}" alt=""></section>
 ${full&&cfg.translation.enabled?panel():""}</div>`;
 document.getElementById("hm").onclick=home;
 document.getElementById("fs").onclick=async()=>{try{const st=document.getElementById("stage");document.fullscreenElement?await document.exitFullscreen():await st.requestFullscreen()}catch(e){}};
 if(full&&cfg.translation.enabled) setupTranslation();
}

function setupTranslation(){
 const input=document.getElementById("ti"),btn=document.getElementById("tb"),
 wrap=document.getElementById("rw"),out=document.getElementById("tr"),
 status=document.getElementById("st"),copy=document.getElementById("cp");

 const stat=(m,t="")=>{status.textContent=m;status.className=`translation-status ${t}`};

 async function getTranslator(){
   if(translator)return translator;
   if(!("Translator" in self)) throw new Error("このChromeではブラウザ内蔵翻訳を利用できません。");
   const opt={sourceLanguage:cfg.translation.sourceLanguage,targetLanguage:cfg.translation.targetLanguage};
   const av=await Translator.availability(opt);
   if(av==="unavailable"||av==null)throw new Error("この端末では日本語→英語の翻訳を利用できません。");
   if(av==="downloadable"||av==="downloading"){
     stat("初回のみ翻訳モデルを準備しています… 0%");
     translator=await Translator.create({...opt,monitor(m){m.addEventListener("downloadprogress",e=>stat(`初回のみ翻訳モデルを準備しています… ${Math.round(e.loaded*100)}%`))}});
   }else{
     translator=await Translator.create(opt);
   }
   return translator;
 }

 async function translate(){
   const text=input.value.trim();
   if(!text){stat("日本語を入力してください。","error");return}
   btn.disabled=true;btn.textContent="Translating…";wrap.classList.remove("show");
   try{
     const t=await getTranslator(); stat("翻訳しています…");
     out.textContent=await t.translate(text); wrap.classList.add("show"); stat("Ready","ok");
   }catch(e){
     let m=e.message||"翻訳できませんでした。";
     if(e.name==="NotAllowedError")m="Translateをもう一度押してください。初回モデル取得にはユーザー操作が必要です。";
     if(e.name==="NetworkError")m="翻訳モデルを取得できませんでした。インターネット接続を確認してください。";
     stat(m,"error");
   }finally{btn.disabled=false;btn.textContent="Translate"}
 }
 btn.onclick=translate;
 input.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();translate()}};
 copy.onclick=async()=>{try{await navigator.clipboard.writeText(out.textContent);copy.textContent="Copied";setTimeout(()=>copy.textContent="Copy",1000)}catch(e){}};
}
home();
})();