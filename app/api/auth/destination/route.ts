import { NextResponse } from "next/server";
import { requireApiMember } from "@/lib/auth/api-member";
import { errorResponse } from "@/lib/errors";
export async function GET(){ try { const {member}=await requireApiMember(); return NextResponse.json({destination:member.role==="customer"?"/customer/tickets":"/dashboard"}); } catch(error){ return errorResponse(error); } }
