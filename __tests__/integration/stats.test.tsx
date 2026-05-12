/**
 * Kiểm thử tích hợp - Integration Tests
 * Kiểm thử tương tác giữa components và API
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import StatsSection from '@/components/shared/StatsSection'

describe('Kiểm thử tích hợp Stats Section', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('Tải và hiển thị stats thành công', async () => {
        const mockStats = {
            totalFunds: '2,500,000,000 VNĐ',
            totalFundsRaw: 2500000000,
            successfulCampaigns: 200,
            activeCampaigns: 35,
            totalBackers: 8500,
            transparencyRate: '99.8%',
            transparencyRateRaw: 99.8
        }

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => mockStats
        })

        await act(async () => {
            render(<StatsSection />)
        })

        // Đợi data load
        await waitFor(() => {
            expect(screen.getByText('2,500,000,000 VNĐ')).toBeInTheDocument()
        }, { timeout: 3000 })

        // Kiểm tra tất cả stats được hiển thị đúng
        expect(screen.getByText('200')).toBeInTheDocument()
        expect(screen.getByText('8.500')).toBeInTheDocument()
        expect(screen.getByText('99.8%')).toBeInTheDocument()

        // Kiểm tra trend messages
        expect(screen.getByText('35 chiến dịch đang hoạt động')).toBeInTheDocument()
        expect(screen.getByText('Đã hoàn thành mục tiêu')).toBeInTheDocument()
        expect(screen.getByText('Cộng đồng đang phát triển')).toBeInTheDocument()
        expect(screen.getByText('Zero hidden fees')).toBeInTheDocument()

        // Kiểm tra API được gọi đúng
        expect(global.fetch).toHaveBeenCalledWith('/api/stats', {
            signal: expect.any(AbortSignal),
            cache: 'no-store'
        })
    })

    test('Xử lý lỗi khi API thất bại', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

        global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

        await act(async () => {
            render(<StatsSection />)
        })

        // Đợi error handling
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching stats:', expect.any(Error))
        })

        consoleSpy.mockRestore()
    })

    test('Kiểm tra accessibility của stats cards', async () => {
        const mockStats = {
            totalFunds: '1,000,000 VNĐ',
            totalFundsRaw: 1000000,
            successfulCampaigns: 100,
            activeCampaigns: 20,
            totalBackers: 1000,
            transparencyRate: '100%',
            transparencyRateRaw: 100
        }

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => mockStats
        })

        await act(async () => {
            render(<StatsSection />)
        })

        await waitFor(() => {
            expect(screen.getByText('1,000,000 VNĐ')).toBeInTheDocument()
        })

        // Kiểm tra structure của stats cards
        const statsCards = screen.getAllByText(/Tổng tiền gây quỹ|Chiến dịch thành công|Người ủng hộ|Tỷ lệ minh bạch/)
        expect(statsCards).toHaveLength(4)

        // Kiểm tra mỗi stat có đầy đủ thông tin
        expect(screen.getByText('Tổng tiền gây quỹ')).toBeInTheDocument()
        expect(screen.getByText('Chiến dịch thành công')).toBeInTheDocument()
        expect(screen.getByText('Người ủng hộ')).toBeInTheDocument()
        expect(screen.getByText('Tỷ lệ minh bạch')).toBeInTheDocument()
    })
})