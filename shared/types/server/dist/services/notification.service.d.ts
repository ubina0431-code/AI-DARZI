type NotificationType = 'registration' | 'order_created' | 'tailor_accepted' | 'quote_received' | 'design_approval' | 'measurement_issue' | 'payment' | 'order_status' | 'chat_message' | 'order_ready' | 'delivery' | 'review_request' | 'tailor_verified' | 'order_cancelled' | 'general';
interface CreateNotificationOptions {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    orderId?: string;
}
export declare const notificationService: {
    create(options: CreateNotificationOptions): Promise<(import("mongoose").Document<unknown, {}, import("../models/Notification").INotification, {}, {}> & import("../models/Notification").INotification & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | undefined>;
    createOrderNotification(userId: string, orderId: string, status: string): Promise<void>;
};
export declare const auditService: {
    log(options: {
        userId?: string;
        userRole?: string;
        action: string;
        resource: string;
        resourceId?: string;
        metadata?: Record<string, unknown>;
        ipAddress?: string;
        success?: boolean;
        errorMessage?: string;
    }): Promise<void>;
};
export {};
//# sourceMappingURL=notification.service.d.ts.map