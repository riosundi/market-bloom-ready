import { createFileRoute } from "@tanstack/react-router";
2: import { 
3:   Bike, 
4:   ShieldCheck, 
5:   Store, 
6:   Users, 
7:   TrendingUp, 
8:   CreditCard, 
9:   AlertCircle, 
10:   ArrowUpRight,
11:   Settings,
12:   Layers
13: } from "lucide-react";
14: import { useSuspenseQuery } from "@tanstack/react-query";
15: import { AppShell } from "@/components/app-shell";
16: import { Button } from "@/components/ui/button";
17: import { formatCurrency } from "@/lib/roles";
18: import { getCategories, getPlatformSettings } from "@/lib/products/products.functions";
19: import { supabase } from "@/integrations/supabase/client";
20: 
21: export const Route = createFileRoute("/_authenticated/admin")({
22:   head: () => ({
23:     meta: [
24:       { title: "Admin Dashboard | TILETA" },
25:       {
26:         name: "description",
27:         content: "Oversee users, stores, riders and platform activity on TILETA.",
28:       },
29:       { property: "og:title", content: "Admin Dashboard | TILETA" },
30:       {
31:         property: "og:description",
32:         content: "Oversee users, stores, riders and platform activity.",
33:       },
34:       { property: "og:type", content: "website" },
35:       { name: "twitter:card", content: "summary" },
36:       { name: "robots", content: "noindex" },
37:     ],
38:   }),
39:   component: AdminDashboard,
40: });
41: 
42: function AdminDashboard() {
43:   const { data: categories } = useSuspenseQuery({
44:     queryKey: ["admin-categories"],
45:     queryFn: () => getCategories(),
46:   });
47: 
48:   const { data: settings } = useSuspenseQuery({
49:     queryKey: ["admin-settings"],
50:     queryFn: () => getPlatformSettings(),
51:   });
52: 
53:   // Fetch platform stats
54:   const { data: stats } = useSuspenseQuery({
55:     queryKey: ["admin-stats"],
56:     queryFn: async () => {
57:       const [
58:         { count: userCount },
59:         { count: businessCount },
60:         { count: agentCount },
61:         { count: orderCount },
62:         { data: transactions }
63:       ] = await Promise.all([
64:         supabase.from("profiles").select("*", { count: 'exact', head: true }),
65:         supabase.from("businesses").select("*", { count: 'exact', head: true }),
66:         supabase.from("user_roles").select("*", { count: 'exact', head: true }).eq("role", "agent"),
67:         supabase.from("orders").select("*", { count: 'exact', head: true }),
68:         supabase.from("transactions").select("amount")
69:       ]);
70: 
71:       const totalVolume = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
72: 
73:       return {
74:         users: userCount || 0,
75:         businesses: businessCount || 0,
76:         agents: agentCount || 0,
77:         orders: orderCount || 0,
78:         volume: totalVolume
79:       };
80:     }
81:   });
82: 
83:   return (
84:     <AppShell 
85:       title="Admin dashboard" 
86:       subtitle="Platform-wide oversight and moderation."
87:       actions={
88:         <Button variant="outline" size="sm">
89:           <Settings className="mr-2 h-4 w-4" /> System Config
90:         </Button>
91:       }
92:     >
93:       <div className="grid gap-4 md:grid-cols-4">
94:         <Stat icon={Users} label="Total Users" value={stats.users.toString()} />
95:         <Stat icon={Store} label="Active Stores" value={stats.businesses.toString()} />
96:         <Stat icon={Bike} label="Active Agents" value={stats.agents.toString()} />
97:         <Stat icon={TrendingUp} label="Platform Volume" value={formatCurrency(stats.volume)} />
98:       </div>
99: 
100:       <div className="mt-8 grid gap-8 lg:grid-cols-2">
101:         <section className="space-y-4">
102:           <div className="flex items-center justify-between">
103:             <h2 className="text-xl font-bold flex items-center gap-2">
104:               <Layers className="h-5 w-5 text-primary" />
105:               Marketplace Categories
106:             </h2>
107:             <Button size="sm" variant="ghost">View All</Button>
108:           </div>
109:           <div className="rounded-2xl border bg-card divide-y overflow-hidden">
110:             {categories?.map((cat: any) => (
111:               <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
112:                 <div className="flex items-center gap-3">
113:                   <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
114:                     {cat.name[0]}
115:                   </div>
116:                   <div>
117:                     <p className="font-bold">{cat.name}</p>
118:                     <p className="text-xs text-muted-foreground">{cat.slug}</p>
119:                   </div>
120:                 </div>
121:                 <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${cat.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
122:                   {cat.is_active ? 'Active' : 'Hidden'}
123:                 </span>
124:               </div>
125:             ))}
126:           </div>
127:         </section>
128: 
129:         <section className="space-y-4">
130:           <h2 className="text-xl font-bold flex items-center gap-2">
131:             <ShieldCheck className="h-5 w-5 text-primary" />
132:             Platform Settings
133:           </h2>
134:           <div className="rounded-2xl border bg-card divide-y overflow-hidden">
135:             {settings?.map((s: any) => (
136:               <div key={s.key} className="p-4 flex items-center justify-between">
137:                 <div>
138:                   <p className="font-bold capitalize">{s.key.replace(/_/g, ' ')}</p>
139:                   <p className="text-xs text-muted-foreground">{s.description}</p>
140:                 </div>
141:                 <div className="flex items-center gap-4">
142:                   <span className="font-mono font-bold text-primary">
143:                     {typeof s.value === 'string' ? s.value : JSON.stringify(s.value)}
144:                   </span>
145:                   <Button size="icon" variant="ghost" className="h-8 w-8">
146:                     <ArrowUpRight className="h-4 w-4" />
147:                   </Button>
148:                 </div>
149:               </div>
150:             ))}
151:           </div>
152: 
153:           <div className="bg-primary/5 rounded-2xl border border-primary/10 p-6 flex items-start gap-4">
154:             <AlertCircle className="h-6 w-6 text-primary mt-1" />
155:             <div>
156:               <h3 className="font-bold">Security Notice</h3>
157:               <p className="text-sm text-muted-foreground mt-1">
158:                 Direct database edits for payments and user roles are restricted. Use the authorized moderation tools to ensure ledger integrity.
159:               </p>
160:               <Button size="sm" className="mt-4 rounded-xl">Audit System Logs</Button>
161:             </div>
162:           </div>
163:         </section>
164:       </div>
165:     </AppShell>
166:   );
167: }
168: 
169: function Stat({
170:   icon: Icon,
171:   label,
172:   value,
173: }: {
174:   icon: typeof Users;
175:   label: string;
176:   value: string;
177: }) {
178:   return (
179:     <div className="rounded-2xl border bg-card p-6">
180:       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
181:         <Icon className="h-5 w-5" />
182:       </div>
183:       <p className="mt-4 text-sm text-muted-foreground">{label}</p>
184:       <p className="text-2xl font-bold">{value}</p>
185:     </div>
186:   );
187: }
