import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

const CreateLocationScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{name?: string; address?: string}>({});

  const availableAmenities = [
    'Lighting',
    'Water Fountain',
    'Restrooms',
    'Parking',
    'Indoor',
    'Outdoor',
    'Multiple Courts',
    'Seating',
  ];

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity],
    );
  };

  const validateInputs = () => {
    const newErrors: {name?: string; address?: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Court name is required';
    }
    
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Location added successfully! It will be reviewed before being published.',
        [{text: 'OK'}],
      );

      // Clear form
      setName('');
      setAddress('');
      setDescription('');
      setAmenities([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add New Court</Text>
        <Text style={styles.subtitle}>
          Help other players discover great places to play
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Court Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="e.g., Central Park Basketball Court"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({...errors, name: undefined});
              }}
              editable={!isLoading}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              placeholder="Enter the court address"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address) setErrors({...errors, address: undefined});
              }}
              multiline
              editable={!isLoading}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the court (condition, features, etc.)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {availableAmenities.map(amenity => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.amenityChip,
                    amenities.includes(amenity) && styles.amenityChipSelected,
                  ]}
                  onPress={() => toggleAmenity(amenity)}
                  disabled={isLoading}>
                  <Text
                    style={[
                      styles.amenityText,
                      amenities.includes(amenity) && styles.amenityTextSelected,
                    ]}>
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" style={styles.loadingIndicator} />
                <Text style={styles.submitButtonText}>Adding Court...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Add Court</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF6B35',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  amenityChipSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
  },
  amenityTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
});

export default CreateLocationScreen;