const Fragment=Symbol('Fragment');let H=[],I=0,E=[],scheduled=false,rootComp=null,rootProps=null,rootEl=null;
function eq(a,b){return a&&b&&a.length===b.length&&a.every((x,i)=>Object.is(x,b[i]))}
function useState(init){const i=I++;if(!(i in H))H[i]=typeof init==='function'?init():init;const set=v=>{H[i]=typeof v==='function'?v(H[i]):v;schedule()};return[H[i],set]}
function useRef(v){const i=I++;if(!(i in H))H[i]={current:v};return H[i]}
function useMemo(fn,d){const i=I++,h=H[i];if(!h||!eq(h.d,d))H[i]={v:fn(),d};return H[i].v}
function useCallback(fn,d){return useMemo(()=>fn,d)}
function useEffect(fn,d){const i=I++,h=H[i];if(!h||!eq(h.d,d)){E.push(()=>{if(h&&h.c)h.c();const c=fn();H[i]={d,c}})}else H[i]=h}
function createElement(type,props,...children){return{type,props:props||{},children:children.flat(Infinity)}}
const React={createElement,Fragment};
function child(n){if(n==null||n===false||n===true)return document.createTextNode('');if(typeof n==='string'||typeof n==='number')return document.createTextNode(String(n));if(n.type===Fragment){const f=document.createDocumentFragment();n.children.forEach(x=>f.appendChild(child(x)));return f}if(typeof n.type==='function')return child(n.type({...n.props,children:n.children}));const el=document.createElement(n.type);const post=[];for(const[k,v]of Object.entries(n.props||{})){if(k==='children'||v==null||v===false)continue;if(k==='className')el.className=v;else if(k==='ref'){if(typeof v==='function')v(el);else v.current=el}else if(k==='style')Object.assign(el.style,v);else if(k.startsWith('on')&&typeof v==='function'){let ev=k.slice(2).toLowerCase();if(ev==='change'&&(n.type==='input'||n.type==='textarea'))ev=n.props.type==='file'?'change':'input';el.addEventListener(ev,v)}else if(k==='checked'||k==='disabled')el[k]=!!v;else if(k==='value'){post.push(()=>el.value=v)}else if(k==='tabIndex')el.tabIndex=v;else if(k==='htmlFor')el.htmlFor=v;else if(k.startsWith('data-')||k.startsWith('aria-')||k==='role'||k==='accept'||k==='type'||k==='min'||k==='max'||k==='maxLength')el.setAttribute(k,String(v));else try{el[k]=v}catch{el.setAttribute(k,String(v))}}
n.children.forEach(x=>el.appendChild(child(x)));post.forEach(f=>f());return el}
function render(){scheduled=false;I=0;E=[];const v=rootComp(rootProps);const n=child(v);rootEl.replaceChildren(n);const es=E.slice();E=[];es.forEach(f=>f())}
function schedule(){if(!scheduled){scheduled=true;queueMicrotask(render)}}
function mount(comp,props,el){rootComp=comp;rootProps=props;rootEl=el;render()}
