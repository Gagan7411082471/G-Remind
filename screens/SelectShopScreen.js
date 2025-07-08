import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Text } from 'react-native-paper';

export default function SelectShopScreen() {
  const [region, setRegion] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const itemName = route.params?.item || '';

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleSelectLocation = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedMarker({
      latitude,
      longitude,
      storeName: `${itemName} Store`, // or ask user to name it later
    });
  };

const confirmSelection = () => {
  if (!selectedMarker) {
    Alert.alert("Select a store", "Please tap a store location first");
    return;
  }
  global.selectedStore = selectedMarker;
  navigation.goBack();
};



  return (
    <View style={styles.container}>
      {region ? (
        <>
          <MapView
            style={styles.map}
            region={region}
            onPress={handleSelectLocation}  
          >
            {selectedMarker && (
              <Marker
                coordinate={selectedMarker}
                title={selectedMarker.storeName}
                pinColor="green"
              />
            )}
          </MapView>
          <View style={styles.bottomCard}>
            <Text style={{ marginBottom: 10 }}>
              {selectedMarker
                ? `Selected: ${selectedMarker.storeName}`
                : "Tap a store location on the map"}
            </Text>
            <Button mode="contained" onPress={confirmSelection}>
              Confirm Store
            </Button>
          </View>
        </>
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading map...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    elevation: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1,
  },
});
