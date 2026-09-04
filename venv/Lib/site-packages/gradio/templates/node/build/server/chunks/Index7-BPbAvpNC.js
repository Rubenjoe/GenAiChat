import { J as m$1 } from './2-CQ_Bz8hd.js';
import { f } from './statustracker-cy5aG8h8.js';
import './async-Cv1-GZGV.js';
import { f as attr, a as attr_class, i as stringify, b as attr_style, s as spread_props, d as derived } from './renderer-Dic3PuWn.js';

function r(e,r){e.component(e=>{let{$$slots:i,$$events:a,...o}=r,s=derived(()=>o.scale??null),c=derived(()=>o.min_width??0),l=derived(()=>o.elem_id??``),u=derived(()=>o.elem_classes??[]),d=derived(()=>o.visible??true),f$1=derived(()=>o.variant??`default`),p=derived(()=>o.loading_status);e.push(`<div${attr(`id`,l())}${attr_class(`column ${stringify(u().join(` `))}`,`svelte-siq5d6`,{compact:f$1()===`compact`,panel:f$1()===`panel`,hide:!d()})}${attr_style(``,{"flex-grow":s(),"min-width":`calc(min(${stringify(c())}px, 100%))`})}>`),p()&&p().show_progress?(e.push(`<!--[0-->`),f(e,spread_props([{autoscroll:o.autoscroll??false,i18n:o.i18n??(e=>e)},p(),{queue_size:p().queue_size??null,status:p()?p().status==`pending`?`generating`:p().status:null}]))):e.push(`<!--[-1-->`),e.push(`<!--]--> `),o.children?.(e),e.push(`<!----></div>`);});}function i(t,i){t.component(t=>{let{$$slots:a,$$events:o,...s}=i,c=new m$1(s);r(t,spread_props([c.shared,c.props,{children:e=>{s.children?.(e),e.push(`<!---->`);},$$slots:{default:true}}]));});}

export { i, r };
//# sourceMappingURL=Index7-BPbAvpNC.js.map
