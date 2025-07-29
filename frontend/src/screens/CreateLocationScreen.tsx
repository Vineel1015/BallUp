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
  Modal,
} from 'react-native';
import LocationPickerMap from '../components/LocationPickerMap';
import { Coordinates } from '../services/locationService';
import { apiService } from '../services/api';

const CreateLocationScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{name?: string; address?: string; location?: string}>({});

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
    const newErrors: {name?: string; address?: string; location?: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Court name is required';
    }
    
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!coordinates) {
      newErrors.location = 'Please select a location on the map';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationSelect = (location: {coordinates: Coordinates; address: string}) => {
    setCoordinates(location.coordinates);
    if (!address.trim()) {
      setAddress(location.address);
    }
    setShowMapModal(false);
    if (errors.location) {
      setErrors({...errors, location: undefined});
    }
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await apiService.createLocation({
        name: name.trim(),
        address: address.trim(),
        latitude: coordinates!.latitude,
        longitude: coordinates!.longitude,
        description: description.trim() || undefined,
        amenities,
      });
      
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
      setCoordinates(null);
    } catch (error) {
      console.error('Error creating location:', error);
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
              placeholderTextColor="#CCCCCC"
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
              placeholderTextColor="#CCCCCC"
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
            <Text style={styles.label}>Location on Map *</Text>
            <TouchableOpacity
              style={[styles.mapButton, errors.location && styles.inputError]}
              onPress={() => setShowMapModal(true)}
              disabled={isLoading}
            >
              <Text style={styles.mapButtonText}>
                {coordinates ? 
                  `📍 Selected (${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)})` : 
                  '📍 Tap to select location on map'
                }
              </Text>
            </TouchableOpacity>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the court (condition, features, etc.)"
              placeholderTextColor="#CCCCCC"
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

      <Modal
        visible={showMapModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMapModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Court Location</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          <LocationPickerMap
            onLocationSelect={handleLocationSelect}
            initialLocation={coordinates || undefined}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    width: '100%',
    alignItems: 'center',
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
    color: '#CCCCCC',
    marginBottom: 32,
  },
  form: {
    gap: 24,
    width: '90%',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  amenityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  amenityChipSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  amenityText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  amenityTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
    width: '90%',
    alignSelf: 'center',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#cc3333',
    borderWidth: 2,
  },
  errorText: {
    color: '#cc3333',
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
  mapButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    alignItems: 'center',
  },
  mapButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#FF6B35',
  },
  modalCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalPlaceholder: {
    width: 60,
  },
});

export default CreateLocationScreen;