import { useEffect } from "react";
import { getSocket } from "../services/socket";
import { useNotificationStore } from "../store/notificationStore";

export function useLiveNotifications() {
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  useEffect(() => {
    let socket;
    try {
      socket = getSocket();
    } catch {
      return;
    }
    if (!socket) return;

    const onMatchCreated = (match) => {
      addNotification({
        type: "match",
        title: "New match nearby",
        body: `${match.title} is open in ${match.city}.`,
      });
    };

    const onMatchUpdated = (match) => {
      addNotification({
        type: "match",
        title: "Match updated",
        body: `${match.title} now has ${match.playersCount}/${match.maxPlayers} players.`,
      });
    };

    const onBookingCreated = (booking) => {
      addNotification({
        type: "booking",
        title: "Pitch booked",
        body: `${booking.terrain?.name || "A terrain"} was reserved.`,
      });
    };

    const onNotificationCreated = (notification) => {
      addNotification(notification);
    };

    socket.on("match:created", onMatchCreated);
    socket.on("match:updated", onMatchUpdated);
    socket.on("booking:created", onBookingCreated);
    socket.on("notification:created", onNotificationCreated);

    return () => {
      safeRemoveListener(socket, "match:created", onMatchCreated);
      safeRemoveListener(socket, "match:updated", onMatchUpdated);
      safeRemoveListener(socket, "booking:created", onBookingCreated);
      safeRemoveListener(socket, "notification:created", onNotificationCreated);
    };
  }, [addNotification]);
}

function safeRemoveListener(socket, event, handler) {
  try {
    if (typeof socket?.off === "function") {
      socket.off(event, handler);
      return;
    }

    if (typeof socket?.removeListener === "function") {
      socket.removeListener(event, handler);
    }
  } catch {
    // Cleanup must never crash the React tree.
  }
}
