import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "API moved to Supabase client-side" }, { status: 501 });
}

export async function PUT() {
  return NextResponse.json({ error: "API moved to Supabase client-side" }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ error: "API moved to Supabase client-side" }, { status: 501 });
}
