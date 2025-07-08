'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Archive, Ban, Edit, Loader, Trash, UserX } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

type ActionType = 'delete' | 'edit' | 'archive' | 'restore' | 'ban' | 'unban' | 'deactivate' | 'activate';

interface ActionConfig {
    type: ActionType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    confirmationTitle: string;
    confirmationDescription: string;
    successMessage: string;
    loadingMessage?: string;
}

const DEFAULT_ACTION_CONFIGS: Record<ActionType, Omit<ActionConfig, 'type'>> = {
    delete: {
        label: 'Delete',
        icon: Trash,
        variant: 'destructive',
        confirmationTitle: 'Delete Items',
        confirmationDescription: 'This action cannot be undone. This will permanently delete the selected items from our servers.',
        successMessage: 'Items deleted successfully',
        loadingMessage: 'Deleting items...'
    },
    edit: {
        label: 'Edit',
        icon: Edit,
        variant: 'outline',
        confirmationTitle: 'Edit Items',
        confirmationDescription: 'This will apply the selected changes to all selected items.',
        successMessage: 'Items updated successfully',
        loadingMessage: 'Updating items...'
    },
    archive: {
        label: 'Archive',
        icon: Archive,
        variant: 'outline',
        confirmationTitle: 'Archive Items',
        confirmationDescription: 'This will move the selected items to your archive. You can restore them later.',
        successMessage: 'Items archived successfully'
    },
    restore: {
        label: 'Restore',
        icon: Archive,
        variant: 'outline',
        confirmationTitle: 'Restore Items',
        confirmationDescription: 'This will restore the selected items from your archive.',
        successMessage: 'Items restored successfully'
    },
    ban: {
        label: 'Ban',
        icon: Ban,
        variant: 'destructive',
        confirmationTitle: 'Ban Users',
        confirmationDescription: 'This will ban the selected users from accessing the platform.',
        successMessage: 'Users banned successfully'
    },
    unban: {
        label: 'Unban',
        icon: UserX,
        variant: 'outline',
        confirmationTitle: 'Unban Users',
        confirmationDescription: 'This will restore access for the selected users.',
        successMessage: 'Users unbanned successfully'
    },
    deactivate: {
        label: 'Deactivate',
        icon: UserX,
        variant: 'outline',
        confirmationTitle: 'Deactivate Items',
        confirmationDescription: 'This will temporarily deactivate the selected items.',
        successMessage: 'Items deactivated successfully'
    },
    activate: {
        label: 'Activate',
        icon: UserX,
        variant: 'outline',
        confirmationTitle: 'Activate Items',
        confirmationDescription: 'This will activate the selected items.',
        successMessage: 'Items activated successfully'
    }
};

interface GenericActionDialogProps<TData>
    extends React.ComponentPropsWithoutRef<typeof Dialog> {
    data: TData[];
    itemName: string; // "task", "user", "product"
    action: ActionType | ActionConfig;
    onClick: (ids: string[]) => Promise<{ error?: string; message?: string }>;
    showTrigger?: boolean;
    triggerClassName?: string;
    onSuccess?: (data: TData[]) => void;
    onError?: (error: string, data: TData[]) => void;
    disabled?: boolean;
    requireConfirmation?: boolean;
    customMessages?: {
        confirmationTitle?: string;
        confirmationDescription?: string;
        successMessage?: string;
        errorMessage?: string;
    };
}

