import { Hono } from 'hono'
import { renderer } from './renderer'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
    return c.render(
    <div class="container mx-10 my-auto">
            <h1 class="my-4 text-4xl">Rebuild Shownote Search</h1>
            <input class="pl-2 w-96 h-10 border-2 rounded-xl disabled:bg-gray-200 disabled:cursor-not-allowed" type="search"
                placeholder="Type To Search Episodes, Shownotes..." id="keyword" disabled />
            <div id="loading-state" class="mt-4 flex items-center gap-3 text-blue-500" role="status" aria-live="polite">
                <div class="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
            </div>
            <div id="search-results"></div>
        </div>, {
            title: 'Rebuild Shownotes Search'
        }
    )
})

export default app
