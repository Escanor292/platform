"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
    min?: string;
    step?: string;
    name?: string;
}

export function CurrencyInput({
    value,
    onChange,
    placeholder = "50.000",
    className,
    required,
    min = "1000",
    step = "1000",
    name,
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState(() => {
        // Format initial value if provided
        if (value && !isNaN(Number(value))) {
            return Number(value).toLocaleString('vi-VN');
        }
        return value || "";
    });

    const inputRef = useRef<HTMLInputElement>(null);

    // Format number with Vietnamese locale (dots as thousand separators)
    const formatNumber = (num: string): string => {
        // Remove all non-digit characters
        const cleanNum = num.replace(/\D/g, '');

        if (!cleanNum) return '';

        // Convert to number and format with Vietnamese locale
        return Number(cleanNum).toLocaleString('vi-VN');
    };

    // Get raw number value (remove formatting)
    const getRawValue = (formattedValue: string): string => {
        return formattedValue.replace(/\./g, '');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty input
        if (inputValue === '') {
            setDisplayValue('');
            onChange('');
            return;
        }

        // Remove all non-digit characters for processing
        const rawValue = inputValue.replace(/\D/g, '');

        // If no digits, clear the input
        if (!rawValue) {
            setDisplayValue('');
            onChange('');
            return;
        }

        // Format the display value
        const formatted = formatNumber(rawValue);
        setDisplayValue(formatted);

        // Pass raw numeric value to parent
        onChange(rawValue);
    };

    const handleFocus = () => {
        // Optional: Select all text on focus for easier editing
        setTimeout(() => {
            inputRef.current?.select();
        }, 0);
    };

    const handleBlur = () => {
        // Ensure proper formatting on blur
        if (value && !isNaN(Number(value))) {
            const formatted = Number(value).toLocaleString('vi-VN');
            setDisplayValue(formatted);
        }
    };

    // Update display value when prop value changes
    React.useEffect(() => {
        if (value !== undefined) {
            if (value === '' || value === '0') {
                setDisplayValue('');
            } else if (!isNaN(Number(value))) {
                const formatted = Number(value).toLocaleString('vi-VN');
                setDisplayValue(formatted);
            }
        }
    }, [value]);

    return (
        <div className="relative">
            {/* VND Symbol */}
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-lg">₫</span>

            {/* Input Field */}
            <input
                ref={inputRef}
                type="text"
                name={name}
                value={displayValue}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                required={required}
                className={cn(
                    "w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition",
                    "text-gray-900 placeholder:text-gray-400",
                    className
                )}
                inputMode="numeric"
            />
        </div>
    );
}