// app/index.tsx
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Platform,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';

// Import your custom components from the components directory
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';

export default function Home() {
  const { isAuthenticated, isLoading, isInitialized, user, logout } = useAuth();
  const {
    tasks,
    categorizing,
    addTask,
    toggleTaskCompletion,
    deleteTask,
  } = useTask();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitialized]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (isLoading || !isInitialized) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={['#192f6a', '#3b5998', '#4c669f']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradientBackground}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>My Smart To-Do</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <TaskInput
            onAddTask={addTask}
            isCategorizing={categorizing}
          />

          {tasks.length === 0 ? (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>
                No tasks yet! Add something to do, and I'll try to categorize it.
              </Text>
            </View>
          ) : (
            <TaskList
              tasks={tasks}
              onToggleTaskCompletion={toggleTaskCompletion}
              onDeleteTask={deleteTask}
            />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#192f6a', // Fallback color
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Handle Android status bar
  },
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Fallback
  },
});
