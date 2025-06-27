import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

export default function SavedItemsScreen() {
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    const mappedData = Object.entries(global.itemStoreMap || {}).map(([item, store]) => ({
      key: item,
      store,
    }));
    setDataList(mappedData);
  }, []);

  const handleDelete = (itemKey) => {
    delete global.itemStoreMap[itemKey];
    const updatedData = Object.entries(global.itemStoreMap).map(([item, store]) => ({
      key: item,
      store,
    }));
    setDataList(updatedData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Items</Text>
      {dataList.length === 0 ? (
        <Text style={styles.emptyText}>No items saved yet.</Text>
      ) : (
        <FlatList
          data={dataList}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.item}>{item.key}</Text>
                <Text style={styles.store}>{item.store.name}</Text>
              </View>
              <IconButton
                icon="delete"
                size={22}
                onPress={() => handleDelete(item.key)}
                style={{ marginLeft: 'auto' }}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { fontSize: 16, textAlign: 'center', color: '#888' },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: { fontSize: 16, fontWeight: '600' },
  store: { fontSize: 14, color: 'gray', marginTop: 2 },
});
