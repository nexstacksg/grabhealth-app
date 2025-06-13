import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function EmailVerificationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const email = route.params?.email || '';

  const resendVerificationEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address not found');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resendVerificationEmail(email);
      Alert.alert(
        'Email Sent',
        'Verification email has been resent. Please check your inbox.'
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to resend verification email.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📧</Text>
        </View>

        <Text style={styles.title}>Verify Your Email</Text>

        <Text style={styles.description}>
          We&apos;ve sent a verification email to:
        </Text>

        <Text style={styles.email}>{email}</Text>

        <Text style={styles.instructions}>
          Please check your email and click the verification link to activate
          your account.
        </Text>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={resendVerificationEmail}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Resend Verification Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            checkingStatus && styles.buttonDisabled,
          ]}
          onPress={async () => {
            setCheckingStatus(true);
            try {
              await refreshUser();
              Alert.alert(
                'Status Updated',
                'Your account status has been refreshed.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Login'),
                  },
                ]
              );
            } catch (error) {
              console.error('Error refreshing status:', error);
            } finally {
              setCheckingStatus(false);
            }
          }}
          disabled={checkingStatus}
        >
          {checkingStatus ? (
            <ActivityIndicator color={Colors.light.tint} />
          ) : (
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              I&apos;ve Verified My Email
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Didn&apos;t receive the email? Check your spam folder or try
          resending.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  secondaryButtonText: {
    color: Colors.light.tint,
  },
});
