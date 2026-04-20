"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
}>({
    value: "",
    onValueChange: () => { },
})

interface TabsProps {
    defaultValue: string
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    className?: string
}

const Tabs = ({ defaultValue, value: controlledValue, onValueChange, children, className }: TabsProps) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const value = controlledValue ?? internalValue
    const handleValueChange = onValueChange ?? setInternalValue

    return (
        <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center",
            className
        )}
        {...props}
    />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value: triggerValue, ...props }, ref) => {
    const { value, onValueChange } = React.useContext(TabsContext)
    const isActive = value === triggerValue

    return (
        <button
            ref={ref}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onValueChange(triggerValue)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                className
            )}
            {...props}
        />
    )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value: contentValue, children, ...props }, ref) => {
    const { value } = React.useContext(TabsContext)

    if (value !== contentValue) return null

    return (
        <div
            ref={ref}
            role="tabpanel"
            className={cn("focus-visible:outline-none", className)}
            {...props}
        >
            {children}
        </div>
    )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
