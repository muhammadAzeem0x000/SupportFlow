import { NextResponse } from "next/server";
import { requireApiMember } from "@/lib/auth/api-member";
import { AppError, errorResponse } from "@/lib/errors";
import { databaseError } from "@/lib/errors/database";
import { ticketInputSchema } from "@/lib/validation/tickets";

export async function POST(request:Request){ try { const {supabase}=await requireApiMember(["customer"]); const parsed=ticketInputSchema.safeParse(await request.json()); if(!parsed.success) throw new AppError("VALIDATION_ERROR","Check the highlighted fields.",422,parsed.error.flatten().fieldErrors); const {data,error}=await supabase.rpc("create_ticket",{p_title:parsed.data.title,p_description:parsed.data.description,p_category:parsed.data.category,p_priority:parsed.data.priority}); if(error) throw databaseError(error.message); return NextResponse.json({ticket:data},{status:201}); } catch(error){return errorResponse(error);} }
