import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z, ZodSchema } from "zod";

type ApiHandler<T> = (
  request: NextRequest,
  session: Session
) => Promise<NextResponse<T | { error: string }>>;

interface HandlerFactoryOptions<C, R> {
  // Handler untuk GET (Read all)
  getHandler: (session: Session, params?: URLSearchParams) => Promise<R>;

  // Handler untuk POST (Create)
  postHandler?: {
    action: (data: C, session: Session) => Promise<unknown>;
    schema: ZodSchema<C>;
    allowedRoles?: string[];
  };
}

export function createApiHandlers<C, R>({
  getHandler,
  postHandler,
}: HandlerFactoryOptions<C, R>) {
  const GET = async (request: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const result = await getHandler(session, request.nextUrl.searchParams);
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof Error) {
        console.error("API GET Error:", error.message);
        if (error.stack) console.error("Stack:", error.stack);
        return NextResponse.json(
          { error: error.message, stack: error.stack },
          { status: 500 }
        );
      } else {
        console.error("API GET Error:", error);
        return NextResponse.json(
          { error: "Failed to fetch data.", detail: error },
          { status: 500 }
        );
      }
    }
  };

  const POST = async (request: NextRequest) => {
    if (!postHandler) {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Cek role jika diperlukan
      if (
        postHandler.allowedRoles &&
        !postHandler.allowedRoles.includes(session.user.role)
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const body = await request.json();

      // Validasi body dengan Zod
      const validation = postHandler.schema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid input", issues: validation.error.issues },
          { status: 400 }
        );
      }

      const result = await postHandler.action(validation.data, session);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof Error) {
        console.error("API POST Error:", error.message);
        if (error.stack) console.error("Stack:", error.stack);
        return NextResponse.json(
          { error: error.message, stack: error.stack },
          { status: 500 }
        );
      } else {
        console.error("API POST Error:", error);
        return NextResponse.json(
          { error: "Failed to create data.", detail: error },
          { status: 500 }
        );
      }
    }
  };

  return { GET, POST };
}
