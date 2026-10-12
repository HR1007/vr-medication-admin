/** Resolve a file in /public against Vite's base path (needed on GitHub Pages). */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
