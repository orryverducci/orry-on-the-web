async function addHeaders(context: EventContext<unknown, string, Record<string, unknown>>): Promise<Response> {
    // Get the response
    let response: Response = await context.next();

    // Return the response if it's not a successful one
    if (response.status != 200) {
        return response;
    }

    // Get the request URL
    let url: URL = new URL(context.request.url);

    // Determine if accessed from production site domains and add a no robots header if not
    let production: boolean = false;

    if (url.hostname == "orryverducci.co.uk" || url.hostname == "www.orryverducci.co.uk") {
        production = true;
    } else {
        response.headers.append("X-Robots-Tag", "noindex");
    }

    // Add cache and robots headers on requests for assets
    if (url.pathname !== undefined && (url.pathname.startsWith("/assets") || url.pathname.startsWith("/fonts") || url.pathname.startsWith("/images"))) {
        response.headers.append("Cache-Control", "public");

        if (production) {
            response.headers.append("X-Robots-Tag", "nosnippet");
        }
    }

    // Add the security headers
    if (response.headers.has("Content-Type") && response.headers.get("Content-Type").includes("text/html")) {
        let nonce: Uint8Array = new Uint8Array(16);
        crypto.getRandomValues(nonce);
        let nonceText: string = btoa(String.fromCharCode.apply(null, nonce));

        response.headers.append("Content-Security-Policy", `default-src 'self'; style-src 'self' 'sha256-WAyOw4V+FqDc35lQPyRADLBWbuNK8ahvYEaQIYF1+Ps='; script-src 'self' 'nonce-${nonceText}' 'unsafe-eval' static.cloudflareinsights.com; connect-src 'self' cloudflareinsights.com; child-src 'none'; frame-ancestors 'none';`);
    }

    response.headers.append("X-Content-Type-Options", "nosniff");
    response.headers.append("X-Frame-Options" , "DENY");

    // Return the modified response
    return response;
}

export const onRequest: Array<PagesFunction> = [addHeaders];
