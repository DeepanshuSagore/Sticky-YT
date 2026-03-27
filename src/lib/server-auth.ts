import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7);
}

export async function verifyRequestToken(request: NextRequest) {
  const cookieToken = request.cookies.get("stickyyt_session")?.value;
  const token = getBearerToken(request) ?? cookieToken;

  if (!token) {
    throw new UnauthorizedError();
  }

  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    throw new UnauthorizedError();
  }
}

export async function requireSessionUser(): Promise<DecodedIdToken> {
  const cookieStore = await cookies();
  const token = cookieStore.get("stickyyt_session")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    redirect("/");
  }
}
