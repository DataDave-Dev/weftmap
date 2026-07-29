import { headers } from "next/headers";

/**
 * Emits a JSON-LD block carrying the per-request nonce from `src/proxy.ts`.
 * The CSP has no 'unsafe-inline', so an un-nonced inline script is blocked —
 * this mirrors how the layout already nonces its anti-FOUC theme script.
 *
 * `dangerouslySetInnerHTML` is safe here only because the payload is
 * JSON.stringify of server-controlled data (dictionaries and repo constants).
 * Never pass user input to this component.
 */
export default async function JsonLd({ data }: { data: object }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  // Escaping "<" prevents a "</script>" sequence inside any string from
  // closing the tag early. < is valid JSON, so parsers are unaffected.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // Browsers blank the nonce attribute in the DOM once the CSP is applied
      // (nonce hiding, an anti-exfiltration measure), so hydration would flag a
      // mismatch against the server HTML. Same reason the layout's inline theme
      // script is wrapped in suppressHydrationWarning.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
