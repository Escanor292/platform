/**
 * Test Utilities
 * Các helper functions và mock data cho testing
 */

import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock data cho testing
export const mockUserData = {
    regular: {
        name: 'Người dùng thường',
        email: 'user@example.com',
        role: 'USER',
        id: '1'
    },
    admin: {
        name: 'Quản trị viên',
        email: 'admin@example.com',
        role: 'ADMIN',
        isAdmin: true,
        id: '2'
    },
    creator: {
        name: 'Nhà sáng tạo',
        email: 'creator@example.com',
        role: 'CREATOR',
        id: '3'
    }
}

export const mockStatsData = {
    success: {
        totalFunds: '5,000,000,000 VNĐ',
        totalFundsRaw: 5000000000,
        successfulCampaigns: 500,
        activeCampaigns: 75,
        totalBackers: 15000
    },
    empty: {
        totalFunds: '0 VNĐ',
        totalFundsRaw: 0,
        successfulCampaigns: 0,
        activeCampaigns: 0,
        totalBackers: 0
    }
}

// Custom render function với providers nếu cần
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper để mock fetch responses
export const mockFetchSuccess = (data: any) => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => data,
        status: 200,
        statusText: 'OK'
    })
}

export const mockFetchError = (error: string = 'API Error', status: number = 500) => {
    global.fetch = jest.fn().mockRejectedValue(new Error(error))
}

export const mockFetchFailure = (status: number = 500, statusText: string = 'Internal Server Error') => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status,
        statusText,
        json: async () => ({ error: statusText })
    })
}

// Helper để tạo mock session
export const createMockSession = (userData: any = mockUserData.regular, status: string = 'authenticated') => ({
    data: status === 'authenticated' ? { user: userData } : null,
    status,
    update: jest.fn()
})

// Helper để kiểm tra text content có chứa các từ khóa
export const expectTextContent = (element: HTMLElement, keywords: string[]) => {
    const textContent = element.textContent || ''
    keywords.forEach(keyword => {
        expect(textContent).toContain(keyword)
    })
}

// Helper để đợi element xuất hiện
export const waitForElement = async (getElement: () => HTMLElement | null, timeout: number = 3000) => {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
        const element = getElement()
        if (element) return element

        await new Promise(resolve => setTimeout(resolve, 100))
    }

    throw new Error(`Element not found within ${timeout}ms`)
}

// Test data cho các scenario khác nhau
export const testScenarios = {
    interface: {
        S01: {
            id: 'S01',
            description: 'Màn hình Trang chủ hiển thị đầy đủ theo thiết kế, không sai chính tả',
            expectedResult: 'Đầy đủ, không sai chính tả',
            actualResult: 'Đầy đủ, không sai chính tả',
            status: 'Pass'
        },
        S02: {
            id: 'S02',
            description: 'Màn hình giới thiệu hiển thị đầy đủ theo thiết kế, không sai chính tả',
            expectedResult: 'Đầy đủ, không sai chính tả',
            actualResult: 'Đầy đủ, Có lỗi chính tả ở ....',
            status: 'Fail'
        }
    },
    functional: {
        F01: {
            id: 'F01',
            description: 'Chức năng đăng xuất',
            testCases: [
                'Đăng xuất thành công',
                'Xử lý lỗi khi đăng xuất thất bại',
                'Redirect về trang chủ sau khi đăng xuất'
            ]
        }
    }
}

// Validation helpers
export const validateVietnameseText = (text: string): boolean => {
    // Kiểm tra các lỗi chính tả thường gặp trong tiếng Việt
    const commonMistakes = [
        /\bkhông\s+sai\b/i, // "không sai" thay vì "không có sai"
        /\bđầy\s+đủ\b/i,    // kiểm tra "đầy đủ" có đúng không
        /\bthiết\s+kế\b/i,  // "thiết kế"
        /\bchính\s+tả\b/i   // "chính tả"
    ]

    return commonMistakes.some(pattern => pattern.test(text))
}

export const validateUIElements = (container: HTMLElement) => {
    // Kiểm tra các element UI cơ bản
    const requiredElements = [
        'button',
        'a[href]',
        'nav'
    ]

    return requiredElements.every(selector =>
        container.querySelector(selector) !== null
    )
}