import { useEffect, useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import TakmirLayout from "../../../layouts/takmir_layout";
import axiosInstance from "../../../api/axiosInstance";
import formatDateWIB from "../../../utils/formatDate";

const NotificationsTakmir = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notifications");
        setNotifications(response.data.data || []);
        await axiosInstance.patch("/notifications/read-all");
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <TakmirLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-600">
            Semua notifikasi donasi masuk untuk masjid ini.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Belum ada notifikasi
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Notifikasi akan muncul otomatis saat ada donasi masuk.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border p-5 shadow-sm ${
                  notification.isRead
                    ? "border-gray-200 bg-white"
                    : "border-emerald-200 bg-emerald-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-xl p-3 ${
                        notification.isRead
                          ? "bg-gray-100 text-gray-600"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        {notification.message}
                      </p>
                      <p className="mt-3 text-xs text-gray-500">
                        {formatDateWIB(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  {notification.isRead && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Read
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TakmirLayout>
  );
};

export default NotificationsTakmir;
