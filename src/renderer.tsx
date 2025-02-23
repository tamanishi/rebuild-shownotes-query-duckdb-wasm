import { jsxRenderer } from 'hono/jsx-renderer'

declare module 'hono' {
    interface ContextRenderer {
        (content: string | Promise<string>, props?: { title?: string }): Response
    }
}

export const renderer = jsxRenderer(
    ({ children, title }) => {
        return (
            <html>
                <head>
                    <title>{title}</title>
                    <link href="/static/style.css" rel="stylesheet" />
                    <script src="https://cdn.tailwindcss.com"></script>
                    {import.meta.env.PROD ? (
                        <script type="module" src="/static/client.js"></script>
                    ) : (
                        <script type="module" src="/src/client.ts"></script>
                    )}
                </head>
                <body>
                    {children}
                    <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "031832151d1e4eb98cd8a98c2399712f"}'></script>
                </body>
            </html>
        )
    },
    {
        docType: true
    }
)
