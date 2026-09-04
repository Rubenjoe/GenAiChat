import { J as m$1 } from './2-CQ_Bz8hd.js';
import { f } from './statustracker-cy5aG8h8.js';
import { n, h, V as Ve, a as He, a2 as pe } from './src3-h7ZBftxa.js';
import { n as n$1 } from './Plot2-Bh7GKLuF.js';
import './async-Cv1-GZGV.js';
import { s as spread_props } from './renderer-Dic3PuWn.js';
import './environment-nLIoW9uA.js';
import './chunk-B3kRsjbd.js';
import 'node:module';
import './server-CR3r1l-0.js';
import './html-CfyvkLET.js';

function l(l,u){l.component(l=>{let{$$slots:d,$$events:f$1,...p}=u,m=new m$1(p),h$1=false,g=true,_;function v(e){n(e,{padding:false,elem_id:m.shared.elem_id,elem_classes:m.shared.elem_classes,visible:m.shared.visible,container:m.shared.container,scale:m.shared.scale,min_width:m.shared.min_width,allow_overflow:false,get fullscreen(){return h$1},set fullscreen(e){h$1=e,g=false;},children:e=>{h(e,{show_label:m.shared.show_label,label:m.shared.label||m.i18n(`plot.plot`),Icon:pe}),e.push(`<!----> `),m.props.buttons&&m.props.buttons.length>0||m.props.show_fullscreen_button?(e.push(`<!--[0-->`),Ve(e,{buttons:m.props.buttons??[],on_custom_button_click:e=>{m.dispatch(`custom_button_click`,{id:e});},children:e=>{m.props.show_fullscreen_button?(e.push(`<!--[0-->`),He(e,{fullscreen:h$1,onclick:e=>{h$1=e;}})):e.push(`<!--[-1-->`),e.push(`<!--]-->`);}})):e.push(`<!--[-1-->`),e.push(`<!--]--> `),f(e,spread_props([{autoscroll:m.shared.autoscroll,i18n:m.i18n},m.shared.loading_status,{on_clear_status:()=>m.dispatch(`clear_status`,m.shared.loading_status)}])),e.push(`<!----> `),n$1(e,{value:m.props.value,theme_mode:m.shared.theme_mode,show_label:m.shared.show_label,caption:m.props.caption,bokeh_version:m.props.bokeh_version,show_actions_button:m.props.show_actions_button,_selectable:m.props._selectable,x_lim:m.props.x_lim,show_fullscreen_button:m.props.show_fullscreen_button,on_change:()=>m.dispatch(`change`),onselect:e=>m.dispatch(`select`,e)}),e.push(`<!---->`);},$$slots:{default:true}});}do g=true,_=l.copy(),v(_);while(!g);l.subsume(_);});}

export { n$1 as BasePlot, l as default };
//# sourceMappingURL=Index50-CZwvOzwK.js.map
