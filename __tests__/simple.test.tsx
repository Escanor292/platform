/**
 * Test đơn giản để kiểm tra Jest setup
 */

describe('Kiểm thử cơ bản', () => {
    test('Jest hoạt động đúng', () => {
        expect(1 + 1).toBe(2)
    })

    test('String operations', () => {
        expect('TửTế Fund').toContain('Fund')
    })

    test('Array operations', () => {
        const testArray = ['Trang chủ', 'Giới thiệu', 'Khám phá']
        expect(testArray).toHaveLength(3)
        expect(testArray).toContain('Trang chủ')
    })
})