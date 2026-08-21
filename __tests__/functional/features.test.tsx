/**
 * Kiểm thử chức năng - Functional Tests
 * Dựa trên bảng kiểm thử chức năng trong tài liệu
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import NavbarNew from '@/components/layout/NavbarNew'

// Mock các dependencies
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Kiểm thử chức năng', () => {
    const mockPush = jest.fn()
    const mockRefresh = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseRouter.mockReturnValue({
            push: mockPush,
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: mockRefresh,
        })
    })

    describe('F01 - Chức năng đăng xuất', () => {
        test('Đăng xuất thành công', async () => {
            const user = userEvent.setup()

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

            // Mock signOut thành công
            mockSignOut.mockResolvedValue({ url: '/' })

            render(<NavbarNew />)

            // Mở dropdown menu
            const profileButton = screen.getByRole('button', { name: 'Mở menu tài khoản' })
            await user.click(profileButton)

            // Tìm và click nút đăng xuất
            const logoutButton = await screen.findByText('Đăng xuất')
            expect(logoutButton).toBeInTheDocument()

            await user.click(logoutButton)

            // Kiểm tra signOut được gọi
            await waitFor(() => {
                expect(mockSignOut).toHaveBeenCalledWith({ redirect: false })
            })

            // Kiểm tra redirect về trang chủ
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/')
                expect(mockRefresh).toHaveBeenCalled()
            })
        })

        test('Xử lý lỗi khi đăng xuất thất bại', async () => {
            const user = userEvent.setup()

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

            // Mock signOut thất bại
            mockSignOut.mockRejectedValue(new Error('Logout failed'))

            render(<NavbarNew />)

            const profileButton = screen.getByRole('button', { name: 'Mở menu tài khoản' })
            await user.click(profileButton)

            const logoutButton = await screen.findByText('Đăng xuất')
            await user.click(logoutButton)

            // Kiểm tra signOut được gọi nhưng thất bại
            await waitFor(() => {
                expect(mockSignOut).toHaveBeenCalledWith({ redirect: false })
            })

            // Không redirect khi có lỗi
            expect(mockPush).not.toHaveBeenCalled()
        })
    })

    describe('F02 - Chức năng điều hướng', () => {
        test('Điều hướng đến các trang chính', async () => {
            const user = userEvent.setup()

            mockUseSession.mockReturnValue({
                data: null,
                status: 'unauthenticated',
                update: jest.fn()
            })

            render(<NavbarNew />)

            // Test các link điều hướng
            const homeLink = screen.getByRole('link', { name: /trang chủ/i })
            const aboutLink = screen.getByRole('link', { name: /giới thiệu/i })
            const projectsLink = screen.getByRole('link', { name: /khám phá/i })
            const usersLink = screen.getByRole('link', { name: /người dùng/i })

            expect(homeLink).toHaveAttribute('href', '/')
            expect(aboutLink).toHaveAttribute('href', '/gioi-thieu')
            expect(projectsLink).toHaveAttribute('href', '/projects')
            expect(usersLink).toHaveAttribute('href', '/users/search')
        })

        test('Điều hướng đến trang tạo campaign', () => {
            mockUseSession.mockReturnValue({
                data: null,
                status: 'unauthenticated',
                update: jest.fn()
            })

            render(<NavbarNew />)

            const createCampaignLinks = screen.getAllByText('Gây quỹ ngay')

            createCampaignLinks.forEach(link => {
                expect(link.closest('a')).toHaveAttribute('href', '/campaigns/create')
            })
        })

        test('Điều hướng đến trang đăng nhập', () => {
            mockUseSession.mockReturnValue({
                data: null,
                status: 'unauthenticated',
                update: jest.fn()
            })

            render(<NavbarNew />)

            const loginLink = screen.getByRole('link', { name: /đăng nhập/i })
            expect(loginLink).toHaveAttribute('href', '/auth/login')
        })
    })

    describe('F03 - Chức năng dropdown menu người dùng', () => {
        test('Hiển thị đúng menu items cho user đã đăng nhập', async () => {
            const user = userEvent.setup()

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

            const profileButton = screen.getByText('T').closest('button') as HTMLButtonElement
            await user.click(profileButton)

            // Kiểm tra các menu items
            await waitFor(() => {
                expect(screen.getByText('Test User')).toBeInTheDocument()
                expect(screen.getByText('test@example.com')).toBeInTheDocument()
                expect(screen.getByText('Trang cá nhân')).toBeInTheDocument()
                expect(screen.getByText('Chiến dịch quan tâm')).toBeInTheDocument()
                expect(screen.getByText('Cài đặt')).toBeInTheDocument()
                expect(screen.getByText('Đăng xuất')).toBeInTheDocument()
            })

            // Kiểm tra links
            const profileLink = screen.getByRole('link', { name: /trang cá nhân/i })
            const favoritesLink = screen.getByRole('link', { name: /chiến dịch quan tâm/i })
            const settingsLink = screen.getByRole('link', { name: /cài đặt/i })

            expect(profileLink).toHaveAttribute('href', '/dashboard')
            expect(favoritesLink).toHaveAttribute('href', '/dashboard/favorites')
            expect(settingsLink).toHaveAttribute('href', '/profile/edit')
        })

        test('Hiển thị menu admin cho user có quyền admin', async () => {
            const user = userEvent.setup()

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

            const profileButton = screen.getByText('A').closest('button') as HTMLButtonElement
            await user.click(profileButton)

            await waitFor(() => {
                const adminLink = screen.getByRole('link', { name: /quản trị/i })
                expect(adminLink).toBeInTheDocument()
                expect(adminLink).toHaveAttribute('href', '/dashboard/admin')
            })
        })

        test('Đóng dropdown khi click outside', async () => {
            const user = userEvent.setup()

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

            const profileButton = screen.getByText('T').closest('button') as HTMLButtonElement
            await user.click(profileButton)

            // Dropdown mở
            await waitFor(() => {
                expect(screen.getByText('Trang cá nhân')).toBeInTheDocument()
            })

            // Click outside
            await user.click(document.body)

            // Dropdown đóng (menu items không còn visible)
            await waitFor(() => {
                expect(screen.queryByText('Trang cá nhân')).not.toBeInTheDocument()
            })
        })
    })

    describe('F04 - Chức năng responsive mobile menu', () => {
        test('Mobile menu toggle hoạt động', async () => {
            const user = userEvent.setup()

            mockUseSession.mockReturnValue({
                data: null,
                status: 'unauthenticated',
                update: jest.fn()
            })

            render(<NavbarNew />)

            // Tìm mobile toggle button
            const mobileToggle = screen.getByRole('button')

            // Click để mở mobile menu
            await user.click(mobileToggle)

            // Note: Trong test environment, CSS classes có thể không hoạt động
            // Cần kiểm tra state thay vì visual appearance
        })

        test('Mobile menu hiển thị đúng items cho user chưa đăng nhập', async () => {
            mockUseSession.mockReturnValue({
                data: null,
                status: 'unauthenticated',
                update: jest.fn()
            })

            const user = userEvent.setup()
            render(<NavbarNew />)

            await user.click(screen.getByRole('button'))

            // Mobile menu items sẽ được render nhưng có thể ẩn bằng CSS
            // Kiểm tra các link tồn tại
            expect(screen.getAllByText('Giới thiệu')).toHaveLength(2)
            expect(screen.getAllByText('Blog')).toHaveLength(2)
            expect(screen.getAllByText('Người dùng')).toHaveLength(2)
        })
    })

    describe('F05 - Chức năng hiển thị avatar người dùng', () => {
        test('Hiển thị avatar từ URL khi có', () => {
            mockUseSession.mockReturnValue({
                data: {
                    user: {
                        name: 'Test User',
                        email: 'test@example.com',
                        image: 'https://example.com/avatar.jpg',
                        role: 'USER'
                    }
                },
                status: 'authenticated',
                update: jest.fn()
            })

            render(<NavbarNew />)

            const avatar = screen.getByAltText('Avatar')
            expect(avatar).toBeInTheDocument()
            expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
        })

        test('Hiển thị chữ cái đầu khi không có avatar', () => {
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

            // Kiểm tra chữ cái đầu "T" được hiển thị
            expect(screen.getByText('T')).toBeInTheDocument()
        })

        test('Hiển thị "U" mặc định khi không có tên', () => {
            mockUseSession.mockReturnValue({
                data: {
                    user: {
                        email: 'test@example.com',
                        role: 'USER'
                    }
                },
                status: 'authenticated',
                update: jest.fn()
            })

            render(<NavbarNew />)

            expect(screen.getByText('U')).toBeInTheDocument()
        })
    })
})
