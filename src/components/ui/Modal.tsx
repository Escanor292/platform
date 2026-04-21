'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    showCloseButton?: boolean;
    closeOnBackdropClick?: boolean;
    closeOnEscape?: boolean;
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
};

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = '2xl',
    showCloseButton = true,
    closeOnBackdropClick = true,
    closeOnEscape = true
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Lock body scroll
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');

        // Handle escape key
        const handleEscape = (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === 'Escape') {
                onClose();
            }
        };

        if (closeOnEscape) {
            document.addEventListener('keydown', handleEscape);
        }

        // Focus management
        const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0] as HTMLElement;
        const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    e.preventDefault();
                }
            }
        };

        document.addEventListener('keydown', handleTabKey);
        firstElement?.focus();

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.classList.remove('modal-open');
            if (closeOnEscape) {
                document.removeEventListener('keydown', handleEscape);
            }
            document.removeEventListener('keydown', handleTabKey);
        };
    }, [isOpen, onClose, closeOnEscape]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    const modalContent = (
        <div
            className="modal-overlay fixed inset-0 z-[9999]"
            style={{
                zIndex: 9999,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}
        >
            {/* Backdrop */}
            <div
                className="modal-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleBackdropClick}
                style={{
                    zIndex: 9999,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                }}
            />

            {/* Modal Container - Always Centered */}
            <div
                ref={modalRef}
                className={`modal-content relative bg-white rounded-2xl shadow-2xl w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300 mx-4`}
                style={{
                    zIndex: 10000,
                    position: 'relative',
                    maxHeight: '90vh',
                    margin: '1rem'
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
                aria-describedby={description ? "modal-description" : undefined}
            >
                {/* Header */}
                {(title || description || showCloseButton) && (
                    <div className="flex items-start justify-between p-6 border-b border-gray-100">
                        <div className="flex-1">
                            {title && (
                                <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p id="modal-description" className="text-sm text-gray-600 mt-1">
                                    {description}
                                </p>
                            )}
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4 flex-shrink-0"
                                aria-label="Close modal"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );

    // Use portal to render at document root
    return typeof window !== 'undefined'
        ? createPortal(
            <div data-modal-portal="true">
                {modalContent}
            </div>,
            document.body
        )
        : null;
}