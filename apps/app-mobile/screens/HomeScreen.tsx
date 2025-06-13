import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
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
        <Text style={styles.infoValue}>{user?.status}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
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
});
