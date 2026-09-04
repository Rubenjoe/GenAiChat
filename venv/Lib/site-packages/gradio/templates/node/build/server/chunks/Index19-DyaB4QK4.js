import { J as m$1 } from './2-CQ_Bz8hd.js';
import { f } from './statustracker-cy5aG8h8.js';
import { p as m, n } from './src3-h7ZBftxa.js';
export { default as BaseExample } from './Example10-8GKOSZX2.js';
import './tinycolor-D-nIUz6e.js';
import { f as attr, b as attr_style, c as bind_props, s as spread_props, d as derived, e as escape_html } from './renderer-Dic3PuWn.js';
import './async-Cv1-GZGV.js';
import './environment-nLIoW9uA.js';
import './chunk-B3kRsjbd.js';
import 'node:module';
import './server-CR3r1l-0.js';
import './html-CfyvkLET.js';

function l(e,t){e.component(e=>{let{value:r=void 0,label:i,info:a,disabled:l,show_label:u,on_input:d=()=>{},on_release:f=()=>{},on_submit:p=()=>{},on_blur:m$1=()=>{},on_focus:h=()=>{}}=t;m(e,{show_label:u,info:a,children:e=>{e.push(`<!---->${escape_html(i)}`);}}),e.push(`<!----> <div><button class="dialog-button svelte-nbn1m9"${attr(`aria-label`,i)}${attr(`disabled`,l,true)}${attr_style(``,{background:r})}></button> `),e.push(`<!--[-1-->`),e.push(`<!--]--></div>`),bind_props(t,{value:r});});}function u(n$1,i){n$1.component(n$1=>{let{$$slots:a,$$events:o,...c}=i,u=new m$1(c,{value:`#000000`});u.props.value;let d=derived(()=>u.shared.label||u.i18n(`color_picker.color_picker`)),f$1=true,p;function m(e){n(e,{visible:u.shared.visible,elem_id:u.shared.elem_id,elem_classes:u.shared.elem_classes,container:u.shared.container,scale:u.shared.scale,min_width:u.shared.min_width,children:e=>{f(e,spread_props([{autoscroll:u.shared.autoscroll,i18n:u.i18n},u.shared.loading_status,{on_clear_status:()=>u.dispatch(`clear_status`,u.shared.loading_status)}])),e.push(`<!----> `),l(e,{label:d(),info:u.props.info,show_label:u.shared.show_label,disabled:!u.shared.interactive,on_input:()=>u.dispatch(`input`),on_release:()=>u.dispatch(`release`,u.props.value),on_submit:()=>u.dispatch(`submit`),on_blur:()=>u.dispatch(`blur`),on_focus:()=>u.dispatch(`focus`),get value(){return u.props.value},set value(e){u.props.value=e,f$1=false;}}),e.push(`<!---->`);},$$slots:{default:true}});}do f$1=true,p=n$1.copy(),m(p);while(!f$1);n$1.subsume(p);});}

export { l as BaseColorPicker, u as default };
//# sourceMappingURL=Index19-DyaB4QK4.js.map
