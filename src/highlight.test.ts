import { describe, expect, it } from 'vitest'
import { escapeRegExpLiteral, splitForHighlight } from './highlight'

describe('escapeRegExpLiteral', () => {
    it('escapes regex metacharacters', () => {
        expect(escapeRegExpLiteral('a+b*c?')).toBe('a\\+b\\*c\\?')
    })
})

describe('splitForHighlight', () => {
    it('returns single text segment when keyword is empty', () => {
        expect(splitForHighlight('hello world', '')).toEqual([
            { kind: 'text', value: 'hello world' },
        ])
    })

    it('highlights case-insensitive matches', () => {
        expect(splitForHighlight('Foo foo FOO', 'foo')).toEqual([
            { kind: 'mark', value: 'Foo' },
            { kind: 'text', value: ' ' },
            { kind: 'mark', value: 'foo' },
            { kind: 'text', value: ' ' },
            { kind: 'mark', value: 'FOO' },
        ])
    })

    it('treats keyword with regex special chars as literal', () => {
        expect(splitForHighlight('price is $5.00', '$5.00')).toEqual([
            { kind: 'text', value: 'price is ' },
            { kind: 'mark', value: '$5.00' },
        ])
    })

    it('handles no match as single text segment', () => {
        expect(splitForHighlight('abc', 'xyz')).toEqual([{ kind: 'text', value: 'abc' }])
    })

    it('handles match at start and end boundaries', () => {
        expect(splitForHighlight('foo middle foo', 'foo')).toEqual([
            { kind: 'mark', value: 'foo' },
            { kind: 'text', value: ' middle ' },
            { kind: 'mark', value: 'foo' },
        ])
    })

    it('handles adjacent matches without empty text segments', () => {
        expect(splitForHighlight('aaaa', 'aa')).toEqual([
            { kind: 'mark', value: 'aa' },
            { kind: 'mark', value: 'aa' },
        ])
    })

    it('handles keyword longer than text', () => {
        expect(splitForHighlight('abc', 'abcd')).toEqual([{ kind: 'text', value: 'abc' }])
    })
})
