import '@testing-library/jest-dom'

// Mock Request and Response for Next.js server components
if (typeof global.Request === 'undefined') {
    global.Request = class Request {
        constructor(input, init) {
            this.url = typeof input === 'string' ? input : input.url;
            this.method = init?.method || 'GET';
        }
    };
}

if (typeof global.Response === 'undefined') {
    global.Response = class Response {
        constructor(body, init) {
            this._body = body;
            this.status = init?.status || 200;
            this.statusText = init?.statusText || '';
            this.headers = new Map(Object.entries(init?.headers || {}));
        }

        async json() {
            if (typeof this._body === 'string') {
                return JSON.parse(this._body);
            }
            return this._body;
        }

        static json(body, init) {
            return new Response(body, init);
        }
    };
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
        }
    },
    useSearchParams() {
        return new URLSearchParams()
    },
    usePathname() {
        return ''
    },
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
        promise: jest.fn(),
    },
}))

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