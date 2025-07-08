import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Badge, Card, IconButton, Paragraph, Text, Title } from 'react-native-paper';
import { db } from '../firebaseConfig';

export default function SavedItemsScreen() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'items'), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(list);
    });

    return () => unsub();
  }, []);

  const markAsBought = async (id) => {
    try {
      await updateDoc(doc(db, 'items', id), { status: 'bought' });
    } catch (err) {
      Alert.alert('Error', 'Could not update item status.');
    }
  };

  const deleteItem = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await deleteDoc(doc(db, 'items', id));
          } catch (err) {
            Alert.alert('Error', 'Could not delete item.');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.item}</Title>
        <Paragraph>Category: {item.category}</Paragraph>
        {item.preferredStore?.storeName && (
          <Paragraph>Store: {item.preferredStore.storeName}</Paragraph>
        )}
        <View style={styles.statusRow}>
          <Badge
            style={[
              styles.badge,
              { backgroundColor: item.status === 'bought' ? '#4caf50' : '#ff9800' }
            ]}
          >
            {item.status.toUpperCase()}
          </Badge>
        </View>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <IconButton
          icon="check"
          iconColor="#4caf50"
          size={24}
          onPress={() => markAsBought(item.id)}
        />
        <IconButton
          icon="delete"
          iconColor="#e53935"
          size={24}
          onPress={() => deleteItem(item.id)}
        />
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <Text style={styles.noItems}>No items saved</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f4f4f4' },
  card: { marginBottom: 10, borderRadius: 10 },
  noItems: { textAlign: 'center', marginTop: 50, fontSize: 16 },
  actions: { justifyContent: 'flex-end' },
  statusRow: { marginTop: 10, flexDirection: 'row' },
  badge: { paddingHorizontal: 10, fontSize: 12, alignSelf: 'flex-start' }
});
