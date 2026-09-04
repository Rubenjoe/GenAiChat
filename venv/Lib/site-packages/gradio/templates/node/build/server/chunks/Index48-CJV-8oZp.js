import { J as m$1 } from './2-CQ_Bz8hd.js';
import { f } from './statustracker-cy5aG8h8.js';
import { n, V as Ve, p as m } from './src3-h7ZBftxa.js';
import { s as spread_props, a as attr_class, e as escape_html, f as attr, d as derived } from './renderer-Dic3PuWn.js';
import './async-Cv1-GZGV.js';
import './environment-nLIoW9uA.js';
import './chunk-B3kRsjbd.js';
import 'node:module';
import './server-CR3r1l-0.js';
import './html-CfyvkLET.js';

function o(o,s){o.component(o=>{let{$$slots:c,$$events:l,...u}=s,d=new m$1(u);d.props.value??=0,d.props.value;let f$1=derived(()=>!d.shared.interactive);n(o,{visible:d.shared.visible,elem_id:d.shared.elem_id,elem_classes:d.shared.elem_classes,padding:d.shared.container,allow_overflow:false,scale:d.shared.scale,min_width:d.shared.min_width,children:e=>{f(e,spread_props([{autoscroll:d.shared.autoscroll,i18n:d.i18n},d.shared.loading_status,{show_validation_error:false,on_clear_status:()=>{d.dispatch(`clear_status`,d.shared.loading_status);}}])),e.push(`<!----> <label${attr_class(`block svelte-16ty2ow`,void 0,{container:d.shared.container})}>`),d.shared.show_label&&d.props.buttons&&d.props.buttons.length>0?(e.push(`<!--[0-->`),Ve(e,{buttons:d.props.buttons,on_custom_button_click:e=>{d.dispatch(`custom_button_click`,{id:e});}})):e.push(`<!--[-1-->`),e.push(`<!--]--> `),m(e,{show_label:d.shared.show_label,info:d.props.info,children:e=>{e.push(`<!---->${escape_html(d.shared.label||`Number`)} `),d.shared.loading_status?.validation_error?(e.push(`<!--[0-->`),e.push(`<div class="validation-error svelte-16ty2ow">${escape_html(d.shared.loading_status?.validation_error)}</div>`)):e.push(`<!--[-1-->`),e.push(`<!--]-->`);}}),e.push(`<!----> <input${attr(`aria-label`,d.shared.label||`Number`)} type="number"${attr(`value`,d.props.value)}${attr(`min`,d.props.minimum)}${attr(`max`,d.props.maximum)}${attr(`step`,d.props.step)}${attr(`placeholder`,d.props.placeholder)}${attr(`disabled`,f$1(),true)}${attr_class(`svelte-16ty2ow`,void 0,{"validation-error":d.shared.loading_status?.validation_error})}/></label>`);},$$slots:{default:true}});});}

export { o as default };
//# sourceMappingURL=Index48-CJV-8oZp.js.map
