import{e as t,t as n,U as m,j as e,i as o}from"./index-DUfQ_I8l.js";import{C as d}from"./Card-DSycFSEx.js";import{S as h}from"./shield-alert-DOaWLLU-.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=t("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=t("BadgeIndianRupee",[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",key:"3c2336"}],["path",{d:"M8 8h8",key:"1bis0t"}],["path",{d:"M8 12h8",key:"1wcyev"}],["path",{d:"m13 17-5-1h1a4 4 0 0 0 0-8",key:"nu2bwa"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=t("School",[["path",{d:"M14 22v-4a2 2 0 1 0-4 0v4",key:"hhkicm"}],["path",{d:"m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10",key:"1xqip1"}],["path",{d:"M18 5v17",key:"1sw6gf"}],["path",{d:"m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6",key:"9d2mlk"}],["path",{d:"M6 5v17",key:"1xfsm0"}],["circle",{cx:"12",cy:"9",r:"2",key:"1092wv"}]]),v=()=>{const{data:a}=n({queryKey:["admin-dashboard"],queryFn:()=>o.get("/admin/dashboard")}),s=(a==null?void 0:a.data)||{},l=[["Users",s.users,m],["Colleges",s.colleges,y],["Open reports",s.reports,h],["Revenue",`₹${Math.round((s.revenuePaise||0)/100)}`,p]];return e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-black font-display",children:"Admin Command"}),e.jsx("p",{className:"mt-2 text-sm text-slate-500",children:"Single-admin controls are locked to the ENV admin email."}),e.jsx("div",{className:"mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4",children:l.map(([c,r,i])=>e.jsxs(d,{children:[e.jsx(i,{className:"text-aurora"}),e.jsx("p",{className:"mt-5 text-sm text-slate-500",children:c}),e.jsx("p",{className:"text-3xl font-black",children:r??"-"})]},c))}),e.jsx(d,{className:"mt-4",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(x,{className:"text-flare"}),e.jsxs("div",{children:[e.jsx("h2",{className:"font-black",children:"Platform health"}),e.jsx("p",{className:"text-sm text-slate-500",children:"API, database, sockets, moderation queue, payment webhooks."})]})]})})]})};export{v as AdminPage};
//# sourceMappingURL=AdminPage-DlSSZKhI.js.map
