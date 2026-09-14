import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before every gated route. Two jobs:
 *
 *  1. Refresh the Supabase session cookie, so Server Components downstream see
 *     a valid token rather than an expired one.
 *  2. Bounce unauthenticated visitors to the right sign-in screen.
 *
 * The membership checks (is this user staff? does this user have a portal
 * profile?) happen in the respective layouts — proxy only proves *a* session
 * exists, since it is deliberately kept free of shared modules and extra
 * database round trips.
 *
 * Note: `middleware.ts` is deprecated in Next 16; this is the `proxy` convention.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { pathname, search } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");

  // Demo mode — no credentials, so there is nothing to refresh. The admin panel
  // renders unlocked with a banner; the dashboard sends you to /login, which
  // explains why accounts are unavailable.
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser revalidates the token with Supabase; getSession would trust the
  // cookie as-is, which is not safe to gate on.
  //
  // If Supabase is unreachable we treat the request as unauthenticated rather
  // than letting the error escape — an outage should send people to the login
  // screen, not 500 the route, and it must never fail open.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("[proxy] session check failed", error);
  }

  const loginPath = isAdmin ? "/admin/login" : "/login";
  const isLogin = pathname === loginPath;

  if (!user && !isLogin) {
    const login = request.nextUrl.clone();
    login.pathname = loginPath;
    login.search = "";
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (user && isLogin) {
    const home = request.nextUrl.clone();
    home.pathname = isAdmin ? "/admin" : "/dashboard";
    home.search = "";
    return NextResponse.redirect(home);
  }

  return response;
}

export const config = {
  // Only the gated surfaces. The public site and static assets never enter
  // this path, so a marketing page never pays for a session round trip.
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
