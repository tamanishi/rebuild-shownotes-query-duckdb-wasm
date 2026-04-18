export type Shownote = {
    title: string | null
    link: string | null
}

export type Episode = {
    title: string
    link: string
    pubDate: string
    shownotes: Shownote[]
}
