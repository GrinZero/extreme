(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const e of n)if(e.type==="childList")for(const l of e.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function r(n){const e={};return n.integrity&&(e.integrity=n.integrity),n.referrerPolicy&&(e.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?e.credentials="include":n.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function s(n){if(n.ep)return;n.ep=!0;const e=r(n);fetch(n.href,e)}})();const nt="/extreme/assets/typescript-f6ead1af.svg",ot="/extreme/vite.svg",W=new Set,X=o=>{if(!W.has(o)){const t=document.createElement("style");t.innerHTML=o,document.head.appendChild(t),W.add(o)}},_=()=>Math.random().toString(36).slice(2,10),k=(o,t)=>{const r=t.trim(),s=r.split(".");if(s.length>1){let n=o;for(let e=0;e<s.length;e++){if(!n)return;n=n[s[e]]}return n}else return o[r]};function A(o,t){let r=o;for(let e=o;e>=0;e--)if(t[e]==="<"){r=e;break}let s="";for(let e=r;e<t.length;e++)if(t[e]===" "||t[e]===">"||t[e]==="/"){s=t.slice(r,e+1),s=s.replace(/(<|>|\/)/g,"").trim();break}let n=o;t:for(let e=o;e<t.length;e++){if(t[e]==="<"&&t[e+1]==="/"){for(let l=e;l<t.length;l++)if(t[l]===">"){if(t.slice(e+2,l)!==s)continue;n=l+1;break t}}if(t[e]==="/"&&t[e+1]===">"){n=e+2;break}}return t.slice(r,n)}const P=o=>{var r;return(r=o.match(/id="(.*?)"/))==null?void 0:r[1]},z=(o,t)=>{var e;let r="";const s=o.indexOf(">"),n=o.indexOf("id=");return n===-1||n>s?(r=t,o=o.replace(">",` id="${r}">`)):r=((e=o.match(/id="(.*?)"/))==null?void 0:e[1])||_(),[o,r]},rt=o=>"W"+o.charCodeAt(0).toString(16),tt=(o,t,r={state:null,ref:null})=>{var Y;const{state:s,ref:n,methods:e}=r,l=new Set,w=new Set;{const u=new Set;t.replace(/{{(.*?)}}/g,(c,a,i)=>{const d=A(i,t);return u.add(d),c}),u.forEach(c=>{let a="";if(c.indexOf("id=")===-1){a=_();const i=c.replace(">",` id="${a}">`);t=t.replace(c,i)}}),t=t.replace(/id="{{(.*?)}}"/g,(c,a)=>{const i=a.trim();return n&&i in n?(w.add(i),`id="${n[i]}"`):c})}const L=new Map;if(t=t.replace(/@(.*?)}}"/g,(u,c,a)=>{const[i,d]=c.split('="{{'),v=A(a,t),g=P(v);if(e&&d in e&&g)if(!L.has(i))L.set(i,[[g,e[d]]]);else{const Q=L.get(i)||[];Q.push([g,e[d]]),L.set(i,Q)}return""}),s){const u=[];t=t.replace(/:for="(.*?)"/g,(c,a,i)=>{if(!s)return c;const[d,v]=a.trim().split(" in ").map(R=>R.trim()),g=A(i,t),Q=g.replace(c,""),f=A(t.indexOf(g)-1,t),[h,Z]=z(f,_()),j=k(s,v),V=R=>R.map((B,H)=>{const p=rt(String(B.key??H));let[C]=z(Q,p);return C=C.replace(/id="(.*?)"/g,(x,M)=>M===p?x:`id="${p}Y${M}"`),C=C.replace(/{{(.*?)}}/g,(x,M)=>{const y=k(B,M.replace(`${d}.`,""));return typeof y=="function"?y():y}),C});if(typeof j=="function"){const R=j((B,H)=>{const p=document.getElementById(Z);if(!p)return;const C=V(H),x=V(B),M=C.map(m=>P(m)),y=x.map(m=>P(m)),G=Array.from(p.children),K=new Set(y);if(y.length>0){for(let m=0;m<G.length;m++){const b=G[m],N=b.id;if(!N)continue;const S=y.indexOf(N),$=M.indexOf(N),I=x[S],F=C[S];if(S===$)I!==F&&I&&(b.outerHTML=I);else{const U=p.children[S+1];S>$?U?p.insertBefore(b,U):p.appendChild(b):p.insertBefore(b,U),I!==F&&I&&(b.outerHTML=I)}K.delete(N)}K.forEach(m=>{const b=y.indexOf(m),N=x[b],S=p.children[b+1],$=document.createElement("template");$.innerHTML=N;const I=$.content;S?p.insertBefore(I,S):p.appendChild(I)})}M.forEach(m=>{if(y.indexOf(m)===-1&&m){const b=document.getElementById(m);b&&b.remove()}})}),T=V(R);u.push([f,h.replace(g,T.join(""))])}return c}),u.forEach(([c,a])=>{t=t.replace(c,a)})}let E=t;E=t.replace(/{{(.*?)}}/g,(u,c,a)=>{if(!s)return`[without state "${c}"]`;if(c=c.trim(),n&&c in n)return w.add(c),n[c];const i=k(s,c);if(typeof i=="function"){const d=A(a,t);return l.add(d),u}return i});const D=Array.from(l);if(s)for(let u=0;u<D.length;u++){const a=D[u].replace(/{{(.*?)}}/g,(Q,f)=>{if(f=f.trim(),n&&f in n)return w.add(f),n[f];const h=k(s,f);return typeof h=="function"?Q:h});let i=a,d="";i.indexOf("id=")===-1?(d=_(),i=i.replace(">",` id="${d}">`)):d=((Y=i.match(/id="(.*?)"/))==null?void 0:Y[1])||_();const v=()=>i.replace(/{{(.*?)}}/g,(Q,f)=>{const h=k(s,f);return typeof h=="function"?h():h}),g=i.replace(/{{(.*?)}}/g,(Q,f)=>{const h=k(s,f);return typeof h=="function"?h(()=>{const Z=document.getElementById(d);Z&&(Z.outerHTML=v())}):h});E=E.replace(a,g)}return o.innerHTML=E,L.forEach((u,c)=>{const a=new Map;u.forEach(([i,d])=>{a.set(i,d)}),o.addEventListener(c,i=>{const d=i.target;if(d.id){const v=a.get(d.id);v&&v(i);return}for(const[v,g]of a){const Q=document.getElementById(v);if(Q&&Q.contains(d)&&g){g(i);return}}})}),o},et=()=>{const o=_(),t=()=>document.getElementById(o);return t.toString=()=>o,t},q=o=>{let t=o;const r=new Set;return[e=>(e&&r.add(e),t),e=>{if(t===e)return;const l=t;t=e,r.forEach(w=>w(t,l))}]},st=(o,t)=>{t.forEach(r=>{r(s=>{o(s)})})},it=".hello-world{color:red}.github-icon{background-color:#fff;border-radius:100%;overflow:hidden;border:1px solid #ccc}",ct='<div><h1>Counter <a href="https://github.com/GrinZero/extreme/tree/main/apps/demo/src/components/counter" target="_blank"><svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="github-icon"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg></a></h1><p>{{title}}</p><p>Count: {{ count }}</p><button @click="{{increment}}">Increment</button> <button @click="{{decrement}}">Decrement</button> <button @click="{{handleSubmit}}">Submit</button> <button id="{{resetRef}}">Reset</button></div>',at=o=>{var O;X(it);const t=et(),[r,s]=q(0),[n,e]=q("the form is not submit"),E=tt(o,ct,{state:{count:r,title:n},ref:{resetRef:t},methods:{decrement:()=>{s(r()-1)},increment:()=>{s(r()+1)},handleSubmit:()=>{e("submit success")}}});return r(D=>{console.log("newV",D)}),st(()=>{console.log("count&title",r(),n())},[r,n]),(O=t())==null||O.addEventListener("click",()=>{s(0),e("the form is not submit")}),E},dt=".list{height:144px;overflow:auto}",lt='<div><h1>List <a href="https://github.com/GrinZero/extreme/tree/main/apps/demo/src/components/list" target="_blank"><svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="github-icon"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg></a></h1><ul class="list" id="{{listRef}}"><li :for="item in items"><a src="{{item.src}}">{{item.title}}</a><p>{{item.content}}</p></li></ul><button @click="{{handleAdd}}">Add</button> <button @click="{{handleUpdate}}">Update</button> <button @click="{{handleReset}}">Reset</button> <button @click="{{handleMove}}">Move</button> <button @click="{{handleClear}}">Clear</button></div>',J=[{src:"https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",content:"这是一段描述1",title:"这是一段标题1",key:1},{src:"https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",content:"这是一段描述2",title:"这是一段标题2",key:2}],ut=o=>{X(dt);const[t,r]=q(J),s=et();return tt(o,lt,{state:{items:t},methods:{handleClear:()=>{r([])},handleReset:()=>{r(J)},handleAdd:()=>{const O=t(),D=O.length>0?Math.max(...O.map(u=>u.key))+1:1;r([...t(),{src:"https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",content:"这是一段描述"+D,title:"这是一段标题"+D,key:D}]);const Y=s();Y&&(Y.scrollTop=Y.scrollHeight)},handleMove:()=>{r([{src:"https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",content:"这是一段描述",title:"这是一段标题",key:2},{src:"https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",content:"这是一段描述Move+Update",title:"这是一段标题Move+Update",key:1}])},handleUpdate:()=>{r([{src:"https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",content:"这是一段描述[key没有变化]",title:"这是一段标题",key:1},{src:"https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",content:"这是一段描述",title:"这是一段标题",key:2}])}},ref:{listRef:s}})};document.querySelector("#app").innerHTML=`
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${ot}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${nt}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + Extreme</h1>
    <div class="card">
      <button id="counter" type="button"></button>
      <button id="list" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;at(document.querySelector("#counter"));ut(document.querySelector("#list"));