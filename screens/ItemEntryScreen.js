import { useIsFocused, useNavigation } from '@react-navigation/native';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput, Title } from 'react-native-paper';
import { db } from '../firebaseConfig'; // update path if needed
import { startLocationUpdates } from '../utils/locationTask';

  if (!global.itemStoreMap) {
  global.itemStoreMap = {};
}

const categoryMap = {
  tomato: 'Vegetable',
  onion: 'Vegetable',
  rice: 'Grocery',
  milk: 'Dairy',
  apple: 'Fruit',
  soap: 'Hygiene',
};

export default function ItemEntryScreen() {
  const [item, setItem] = useState('');
  const [category, setCategory] = useState('');
  const [preferredStore, setPreferredStore] = useState(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

useEffect(() => {
  if (isFocused && item) {
    const store = global.itemStoreMap[item];
    if (store) {
      setPreferredStore(store);
    }
  }
}, [isFocused]);

useEffect(() => {
  if (isFocused && global.selectedStore) {
    setPreferredStore(global.selectedStore);
    global.selectedStore = null;
  }

  // Start background tracking ONCE
  startLocationUpdates();
}, [isFocused]);



  const handleInputChange = (text) => {
    setItem(text);
    const lower = text.toLowerCase();
    setCategory(categoryMap[lower] || 'Uncategorized');
  };

  const handleSubmit = async () => {
    if (!item.trim()) return;
    try {
      await addDoc(collection(db, 'items'), {
        item,
        category,
        store: global.itemStoreMap[item] || null,
        status: 'pending',
        timestamp: Timestamp.now(),
      });

      delete global.itemStoreMap[item];


      alert(`Item "${item}" added to Firestore`);
      setItem('');
      setCategory('');
      setPreferredStore(null);
    } catch (error) {
      alert("Error saving to Firestore");
    }
  };

  const goToMap = () => {
  if (!item.trim()) {
    alert("Please enter an item first");
    return;
  }
  navigation.navigate('select-shop', { item });
};


  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Title>Enter Item</Title>
          <TextInput
            label="Item Name"
            mode="outlined"
            value={item}
            onChangeText={handleInputChange}
            style={styles.input}
          />
          {item !== '' && (
            <Text style={styles.categoryText}>
              Detected Category: <Text style={{ fontWeight: 'bold' }}>{category}</Text>
            </Text>
          )}

          <Button
            mode="outlined"
            onPress={goToMap}
            style={{ marginBottom: 10 }}
          >
            {preferredStore ? "Change Preferred Store" : "Choose Preferred Store"}
          </Button>

          {preferredStore && (
  <Text>
    Selected for {item}: {preferredStore.storeName}
  </Text>
)}


          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!item}
          >
            Add Item
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f2f2f2' },
  input: { marginBottom: 10 },
  categoryText: { marginBottom: 10, fontSize: 16 },
});
