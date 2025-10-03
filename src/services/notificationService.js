//C:\PROJETOS\PGMP\src\services\notificationService.js

import * as Notifications from "expo-notifications";

export async function scheduleNotification(title, body, seconds = 10) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds },
  });
}
