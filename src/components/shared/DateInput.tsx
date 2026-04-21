"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value: string; // ISO format: yyyy-mm-dd
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  min?: string;
  max?: string;
}

export function DateInput({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  className,
  required,
  min,
  max,
}: DateInputProps) {
  // Convert ISO (yyyy-mm-dd) to display format (dd/mm/yyyy)
  const formatDisplay = (isoDate: string): string => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  // Convert display format (dd/mm/yyyy) to ISO (yyyy-mm-dd)
  const formatISO = (displayDate: string): string => {
    if (!displayDate) return "";
    const parts = displayDate.split("/");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const [displayValue, setDisplayValue] = useState(formatDisplay(value));
  const [isFocused, setIsFocused] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Update display when value prop changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatDisplay(value));
    }
  }, [value, isFocused]);

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Remove non-numeric characters except /
    input = input.replace(/[^\d/]/g, "");

    // Parse current input
    const parts = input.split("/");

    // Validate and limit each part
    if (parts.length >= 1) {
      // Day: 01-31
      let day = parts[0];
      if (day.length === 1 && parseInt(day) > 3) {
        day = "0" + day;
        input = day + (parts.length > 1 ? "/" + parts.slice(1).join("/") : "");
      } else if (day.length === 2) {
        const dayNum = parseInt(day);
        if (dayNum > 31) {
          day = "31";
        } else if (dayNum === 0) {
          day = "01";
        }
        parts[0] = day;
        input = parts.join("/");
      }
    }

    if (parts.length >= 2) {
      // Month: 01-12
      let month = parts[1];
      if (month.length === 1 && parseInt(month) > 1) {
        month = "0" + month;
        parts[1] = month;
        input = parts.join("/");
      } else if (month.length === 2) {
        const monthNum = parseInt(month);
        if (monthNum > 12) {
          month = "12";
        } else if (monthNum === 0) {
          month = "01";
        }
        parts[1] = month;
        input = parts.join("/");
      }
    }

    if (parts.length >= 3) {
      // Year: 1900-2100
      let year = parts[2];
      if (year.length === 4) {
        const yearNum = parseInt(year);
        if (yearNum < 1900) {
          year = "1900";
        } else if (yearNum > 2100) {
          year = "2100";
        }
        parts[2] = year;
        input = parts.join("/");
      }
    }

    // Auto-add slashes
    if (input.length === 2 && !input.includes("/")) {
      input = input + "/";
    } else if (input.length === 5 && input.split("/").length === 2) {
      input = input + "/";
    }

    // Limit total length
    if (input.length > 10) {
      input = input.slice(0, 10);
    }

    setDisplayValue(input);

    // Reset invalid state when typing
    if (isInvalid) {
      setIsInvalid(false);
    }

    // If complete date, validate and convert to ISO
    if (input.length === 10 && input.split("/").length === 3) {
      const [day, month, year] = input.split("/");

      // Additional validation for days in month
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      // Check if date is valid
      if (isValidDateParts(dayNum, monthNum, yearNum)) {
        const isoDate = formatISO(input);
        onChange(isoDate);
        setIsInvalid(false);
      } else {
        // Invalid date - mark as invalid
        setIsInvalid(true);
        console.warn("Invalid date:", input);
      }
    }
  };

  // Validate date parts (day, month, year)
  const isValidDateParts = (day: number, month: number, year: number): boolean => {
    // Check ranges
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > 2100) return false;

    // Check days in month
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Leap year check
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    if (isLeapYear) {
      daysInMonth[1] = 29;
    }

    // Check if day is valid for the month
    if (day > daysInMonth[month - 1]) {
      return false;
    }

    return true;
  };

  const isValidDate = (isoDate: string): boolean => {
    const date = new Date(isoDate);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const openNativePicker = () => {
    nativeInputRef.current?.showPicker?.();
  };

  return (
    <div className="relative">
      {/* Display Input (Vietnamese format) */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleDisplayChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-12 py-3 text-sm text-gray-900 font-medium rounded-2xl bg-white border",
            "focus:outline-none focus:ring-2 transition-all",
            "placeholder:text-gray-400",
            isInvalid
              ? "border-red-300 focus:ring-red-200 focus:border-red-400"
              : "border-gray-200 focus:ring-orange-500 focus:border-orange-500",
            className
          )}
          required={required}
        />

        {/* Calendar Icon */}
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />

        {/* Calendar button to open native picker */}
        <button
          type="button"
          onClick={openNativePicker}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          tabIndex={-1}
          title="Chọn ngày"
        >
          <CalendarIcon size={18} />
        </button>
      </div>

      {/* Hidden Native Date Input (for picker) */}
      <input
        ref={nativeInputRef}
        type="date"
        value={value}
        onChange={handleNativeChange}
        min={min}
        max={max}
        className="absolute opacity-0 pointer-events-none"
        tabIndex={-1}
      />

      {/* Error message */}
      {isInvalid && (
        <p className="mt-1.5 text-xs text-red-600 font-medium">
          Ngày không hợp lệ. Vui lòng kiểm tra lại.
        </p>
      )}
    </div>
  );
}
