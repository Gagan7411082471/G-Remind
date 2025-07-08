import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';
import haversine from 'haversine-distance';

const LOCATION_TASK_NAME = 'background-location-task';
const PROXIMITY_THRESHOLD = 100;

const db = getFirestore();

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location Task Error:', error);
    return;
  }

  const locations = data?.locations;
  if (!locations || locations.length === 0) return;

  const userLocation = locations[0].coords;

  try {
    const res = await fetch(
      'https://firestore.googleapis.com/v1/projects/g-remind-41d9a/databases/(default)/documents/items'
    );
    const json = await res.json();

    for (const docSnap of json.documents || []) {
      const docId = docSnap.name.split('/').pop();
      const fields = docSnap.fields;

      const item = fields.item?.stringValue;
      const store = fields.preferredStore?.mapValue?.fields;

      if (!store || !store.latitude || !store.longitude) continue;

      const storeCoords = {
        latitude: parseFloat(store.latitude.doubleValue),
        longitude: parseFloat(store.longitude.doubleValue),
      };

      const distance = haversine(userLocation, storeCoords);

      const enteredProximity = fields.enteredProximity?.booleanValue;
      const exitedProximity = fields.exitedProximity?.booleanValue;
      const reminderShown = fields.reminderShown?.booleanValue;

      const docRef = doc(db, 'items', docId);

      // Case 1: User enters the store proximity
      if (distance <= PROXIMITY_THRESHOLD && !enteredProximity) {
        await updateDoc(docRef, {
          enteredProximity: true,
          exitedProximity: false,
          reminderShown: false,
        });
      }

      // Case 2: User exits the store after entering
      if (
        distance > PROXIMITY_THRESHOLD &&
        enteredProximity &&
        !exitedProximity &&
        !reminderShown
      ) {
        // Send exit reminder notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Reminder',
            body: `Did you buy ${item} from ${store.storeName?.stringValue}?`,
            data: { item, docId },
          },
          trigger: null,
        });

        // Mark as reminder shown
        await updateDoc(docRef, {
          exitedProximity: true,
          reminderShown: true,
        });
      }
    }
  } catch (err) {
    console.error('Error in proximity check:', err);
  }
});

// Called in foreground (ItemEntryScreen useEffect)
export const startLocationUpdates = async () => {
  const locPerm = await Location.requestBackgroundPermissionsAsync();
  const notifPerm = await Notifications.requestPermissionsAsync();

  if (
    locPerm.status !== 'granted' 
  ) {
    alert('Permissions not granted for location');
    return;
  }
  if(    notifPerm.status !== 'granted'
){
    alert('Permissions not granted for notifications');
    return;
  }

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (!hasStarted) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 60000,
      distanceInterval: 50,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'G-Remind Running',
        notificationBody: 'Tracking your location to remind you about items.',
      },
    });
  }
};
