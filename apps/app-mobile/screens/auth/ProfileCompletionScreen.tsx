import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  department?: string;
}

export default function ProfileCompletionScreen() {
  const navigation = useNavigation<any>();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      emergencyContact: '',
      department: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth || undefined,
        address: data.address || undefined,
        emergencyContact: data.emergencyContact || undefined,
        department: data.department || undefined,
      });

      setUser(updatedUser);

      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully completed.',
        [{ text: 'OK', onPress: () => navigation.navigate('(tabs)') }]
      );
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || 'Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSkip = () => {
    Alert.alert(
      'Skip Profile Setup?',
      'You can complete your profile later from the settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.navigate('(tabs)') },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Help us know you better</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <Controller
              control={control}
              rules={{ required: 'First name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>First Name*</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.firstName && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <Text style={styles.errorText}>
                      {errors.firstName.message}
                    </Text>
                  )}
                </View>
              )}
              name="firstName"
            />

            <Controller
              control={control}
              rules={{ required: 'Last name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Last Name*</Text>
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <Text style={styles.errorText}>
                      {errors.lastName.message}
                    </Text>
                  )}
                </View>
              )}
              name="lastName"
            />
          </View>

          <Controller
            control={control}
            rules={{
              pattern: {
                value: /^\+?[1-9]\d{7,14}$/,
                message: 'Please enter a valid phone number',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number (Optional)</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="+65 1234 5678 (Optional)"
                  keyboardType="phone-pad"
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone.message}</Text>
                )}
              </View>
            )}
            name="phone"
          />

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Date of Birth</Text>
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            )}
            name="dateOfBirth"
          />

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="123 Main St, Singapore"
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
            name="address"
          />

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Emergency Contact</Text>
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="+65 9876 5432"
                  keyboardType="phone-pad"
                />
              </View>
            )}
            name="emergencyContact"
          />

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Department</Text>
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Security Operations"
                />
              </View>
            )}
            name="department"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Complete Profile</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
            disabled={isLoading}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.requiredNote}>* Required fields</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  form: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  skipButtonText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
