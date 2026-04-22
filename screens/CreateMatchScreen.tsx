import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';
import Layout from '../components/Layout';

const isValidDateFormat = (value: string) => {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return false;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const candidate = new Date(year, month - 1, day);

  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day
  );
};

const CreateMatchScreen = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requiredPlayers, setRequiredPlayers] = useState('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleCreateMatch = async () => {
    const normalizedDate = date.trim();

    if (!isValidDateFormat(normalizedDate)) {
      alert('La fecha debe tener formato DD/MM/AAAA');
      return;
    }

    try {
      const organizerId = await AsyncStorage.getItem('userId');
      if (!organizerId) {
        alert('No hay usuario logueado');
        return;
      }
      await addDoc(collection(db, 'matches'), {
        title,
        date: normalizedDate,
        time,
        location,
        description,
        requiredPlayers: Number(requiredPlayers),
        organizerId,
        players: [organizerId],
      });
      alert('Partido creado!');
      navigation.goBack(); // o navigation.navigate('Home')
    } catch (error) {
      alert('Error al crear partido');
      console.error(error);
    }
  };

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Crear Partido</Text>
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Fecha (ej: 18/04/2026)"
          value={date}
          onChangeText={setDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Hora (ej: 18:30)"
          value={time}
          onChangeText={setTime}
        />
        <TextInput
          style={styles.input}
          placeholder="Lugar"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Cantidad de jugadores"
          value={requiredPlayers}
          onChangeText={setRequiredPlayers}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleCreateMatch}>
          <Text style={styles.buttonText}>Crear</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#082512',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    maxWidth: 350,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderColor: '#082512',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#082512',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateMatchScreen;