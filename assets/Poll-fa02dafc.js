var f=Object.defineProperty;var v=(t,s,e)=>s in t?f(t,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[s]=e;var u=(t,s,e)=>(v(t,typeof s!="symbol"?s+"":s,e),e);import{V as h,P as m,O as P,_ as y,o as p,a as _,b as n,t as l,F as b,G as g,H as O,I as w,p as x,h as I}from"./index-d4c20d77.js";var S=Object.defineProperty,$=Object.getOwnPropertyDescriptor,d=(t,s,e,r)=>{for(var o=r>1?void 0:r?$(s,e):s,i=t.length-1,a;i>=0;i--)(a=t[i])&&(o=(r?a(s,e,o):a(o))||o);return r&&o&&S(s,e,o),o};let c=class extends h{constructor(){super(...arguments);u(this,"f")}get max(){return Math.max(...this.f.options.map(e=>e.voter_count))}percent(e){return this.f.total_voter_count==0?"0%":(e.voter_count/this.f.total_voter_count*100).toFixed(0)+"%"}get subtitle(){let e=this.f.type=="REGULAR"?"Poll":"Quiz";return this.f.is_anonymous&&(e="Anonymous "+e),e}};d([m({required:!0})],c.prototype,"f",2);c=d([P({components:{}})],c);const F=t=>(x("data-v-c8a557d5"),t=t(),I(),t),R={id:"Poll"},q={class:"question"},z={class:"subtitle"},B={class:"text"},D=F(()=>n("span",{class:"f-grow1"},null,-1)),V={class:"percentage"},j={class:"tail"};function A(t,s,e,r,o,i){return p(),_("div",R,[n("div",q,l(t.f.question),1),n("div",z,l(t.subtitle),1),(p(!0),_(b,null,g(t.f.options,a=>(p(),_("div",{class:O(["options",{dominant:a.voter_count===t.max&&t.max!==0}])},[n("span",B,l(a.text),1),D,n("span",V,l(t.percent(a)),1),n("div",{class:"bar",style:w({width:t.percent(a)})},null,4)],2))),256)),n("div",j,"Final Results - "+l(t.f.total_voter_count)+" Responses",1)])}const L=y(c,[["render",A],["__scopeId","data-v-c8a557d5"]]);export{L as default};