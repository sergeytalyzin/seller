import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PAGES = [
  "/dashboard",
  "/products",
  "/costs",
  "/expenses",
  "/settings",
];

function withCookies(target: NextResponse, source: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Supabase ещё не настроен — работаем без авторизации (режим разработки)
  if (!supabaseUrl || !supabaseKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Обновляет сессию; не убирать — иначе токены протухнут
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedPage = PROTECTED_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!user && pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Войдите в приложение" },
      { status: 401 },
    );
  }

  if (!user && isProtectedPage) {
    return withCookies(
      NextResponse.redirect(new URL("/login", request.url)),
      response,
    );
  }

  if (user && (pathname === "/login" || pathname === "/")) {
    return withCookies(
      NextResponse.redirect(new URL("/dashboard", request.url)),
      response,
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
