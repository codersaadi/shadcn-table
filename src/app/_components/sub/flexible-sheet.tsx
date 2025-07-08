"use client";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import React from "react";

// Types for maximum flexibility and type safety
type SheetSide = "top" | "right" | "bottom" | "left";

interface SheetAction {
    label: string;
    onClick: () => void;
    variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
    disabled?: boolean;
    loading?: boolean;
}

interface FlexibleSheetProps {
    // Trigger configuration
    trigger?: React.ReactNode;
    triggerAsChild?: boolean;

    // Sheet configuration
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: SheetSide;

    // Header configuration
    title?: string;
    description?: string;
    showCloseButton?: boolean;
    headerActions?: React.ReactNode;

    // Content
    children: React.ReactNode;

    // Footer configuration
    actions?: SheetAction[];
    footerContent?: React.ReactNode;

    // Styling
    className?: string;
    contentClassName?: string;
    overlayClassName?: string;

    // Size configuration
    size?: "sm" | "md" | "lg" | "xl" | "full";

    // Behavior
    modal?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
}

const sizeClasses = {
    sm: "w-80 sm:w-96",
    md: "w-96 sm:w-[480px]",
    lg: "w-[480px] sm:w-[600px]",
    xl: "w-[600px] sm:w-[800px]",
    full: "w-full",
};

export const FlexibleSheet: React.FC<FlexibleSheetProps> = ({
    trigger,
    triggerAsChild = false,
    open,
    onOpenChange,
    side = "right",
    title,
    description,
    headerActions,
    children,
    actions,
    footerContent,
    className,
    contentClassName,
    overlayClassName,
    size = "md",
    modal = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
}) => {
    // Handle controlled/uncontrolled state
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

    const handleOpenChange = (newOpen: boolean) => {
        if (!closeOnOverlayClick && !newOpen) return;
        setIsOpen?.(newOpen);
    };

    // Build content class names
    const contentClasses = [sizeClasses[size], contentClassName]
        .filter(Boolean)
        .join(" ");

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange} modal={modal}>
            {trigger && (
                <SheetTrigger asChild={triggerAsChild} className={className}>
                    {trigger}
                </SheetTrigger>
            )}

            <SheetContent
                side={side}
                className={contentClasses}
                onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
                onPointerDownOutside={
                    closeOnOverlayClick ? undefined : (e) => e.preventDefault()
                }
                onInteractOutside={
                    closeOnOverlayClick ? undefined : (e) => e.preventDefault()
                }
            >
                {/* Header Section */}
                {(title || description || headerActions) && (
                    <SheetHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                        <div className="flex-1 space-y-1">
                            {title && (
                                <SheetTitle className="font-semibold text-lg leading-none tracking-tight">
                                    {title}
                                </SheetTitle>
                            )}
                            {description && (
                                <SheetDescription className="text-muted-foreground text-sm">
                                    {description}
                                </SheetDescription>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">{headerActions}</div>
                    </SheetHeader>
                )}

                {/* Content Section */}
                <div className="flex-1 overflow-auto">{children}</div>

                {/* Footer Section */}
                {(actions?.length || footerContent) && (
                    <SheetFooter className="flex-col space-y-2 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0">
                        {footerContent}
                        {actions?.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant || "default"}
                                onClick={action.onClick}
                                disabled={action.disabled || action.loading}
                                className="w-full sm:w-auto"
                            >
                                {action.loading ? "Loading..." : action.label}
                            </Button>
                        ))}
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
};

export const SheetCompound = {
    Root: Sheet,
    Trigger: SheetTrigger,
    Content: SheetContent,
    Header: SheetHeader,
    Title: SheetTitle,
    Description: SheetDescription,
    Footer: SheetFooter,
    Close: SheetClose,
};
