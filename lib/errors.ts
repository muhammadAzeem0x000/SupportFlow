import { NextResponse } from "next/server";
import type { AppErrorBody } from "@/lib/types";

export class AppError extends Error {
  constructor(public code: string, message: string, public status = 400, public fieldErrors?: Record<string, string[]>) {
    super(message);
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json<AppErrorBody>({ error: { code: error.code, message: error.message, fieldErrors: error.fieldErrors } }, { status: error.status });
  }
  console.error("Unexpected SupportFlow server error", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json<AppErrorBody>({ error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." } }, { status: 500 });
}
