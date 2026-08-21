/**
 * Kiểm thử giao diện - Interface Tests
 * Dựa trên bảng kiểm thử giao diện trong tài liệu
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import NavbarNew from '@/components/layout/NavbarNew'
import StatsSection from '@/components/shared/StatsSection'

// Mock useSession
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

describe('Kiểm thử giao diện', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()
        global.fetch = jest.fn()
    })

    describe('S01 - Màn hình Trang chủ hiển thị đầy đủ theo thiết kế, không sai chính tả', () => {
        test('Đầy đủ, không sai chính tả', async () => {
            // Mock session không đăng nhập
            mockUseSession.mockReturnValue({
                data: null,
                status: 'unauthenticated',
                update: jest.fn()
            })

            render(<NavbarNew />)

            // Kiểm tra logo và tên trang
            expect(screen.getByText('TửTế Fund')).toBeInTheDocument()

            // Kiểm tra các menu chính
            expect(screen.getByText('Trang chủ')).toBeInTheDocument()
            expect(screen.getByText('Giới thiệu')).toBeInTheDocument()
            expect(screen.getByText('Khám phá')).toBeInTheDocument()
            expect(screen.getByText('Cộng đồng')).toBeInTheDocument()

            // Kiểm tra nút đăng nhập và gây quỹ
            expect(screen.getByText('Đăng nhập')).toBeInTheDocument()
            expect(screen.getByText('Gây quỹ ngay')).toBeInTheDocument()
        })

        test('Kiểm tra responsive design trên mobile', () => {
            mockUseSession.mockReturnValue({
                data: null,
                status: 'unauthenticated',
                update: jest.fn()
            })

            render(<NavbarNew />)

            // Kiểm tra có mobile menu button
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThan(0)
        })
    })

    describe('S02 - Màn hình giới thiệu hiển thị đầy đủ theo thiết kế, không sai chính tả', () => {
        test('Đầy đủ, Có lỗi chính tả ở ....', async () => {
            // Mock fetch cho stats API
            const mockStats = {
                totalFunds: '1,234,567,890 VNĐ',
                totalFundsRaw: 1234567890,
                successfulCampaigns: 150,
                activeCampaigns: 25,
                totalBackers: 5000,
            }

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => mockStats
            })

            render(<StatsSection />)

            // Kiểm tra tiêu đề section
            expect(screen.getByText('Sức mạnh cộng đồng trong con số')).toBeInTheDocument()
            expect(screen.getByText('Những thống kê thực tế từ hành trình của chúng tôi')).toBeInTheDocument()

            // Đợi stats load
            await waitFor(() => {
                expect(screen.getByText('1,234,567,890 VNĐ')).toBeInTheDocument()
            })

            // Kiểm tra các label stats
            expect(screen.getByText('Tổng tiền gây quỹ')).toBeInTheDocument()
            expect(screen.getByText('Chiến dịch thành công')).toBeInTheDocument()
            expect(screen.getByText('Người ủng hộ')).toBeInTheDocument()
            expect(screen.getAllByText(/Tổng tiền gây quỹ|Chiến dịch thành công|Người ủng hộ/)).toHaveLength(3)
        })
    })

    describe('Kiểm thử tương tác giao diện', () => {
        test('Menu dropdown hoạt động đúng khi đã đăng nhập', async () => {
            // Mock session đã đăng nhập
            mockUseSession.mockReturnValue({
                data: {
                    user: {
                        name: 'Test User',
                        email: 'test@example.com',
                        role: 'USER'
                    }
                },
                status: 'authenticated',
                update: jest.fn()
            })

            render(<NavbarNew />)

            // Tìm profile button bằng cách tìm button có chứa avatar
            const buttons = screen.getAllByRole('button')
            const profileButton = buttons.find(btn =>
                btn.querySelector('div')?.textContent === 'T'
            )

            expect(profileButton).toBeTruthy()
            fireEvent.click(profileButton!)

            // Kiểm tra dropdown menu xuất hiện
            await waitFor(() => {
                expect(screen.getByText('Trang cá nhân')).toBeInTheDocument()
                expect(screen.getByText('Quản lý dự án')).toBeInTheDocument()
                expect(screen.getByText('Dự án quan tâm')).toBeInTheDocument()
                expect(screen.getByText('Cài đặt')).toBeInTheDocument()
                expect(screen.getByText('Đăng xuất')).toBeInTheDocument()
            })
        })
    })

    describe('Kiểm thử hiển thị admin menu', () => {
        test('Admin menu hiển thị cho user có role ADMIN', async () => {
            mockUseSession.mockReturnValue({
                data: {
                    user: {
                        name: 'Admin User',
                        email: 'admin@example.com',
                        role: 'ADMIN',
                        isAdmin: true
                    }
                },
                status: 'authenticated',
                update: jest.fn()
            })

            render(<NavbarNew />)

            const buttons = screen.getAllByRole('button')
            const profileButton = buttons.find(btn =>
                btn.querySelector('div')?.textContent === 'A'
            )

            expect(profileButton).toBeTruthy()
            fireEvent.click(profileButton!)

            await waitFor(() => {
                expect(screen.getByText('Quản trị')).toBeInTheDocument()
            })
        })

        test('Admin menu không hiển thị cho user thường', async () => {
            mockUseSession.mockReturnValue({
                data: {
                    user: {
                        name: 'Regular User',
                        email: 'user@example.com',
                        role: 'USER'
                    }
                },
                status: 'authenticated',
                update: jest.fn()
            })

            render(<NavbarNew />)

            const buttons = screen.getAllByRole('button')
            const profileButton = buttons.find(btn =>
                btn.querySelector('div')?.textContent === 'R'
            )

            expect(profileButton).toBeTruthy()
            fireEvent.click(profileButton!)

            await waitFor(() => {
                expect(screen.queryByText('Quản trị')).not.toBeInTheDocument()
            })
        })
    })
})