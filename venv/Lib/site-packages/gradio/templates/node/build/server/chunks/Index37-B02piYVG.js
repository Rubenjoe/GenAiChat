import { J as m$1, U as h$1, N as he } from './2-CQ_Bz8hd.js';
import { f } from './statustracker-cy5aG8h8.js';
import { n, V as Ve, h, K as j } from './src3-h7ZBftxa.js';
export { default as BaseExample } from './Example28-BHmu3_6X.js';
import { n as n$1 } from './HTML-Ba2viJD3.js';
import './async-Cv1-GZGV.js';
import { s as spread_props, a as attr_class, b as attr_style, d as derived } from './renderer-Dic3PuWn.js';
import './environment-nLIoW9uA.js';
import './chunk-B3kRsjbd.js';
import 'node:module';
import './server-CR3r1l-0.js';
import './html-CfyvkLET.js';
import 'fs';

function d(c,d){c.component(c=>{let{$$slots:f$1,$$events:p,...m}=d,h$2=m.children,g=new m$1(m),_=derived(()=>({value:g.props.value??``,label:g.shared.label,visible:g.shared.visible,...g.props.props}));g.props.value;async function v(e){try{let t=await he([e]),r=await g.shared.client.upload(t,g.shared.root,void 0,g.shared.max_file_size??void 0);if(r&&r[0])return {path:r[0].path,url:r[0].url};throw Error(`Upload failed`)}catch(e){throw g.dispatch(`error`,e instanceof Error?e.message:String(e)),e}}n(c,{visible:g.shared.visible,elem_id:g.shared.elem_id,elem_classes:g.shared.elem_classes,container:g.shared.container,padding:g.shared.padding!==false,overflow_behavior:`visible`,children:t=>{g.shared.show_label&&g.props.buttons&&g.props.buttons.length>0?(t.push(`<!--[0-->`),Ve(t,{buttons:g.props.buttons,on_custom_button_click:e=>{g.dispatch(`custom_button_click`,{id:e});}})):t.push(`<!--[-1-->`),t.push(`<!--]--> `),g.shared.show_label?(t.push(`<!--[0-->`),h(t,{Icon:j,show_label:g.shared.show_label,label:g.shared.label,float:true})):t.push(`<!--[-1-->`),t.push(`<!--]--> `),f(t,spread_props([{autoscroll:g.shared.autoscroll,i18n:g.i18n},g.shared.loading_status,{variant:`center`,on_clear_status:()=>g.dispatch(`clear_status`,g.shared.loading_status)}])),t.push(`<!----> <div${attr_class(`html-container svelte-1jts93g`,void 0,{pending:g.shared.loading_status?.status===`pending`&&g.shared.loading_status?.show_progress!==`hidden`,"label-padding":g.shared.show_label??void 0})}${attr_style(``,{"min-height":g.props.min_height&&g.shared.loading_status?.status!==`pending`?h$1(g.props.min_height):void 0,"max-height":g.props.max_height?h$1(g.props.max_height):void 0,"overflow-y":g.props.max_height?`auto`:void 0})}><!---->`),n$1(t,{props:_(),html_template:g.props.html_template,css_template:g.props.css_template,js_on_load:g.props.js_on_load,elem_classes:g.shared.elem_classes,visible:g.shared.visible===`hidden`?false:g.shared.visible,autoscroll:g.shared.autoscroll,apply_default_css:g.props.apply_default_css,head:g.props.head,component_class_name:g.props.component_class_name,upload:v,server:g.shared.server,onevent:e=>{g.dispatch(e.type,e.data);},onupdate_value:e=>{e.property===`value`?g.props.value=e.data:e.property===`label`?g.shared.label=e.data:e.property===`visible`&&(g.shared.visible=e.data);},children:e=>{h$2?.(e);}}),t.push(`<!----></div>`);},$$slots:{default:true}});});}

export { n$1 as BaseHTML, d as default };
//# sourceMappingURL=Index37-B02piYVG.js.map
