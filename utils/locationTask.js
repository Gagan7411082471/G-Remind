import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import haversine from 'haversine-distance'; // optional for better accuracy

const LOCATION_TASK_NAME = 'background-location-task';

// Dummy threshold (in meters)
const PROXIMITY_THRESHOLD = 100;

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location Task Error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const userLocation = locations[0];

    try {
      // Fetch all items from Firestore
      const response = await fetch('https://firestore.googleapis.com/v1/projects/g-remind-41d9a/databases/(default)/documents/items');
      const json = await response.json();

      for (const doc of json.documents || []) {
        const fields = doc.fields;
        const store = fields.store?.mapValue?.fields;
        const item = fields.item?.stringValue;

        if (store && store.latitude && store.longitude) {
          const storeCoords = {
            latitude: parseFloat(store.latitude.doubleValue),
            longitude: parseFloat(store.longitude.doubleValue),
          };

          const distance = haversine(userLocation.coords, storeCoords);

          if (distance <= PROXIMITY_THRESHOLD) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Reminder',
                body: `You're near ${store.storeName?.stringValue}. Don't forget to buy ${item}!`,
              },
              trigger: null, // immediate
            });
          }
        }
      }
    } catch (err) {
      console.log('Error checking store distance:', err);
    }
  }
});

export const startLocationUpdates = async () => {
  const hasPerm = await Location.requestBackgroundPermissionsAsync();
  const notifPerm = await Notifications.requestPermissionsAsync();

  if (hasPerm.status !== 'granted' || notifPerm.status !== 'granted') {
    alert('Background location or notification permission not granted');
    return;
  }

  const isTaskRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (!isTaskRunning) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 60000, // every 1 min
      distanceInterval: 50, // every 50m
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'G-Remind',
        notificationBody: 'Tracking location to remind about your items...',
      },
    });
  }
};
