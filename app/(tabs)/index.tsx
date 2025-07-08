import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import ItemEntryScreen from '../../screens/ItemEntryScreen';

export default function HomeTab() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { item } = response.notification.request.content.data;
      console.log("User was reminded about:", item);
      // You can navigate or mark as bought here in the future
    });

    return () => subscription.remove();
  }, []);

  return <ItemEntryScreen />;
}