export function GenericActionDialog<TData extends { id: string; name?: string | null; title?: string | null }>({
    data,
    itemName,
    action,
    onClick,
    showTrigger = true,
    triggerClassName,
    onSuccess,
    onError,
    disabled = false,
    requireConfirmation = true,
    customMessages,
    ...props
}: GenericActionDialogProps<TData>) {
    const [isPending, startTransition] = React.useTransition();
    const [isOpen, setIsOpen] = React.useState(false);
    const isDesktop = useMediaQuery('(min-width: 640px)');

    // Get action configuration
    const actionConfig: ActionConfig = React.useMemo(() => {
        if (typeof action === 'string') {
            return { type: action, ...DEFAULT_ACTION_CONFIGS[action] };
        }
        return action;
    }, [action]);

    // Generate contextual messages
    const messages = React.useMemo(() => {
        const itemCount = data.length;
        const itemText = itemCount === 1 ? itemName : `${itemName}s`;
        const itemNames = data.length <= 3
            ? data.map(item => item.name || item.title || `${itemName} ${item.id}`).join(', ')
            : `${itemCount} ${itemText}`;

        return {
            confirmationTitle: customMessages?.confirmationTitle ||
                `${actionConfig.confirmationTitle} (${itemCount})`,
            confirmationDescription: customMessages?.confirmationDescription ||
                `${actionConfig.confirmationDescription} You are about to ${actionConfig.label.toLowerCase()} ${itemNames}.`,
            successMessage: customMessages?.successMessage ||
                `${itemCount} ${itemText} ${actionConfig.label.toLowerCase()}${actionConfig.type === 'delete' ? 'd' : actionConfig.type === 'edit' ? 'ed' : 'd'} successfully`,
            errorMessage: customMessages?.errorMessage ||
                `Failed to ${actionConfig.label.toLowerCase()} ${itemText}`
        };
    }, [data, itemName, actionConfig, customMessages]);

    const handleAction = React.useCallback(async () => {
        if (!requireConfirmation) {
            await executeAction();
        } else {
            setIsOpen(false);
            await executeAction();
        }
    }, [requireConfirmation]);

    const executeAction = React.useCallback(async () => {
        startTransition(async () => {
            try {
                const result = await onClick(data.map((item) => item.id));

                if (result.error) {
                    toast.error(result.error);
                    onError?.(result.error, data);
                    return;
                }

                const successMsg = result.message || messages.successMessage;
                toast.success(successMsg);
                onSuccess?.(data);

                if (requireConfirmation) {
                    props.onOpenChange?.(false);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : messages.errorMessage;
                toast.error(errorMsg);
                onError?.(errorMsg, data);
            }
        });
    }, [data, onClick, messages, onSuccess, onError, props, requireConfirmation]);

    // Handle direct action without confirmation
    const handleDirectAction = React.useCallback(async () => {
        if (!requireConfirmation) {
            await executeAction();
        } else {
            setIsOpen(true);
        }
    }, [requireConfirmation, executeAction]);

    const IconComponent = actionConfig.icon;

    const trigger = showTrigger ? (
        <Button
            variant={actionConfig.variant}
            size="sm"
            className={triggerClassName}
            disabled={disabled || isPending || data.length === 0}
            onClick={!requireConfirmation ? handleDirectAction : undefined}
        >
            {isPending ? (
                <Loader className="mr-2 size-4 animate-spin" />
            ) : (
                <IconComponent className="mr-2 size-4" />
            )}
            {actionConfig.label} ({data.length})
        </Button>
    ) : null;

    const dialogContent = (
        <>
            <DialogHeader>
                <DialogTitle>{messages.confirmationTitle}</DialogTitle>
                <DialogDescription className="text-left">
                    {messages.confirmationDescription}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:space-x-0">
                <DialogClose asChild>
                    <Button variant="outline" disabled={isPending}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button
                    variant={actionConfig.variant}
                    onClick={handleAction}
                    disabled={isPending}
                >
                    {isPending && <Loader className="mr-2 size-4 animate-spin" />}
                    {actionConfig.label}
                </Button>
            </DialogFooter>
        </>
    );

    const drawerContent = (
        <>
            <DrawerHeader>
                <DrawerTitle>{messages.confirmationTitle}</DrawerTitle>
                <DrawerDescription className="text-left">
                    {messages.confirmationDescription}
                </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="gap-2">
                <Button
                    variant={actionConfig.variant}
                    onClick={handleAction}
                    disabled={isPending}
                >
                    {isPending && <Loader className="mr-2 size-4 animate-spin" />}
                    {actionConfig.label}
                </Button>
                <DrawerClose asChild>
                    <Button variant="outline" disabled={isPending}>
                        Cancel
                    </Button>
                </DrawerClose>
            </DrawerFooter>
        </>
    );

    if (!requireConfirmation && showTrigger) {
        return trigger;
    }

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen} {...props}>
                {showTrigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>{dialogContent}</DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen} {...props}>
            {showTrigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
            <DrawerContent>{drawerContent}</DrawerContent>
        </Drawer>
    );
}

// Export types for external use
export type { ActionType, ActionConfig, GenericActionDialogProps };

// Export predefined action configs for customization
export { DEFAULT_ACTION_CONFIGS };

// Utility function to create custom action configs
export function createActionConfig(
    type: ActionType,
    overrides: Partial<Omit<ActionConfig, 'type'>>
): ActionConfig {
    return {
        type,
        ...DEFAULT_ACTION_CONFIGS[type],
        ...overrides
    };
}