import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "de"];

const isProtectedPathname = (pathname: string) => {
  return (
    pathname.startsWith("/suggestions") ||
    (!pathname.startsWith("/crews/join") && pathname.startsWith("/crews"))
  );
};

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: "de",
});

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token != null,
    },
  }
);

export default async function middleware(req: NextRequest) {
  const locale = req.nextUrl.pathname.split("/")[1];
  const pathname = req.nextUrl.pathname.slice(locale.length + 1);
  if (!isProtectedPathname(pathname)) {
    return intlMiddleware(req);
  } else {
    const response = await (authMiddleware as any)(req);
    console.log(response, 1);
    if (!response.ok) {
      // Assuming the middleware sets a 401 status for unauthorized access
      return NextResponse.redirect(new URL("/", req.url));
    }
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
