import { J as m$1 } from './2-CQ_Bz8hd.js';
import { f } from './statustracker-cy5aG8h8.js';
import { r } from './Index7-BPbAvpNC.js';
import { s as spread_props, a as attr_class, i as stringify, f as attr, b as attr_style, c as bind_props, d as derived } from './renderer-Dic3PuWn.js';
import './async-Cv1-GZGV.js';
import './environment-nLIoW9uA.js';
import './chunk-B3kRsjbd.js';
import 'node:module';
import './src3-h7ZBftxa.js';
import './html-CfyvkLET.js';
import './server-CR3r1l-0.js';

function a(e,t){e.component(e=>{let{open:n=true,width:a,position:o=`left`,elem_classes:s=[],elem_id:c=``,onexpand:l=()=>{},oncollapse:u=()=>{},children:d}=t,f=derived(()=>typeof a==`number`?`${a}px`:a),p=false;let h=derived(()=>s?.join(` `)||``);e.push(`<div${attr_class(`sidebar ${stringify(h())}`,`svelte-1uruprb`,{open:false,right:o===`right`,"reduce-motion":p})}${attr(`id`,c)}${attr_style(`width: ${stringify(f())}; ${stringify(o)}: calc(${stringify(f())} * -1)`)}><button class="toggle-button svelte-1uruprb" aria-label="Toggle Sidebar"><div class="chevron svelte-1uruprb"><span class="chevron-left svelte-1uruprb"></span></div></button> <div class="sidebar-content svelte-1uruprb">`),d?.(e),e.push(`<!----></div></div>`),bind_props(t,{open:n,position:o});});}function o(r$1,o){r$1.component(r$1=>{let{$$slots:s,$$events:c,...l}=o,u=new m$1(l),d=true,f$1;function p(e){f(e,spread_props([{autoscroll:u.shared.autoscroll,i18n:u.i18n},u.shared.loading_status])),e.push(`<!----> `),u.shared.visible?(e.push(`<!--[0-->`),a(e,{width:u.props.width,onexpand:()=>u.dispatch(`expand`),oncollapse:()=>u.dispatch(`collapse`),elem_classes:u.shared.elem_classes,elem_id:u.shared.elem_id,get open(){return u.props.open},set open(e){u.props.open=e,d=false;},get position(){return u.props.position},set position(e){u.props.position=e,d=false;},children:e=>{r(e,{children:e=>{l.children?.(e),e.push(`<!---->`);},$$slots:{default:true}});},$$slots:{default:true}})):e.push(`<!--[-1-->`),e.push(`<!--]-->`);}do d=true,f$1=r$1.copy(),p(f$1);while(!d);r$1.subsume(f$1);});}

export { o as default };
//# sourceMappingURL=Index53-DW9Ap3UT.js.map
