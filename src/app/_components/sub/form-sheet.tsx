"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import {
    type DefaultValues,
    type FieldValues,
    type SubmitHandler,
    type UseFormReturn,
    useForm,
} from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { FlexibleSheet } from "./flexible-sheet"; // Your powerful sheet component

interface GenericFormSheetProps<T extends FieldValues> {
    // Sheet control props
    open: boolean;
    onOpenChange: (open: boolean) => void;

    // Form configuration
    schema: z.ZodType<T>;
    onSubmit: (data: T) => Promise<{ error?: string }>;
    defaultValues?: DefaultValues<T>;

    // A render prop to inject the form fields
    renderForm: (form: UseFormReturn<T>) => React.ReactNode;

    // UI Text and configuration
    uiText: {
        title: string;
        description: string;
        submitButton: string;
    };
    onSuccess?: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    trigger?: React.ReactNode;

}

export function GenericFormSheet<T extends FieldValues>({
    open,
    onOpenChange,
    schema,
    onSubmit,
    defaultValues,
    renderForm,
    uiText,
    onSuccess,
    size = 'md',
    trigger
}: GenericFormSheetProps<T>) {
    const [isPending, startTransition] = React.useTransition();

    const form = useForm<T>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    // Reset the form with new defaultValues when the sheet is opened or data changes
    React.useEffect(() => {
        if (open && defaultValues) {
            form.reset(defaultValues);
        }
    }, [open, defaultValues, form]);

    const handleFormSubmit: SubmitHandler<T> = (data) => {
        startTransition(async () => {
            const { error } = await onSubmit(data);

            if (error) {
                toast.error(error);
                return;
            }

            toast.success(`${uiText.title}d successfully!`);
            onOpenChange(false);
            onSuccess?.();
        });
    };

    return (
        <FlexibleSheet
            open={open}
            trigger={trigger}
            onOpenChange={onOpenChange}
            title={uiText.title}
            description={uiText.description}
            size={size}
            contentClassName="p-4"
            actions={[
                {
                    label: 'Cancel',
                    variant: 'outline',
                    onClick: () => onOpenChange(false),
                },
                {
                    label: uiText.submitButton,
                    onClick: () => form.handleSubmit(handleFormSubmit)(),
                    disabled: isPending,
                    loading: isPending,
                },
            ]}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit(handleFormSubmit)();
                }}
            >
                {/* The render prop injects the actual form fields */}
                {renderForm(form)}
            </form>
        </FlexibleSheet>
    );
}