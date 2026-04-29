import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NavigationProp>();
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Completa ambos campos');
      return;
    }
    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        Alert.alert('Error', 'Usuario no encontrado');
        return;
      }
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      if (userData.password !== password) {
        Alert.alert('Error', 'Contraseña incorrecta');
        return;
      }
      await AsyncStorage.setItem('userId', userDoc.id);
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
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar sesión</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
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
    height: 150,
    backgroundColor: '#082512',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    color: '#082512',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 32,
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