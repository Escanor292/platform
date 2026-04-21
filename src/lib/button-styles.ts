// Shared button styles for consistent UI across components

export const followButtonStyles = {
    // Style khi chưa follow (màu đỏ)
    inactive: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",

    // Style khi đã follow (màu xám)  
    active: "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100",

    // Base styles chung
    base: "font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2",

    // Icon colors
    iconInactive: "text-red-600",
    iconActive: "text-gray-600"
};

// Helper function để get full className
export const getFollowButtonClass = (isFollowing: boolean, additionalClasses = "") => {
    const stateClass = isFollowing ? followButtonStyles.active : followButtonStyles.inactive;
    return `${followButtonStyles.base} ${stateClass} ${additionalClasses}`.trim();
};

export const getFollowIconClass = (isFollowing: boolean) => {
    return isFollowing ? followButtonStyles.iconActive : followButtonStyles.iconInactive;
};