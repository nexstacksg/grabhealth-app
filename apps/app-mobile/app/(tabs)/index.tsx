import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser]);

  // Auto-refresh user status if pending verification
  useEffect(() => {
    if (user?.status === 'PENDING_VERIFICATION') {
      const interval = setInterval(async () => {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Auto-refresh error:', error);
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, [user?.status, refreshUser]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Welcome, {user?.firstName}!</Text>
        <Text style={styles.subtitle}>You are successfully logged in</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>

          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{user?.phone}</Text>

          <Text style={styles.infoLabel}>Role:</Text>
          <Text style={styles.infoValue}>{user?.role}</Text>

          <Text style={styles.infoLabel}>Status:</Text>
          <Text
            style={[
              styles.infoValue,
              user?.status === 'PENDING_VERIFICATION' && styles.pendingStatus,
            ]}
          >
            {user?.status === 'PENDING_VERIFICATION'
              ? 'Pending Email Verification'
              : user?.status}
          </Text>
          {user?.status === 'PENDING_VERIFICATION' && (
            <Text style={styles.statusNote}>
              Auto-checking verification status...
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pendingStatus: {
    color: '#ff9500',
  },
  statusNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: -5,
    marginBottom: 10,
  },
});
