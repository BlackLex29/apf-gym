"use client";
import React, { useState, useEffect } from "react";
import { Adminsidebar } from "@/components/Adminsidebar";
import {
  IconBell,
  IconMessageCircle,
  IconMail,
  IconPhone,
  IconTrash,
  IconCircleCheck,
} from "@tabler/icons-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

interface Notification {
  id: string;
  type: "inquiry";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data: {
    name: string;
    email: string;
    phone: string;
    message: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("type", "==", "inquiry"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notificationsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Notification);
      });
      setNotifications(notificationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, "notifications", notification.id), { read: true })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteDoc(doc(db, "notifications", notificationId));
        if (selectedNotification?.id === notificationId) {
          setSelectedNotification(null);
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Adminsidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading notifications...</p>
          </div>
        </div>
      </Adminsidebar>
    );
  }

  return (
    <Adminsidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <IconBell className="size-8 text-orange-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm rounded-full h-6 w-6 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-400">Manage and view all customer inquiries</p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="mt-4 lg:mt-0 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <IconCircleCheck className="size-4" />
              Mark All as Read
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold">
              All Notifications ({notifications.length})
            </h2>
            
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-gray-800/50 rounded-xl p-4 border transition-all cursor-pointer hover:border-orange-500/50 ${
                    selectedNotification?.id === notification.id
                      ? "border-orange-500"
                      : "border-gray-700"
                  } ${!notification.read ? "bg-blue-500/5" : ""}`}
                  onClick={() => {
                    setSelectedNotification(notification);
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{notification.title}</h3>
                        {!notification.read && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>From: {notification.data.name}</span>
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                  <IconBell className="size-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No notifications yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Customer inquiries will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notification Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Details</h2>
            
            {selectedNotification ? (
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedNotification.data.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {formatDate(selectedNotification.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteNotification(selectedNotification.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <IconTrash className="size-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-400">Contact Information</h4>
                  <div className="space-y-2">
                    <p className="flex items-center gap-3">
                      <IconMail className="size-4 text-orange-400" />
                      <span className="text-sm">{selectedNotification.data.email}</span>
                    </p>
                    <p className="flex items-center gap-3">
                      <IconPhone className="size-4 text-orange-400" />
                      <span className="text-sm">{selectedNotification.data.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-400">Message</h4>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {selectedNotification.data.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.open(`mailto:${selectedNotification.data.email}?subject=Re: Your Inquiry&body=Dear ${selectedNotification.data.name},%0D%0A%0D%0AThank you for your inquiry.`)}
                  className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <IconMail className="size-4" />
                  Reply via Email
                </button>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-2xl p-12 border border-gray-700 text-center">
                <IconMessageCircle className="size-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Select a notification</p>
                <p className="text-gray-500 text-sm mt-1">
                  Click on any notification to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Adminsidebar>
  );
}