// Extended User type with additional fields
export interface ExtendedUser {
    id: string;
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    shippingAddress?: string | null;
    role?: string;
    status?: string;
    isAdmin?: boolean;
}