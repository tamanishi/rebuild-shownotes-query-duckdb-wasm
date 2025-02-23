import { Hono } from 'hono'
import { renderer } from './renderer'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
    return c.render(
        <div class="container mx-10 my-auto">
            <h1 class="my-4 text-4xl">Rebuild Shownote Search</h1>
            <input class="pl-2 w-96 h-10 border-2 rounded-xl" type="search"
                placeholder="Type To Search Episodes, Shownotes..." id="keyword" />
            <div id="search-results"></div>
        </div>, {
            title: 'Rebuild Shownotes Search'
        }
    )
})

export default app
