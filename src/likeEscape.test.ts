import { describe, expect, it } from 'vitest'
import { escapeLikeKeyword } from './likeEscape'

describe('escapeLikeKeyword', () => {
    it('escapes backslash, percent, and underscore', () => {
        expect(escapeLikeKeyword('a\\b%c_d')).toBe('a\\\\b\\%c\\_d')
    })

    it('leaves plain text unchanged', () => {
        expect(escapeLikeKeyword('hello')).toBe('hello')
    })

    it('handles empty string', () => {
        expect(escapeLikeKeyword('')).toBe('')
    })

    it('escapes single wildcard characters at boundary', () => {
        expect(escapeLikeKeyword('%')).toBe('\\%')
        expect(escapeLikeKeyword('_')).toBe('\\_')
        expect(escapeLikeKeyword('\\')).toBe('\\\\')
    })

    it('escapes repeated special characters', () => {
        expect(escapeLikeKeyword('%%__\\\\')).toBe('\\%\\%\\_\\_\\\\\\\\')
    })
})
