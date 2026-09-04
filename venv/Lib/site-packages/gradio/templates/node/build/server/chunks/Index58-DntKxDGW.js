import { J as m$1 } from './2-CQ_Bz8hd.js';
import { r } from './Index7-BPbAvpNC.js';
import { a as a$1 } from './Index56-DqK0-g1B.js';
import { g as getContext, f as attr, a as attr_class, i as stringify, b as attr_style, o as store_get, u as unsubscribe_stores, d as derived } from './renderer-Dic3PuWn.js';
import './async-Cv1-GZGV.js';
import './environment-nLIoW9uA.js';
import './chunk-B3kRsjbd.js';
import 'node:module';
import './statustracker-cy5aG8h8.js';
import './src3-h7ZBftxa.js';
import './html-CfyvkLET.js';
import './server-CR3r1l-0.js';

function a(e,a){e.component(e=>{var o;let{elem_id:s=``,elem_classes:c=[],label:l,id:u,visible:d,interactive:f,order:p,scale:m,component_id:h,onselect:g,children:_}=a,{register_tab:v,unregister_tab:y,selected_tab:b,selected_tab_index:x}=getContext(a$1),S=derived(()=>u??h);let C=derived(()=>d!==false&&d!==`hidden`);e.push(`<div${attr(`id`,s)}${attr_class(`tabitem ${stringify(c.join(` `))}`,`svelte-dmtrd3`,{"grow-children":m>=1})} role="tabpanel"${attr_style(``,{display:store_get(o??={},`$selected_tab`,b)===S()&&C()?`flex`:`none`,"flex-grow":m})}>`),r(e,{scale:m>=1?m:null,children:e=>{_?.(e),e.push(`<!---->`);},$$slots:{default:true}}),e.push(`<!----></div>`),o&&unsubscribe_stores(o);});}function o(t,n){t.component(t=>{let{$$slots:r,$$events:i,...o}=n,s=new m$1(o);a(t,{elem_id:s.shared.elem_id,elem_classes:s.shared.elem_classes,label:s.shared.label,visible:s.shared.visible,interactive:s.shared.interactive,id:s.props.id,order:s.props.order,scale:s.shared.scale,component_id:s.props.component_id,onselect:e=>s.dispatch(`select`,e),children:e=>{o.children?.(e),e.push(`<!---->`);}});});}

export { a as BaseTabItem, o as default };
//# sourceMappingURL=Index58-DntKxDGW.js.map
