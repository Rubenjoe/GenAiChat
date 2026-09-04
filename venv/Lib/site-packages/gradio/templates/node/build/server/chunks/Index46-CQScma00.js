import { J as m$1 } from './2-CQ_Bz8hd.js';
import { f as f$1 } from './statustracker-cy5aG8h8.js';
import { n, V as Ve, _, i as ie, a as He, p as m, v, L as K } from './src3-h7ZBftxa.js';
import { s as spread_props, e as escape_html } from './renderer-Dic3PuWn.js';
import './async-Cv1-GZGV.js';
import './environment-nLIoW9uA.js';
import './chunk-B3kRsjbd.js';
import 'node:module';
import './server-CR3r1l-0.js';
import './html-CfyvkLET.js';

function f(f,p){f.component(f=>{let{$$slots:m$2,$$events:h,...g}=p,_$1=new m$1(g);_$1.watch_for_change();let S=false;_$1.props.value;let D=typeof window<`u`;function O(){}let k=true,A;function j(e){n(e,{visible:_$1.shared.visible,elem_id:_$1.shared.elem_id,elem_classes:_$1.shared.elem_classes,scale:_$1.shared.scale,min_width:_$1.shared.min_width,allow_overflow:false,padding:true,height:_$1.props.height,get fullscreen(){return S},set fullscreen(e){S=e,k=false;},children:e=>{_$1.shared.loading_status?(e.push(`<!--[0-->`),f$1(e,spread_props([{autoscroll:_$1.shared.autoscroll,i18n:_$1.i18n},_$1.shared.loading_status,{on_clear_status:()=>_$1.dispatch(`clear_status`,_$1.shared.loading_status)}]))):e.push(`<!--[-1-->`),e.push(`<!--]--> `),_$1.props.buttons?.length?(e.push(`<!--[0-->`),Ve(e,{buttons:_$1.props.buttons,on_custom_button_click:e=>{_$1.dispatch(`custom_button_click`,{id:e});},children:e=>{_$1.props.buttons?.some(e=>typeof e==`string`&&e===`export`)?(e.push(`<!--[0-->`),_(e,{Icon:ie,label:`Export`,onclick:O})):e.push(`<!--[-1-->`),e.push(`<!--]--> `),_$1.props.buttons?.some(e=>typeof e==`string`&&e===`fullscreen`)?(e.push(`<!--[0-->`),He(e,{fullscreen:S,onclick:e=>S=e})):e.push(`<!--[-1-->`),e.push(`<!--]-->`);}})):e.push(`<!--[-1-->`),e.push(`<!--]--> `),m(e,{show_label:_$1.shared.show_label,info:void 0,children:e=>{e.push(`<!---->${escape_html(_$1.shared.label)}`);}}),e.push(`<!----> `),_$1.props.value&&D?(e.push(`<!--[0-->`),e.push(`<div class="svelte-19utvcn"></div> `),_$1.props.caption?(e.push(`<!--[0-->`),e.push(`<p class="caption svelte-19utvcn">${escape_html(_$1.props.caption)}</p>`)):e.push(`<!--[-1-->`),e.push(`<!--]-->`)):(e.push(`<!--[-1-->`),v(e,{unpadded_box:true,children:e=>{K(e);}})),e.push(`<!--]-->`);},$$slots:{default:true}});}do k=true,A=f.copy(),j(A);while(!k);f.subsume(A);});}

export { f as default };
//# sourceMappingURL=Index46-CQScma00.js.map
