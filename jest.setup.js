import '@testing-library/jest-dom'
const { TextEncoder, TextDecoder } = require('util')
const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web')
global.TextEncoder = global.TextEncoder || TextEncoder
global.TextDecoder = global.TextDecoder || TextDecoder
global.ReadableStream = global.ReadableStream || ReadableStream
global.WritableStream = global.WritableStream || WritableStream
global.TransformStream = global.TransformStream || TransformStream
const { Request: EdgeRequest, Response: EdgeResponse } = require('next/dist/compiled/@edge-runtime/primitives/fetch')

// Mock Request and Response for Next.js server components
if (typeof global.Request === 'undefined') {
    global.Request = EdgeRequest;
}

if (typeof global.Response === 'undefined') {
    global.Response = EdgeResponse;
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
    })),
    useSearchParams: jest.fn(() => new URLSearchParams()),
    usePathname: jest.fn(() => ''),
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(() => ({
        data: null,
        status: 'unauthenticated'
    })),
    signOut: jest.fn(),
    signIn: jest.fn(),
}))

// Mock sonner
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        promise: jest.fn((operation, messages) => Promise.resolve(operation).then(value => {
            messages?.success?.(value);
            return value;
        }).catch(error => {
            if (typeof messages?.error === 'function') messages.error(error);
            return undefined;
        })),
    },
}))

// Navbar is tested independently; the cart dropdown has its own provider tests.
jest.mock('@/components/products/CartProvider', () => ({
    CartDropdown: () => null,
}));

jest.mock('@/components/chat/ChatNotificationBadge', () => ({
    ChatNotificationBadge: () => null,
}));

// Mock fetch globally
global.fetch = jest.fn()

// Setup window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock ioredis
jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        scan: jest.fn().mockResolvedValue(['0', []]),
        flushall: jest.fn().mockResolvedValue('OK'),
        on: jest.fn(),
        status: 'ready',
    }));
});
