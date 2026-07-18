import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // L'unico ruolo autorizzato ad amministrare la piattaforma è "organizzatore",
    // assegnato via app_metadata sull'utente Supabase (mai via password/segreti
    // nel codice — vedi README per la procedura di creazione del Super Admin).
    const ruolo = (user.app_metadata as { role?: string } | undefined)?.role;
    if (ruolo !== "organizzatore") {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("accesso_negato", "1");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
