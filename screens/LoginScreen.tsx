import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [userId, setUserId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigation = useNavigation<NavigationProp>();
  const handleLogin = async () => {
    if (!userId || !phoneNumber) {
      Alert.alert('Error', 'Completa ambos campos');
      return;
    }
    try {
      const userRef = doc(collection(db, 'users'), userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        Alert.alert('Error', 'ID no encontrado');
        return;
      }
      const userData = userSnap.data();
      if (userData.phoneNumber !== phoneNumber) {
        Alert.alert('Error', 'Teléfono incorrecto');
        return;
      }
      await AsyncStorage.setItem('userId', userId);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error');
      console.error(error);
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.header}>
        <Text style={styles.title}>Iniciar sesión</Text>
      </View>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="ID de usuario"
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterUser')}>
          <Text style={styles.link}>¿No tenés cuenta? ¡Registrate!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#C7CD7A',
  },
  header: {
    width: '100%',
    height: 140,
    backgroundColor: '#082512',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 40,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 48,
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
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#082512',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 8,
    fontWeight: 'bold',
  },
});

export default LoginScreen;