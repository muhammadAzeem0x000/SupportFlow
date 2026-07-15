import { createClient } from "@supabase/supabase-js";

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!serviceKey)throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
const supabase=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
const password="SupportFlowDemo2026!";
const users=[
  ["admin@acme.demo","Amina Shah","admin","acme"],["agent@acme.demo","Noah Carter","agent","acme"],["customer@acme.demo","Maya Patel","customer","acme"],
  ["admin@globex.demo","Omar Rahman","admin","globex"],["agent@globex.demo","Sofia Chen","agent","globex"],["customer@globex.demo","Liam Brooks","customer","globex"],
];
const {data:list,error:listError}=await supabase.auth.admin.listUsers({page:1,perPage:1000});if(listError)throw listError;
const ids=new Map();
for(const [email,fullName] of users){let user=list.users.find(item=>item.email===email);if(!user){const {data,error}=await supabase.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:fullName}});if(error)throw error;user=data.user;}else{await supabase.auth.admin.updateUserById(user.id,{password,user_metadata:{full_name:fullName}});}ids.set(email,user.id);}
const {data:orgs,error:orgError}=await supabase.from("organizations").upsert([{name:"Acme Technologies",slug:"acme"},{name:"Globex Solutions",slug:"globex"}],{onConflict:"slug"}).select();if(orgError)throw orgError;
const orgBySlug=new Map(orgs.map(org=>[org.slug,org.id]));
await new Promise(resolve=>setTimeout(resolve,500));
for(const [email,fullName] of users){const {error}=await supabase.from("profiles").upsert({id:ids.get(email),full_name:fullName});if(error)throw error;}
const memberRows=users.map(([email,,role,slug])=>({organization_id:orgBySlug.get(slug),user_id:ids.get(email),role,is_active:true}));
const {error:memberError}=await supabase.from("organization_members").upsert(memberRows,{onConflict:"user_id"});if(memberError)throw memberError;
const templates=[
  ["Cannot sign in after password reset","The password reset completed, but the dashboard sends me back to sign in.","account","urgent","open",-6,false],
  ["Invoice shows an unexpected charge","Our latest invoice includes a line item that we do not recognize.","billing","high","in_progress",12,true],
  ["Dashboard is slow on first load","The ticket dashboard takes more than fifteen seconds to display results.","technical","medium","open",36,true],
  ["Update company contact details","Please update the billing contact shown for our organization account.","account","low","resolved",60,true],
  ["PDF attachment will not open","A PDF downloaded from the ticket conversation appears to be corrupted.","technical","high","in_progress",18,true],
  ["Question about support coverage","Could you clarify which types of requests the current support desk handles?","general","low","closed",48,true],
  ["Two-factor code arrives late","The verification code frequently arrives after it has already expired.","account","urgent","resolved",2,true],
  ["Need help understanding invoice dates","The service dates on our invoice do not match the dates in the dashboard.","billing","medium","open",30,false],
];
for(const slug of ["acme","globex"]){const orgId=orgBySlug.get(slug);const customerId=ids.get(`customer@${slug}.demo`);const agentId=ids.get(`agent@${slug}.demo`);await supabase.from("tickets").delete().eq("organization_id",orgId);for(let i=0;i<templates.length;i++){const [title,description,category,priority,status,hours,assigned]=templates[i];const createdAt=new Date(Date.now()-(i+1)*8*3600000).toISOString();const dueAt=new Date(Date.now()+Number(hours)*3600000).toISOString();const firstResponse=status==="open"&&!assigned?null:new Date(new Date(createdAt).getTime()+2*3600000).toISOString();const {data:ticket,error}=await supabase.from("tickets").insert({organization_id:orgId,created_by:customerId,assigned_agent_id:assigned?agentId:null,title:`${slug==="globex"?"Globex: ":""}${title}`,description,category,priority,status,response_due_at:dueAt,first_agent_response_at:firstResponse,created_at:createdAt}).select().single();if(error)throw error;await supabase.from("ticket_events").insert([{organization_id:orgId,ticket_id:ticket.id,actor_id:customerId,event_type:"ticket_created",new_value:"open",created_at:createdAt},...(assigned?[{organization_id:orgId,ticket_id:ticket.id,actor_id:ids.get(`admin@${slug}.demo`),event_type:"agent_assigned",new_value:agentId,created_at:new Date(new Date(createdAt).getTime()+3600000).toISOString()}]:[])]);if(assigned){await supabase.from("comments").insert([{organization_id:orgId,ticket_id:ticket.id,author_id:customerId,body:"I can provide more information if that helps.",created_at:new Date(new Date(createdAt).getTime()+1800000).toISOString()},{organization_id:orgId,ticket_id:ticket.id,author_id:agentId,body:"Thanks for the details. I’m looking into this and will update you shortly.",created_at:firstResponse}]);}}}
console.log("SupportFlow demo data ready: 6 users, 2 organizations, 16 tickets.");
