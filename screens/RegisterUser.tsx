import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterUser = () => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  // const [profileImage, setProfileImage] = useState<string | null>(null);
  const profileImage = null;

const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'RegisterUser'>>();
  
const handleRegister = async () => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        name,
        lastName,
        username,
        password,
        phoneNumber,
        age,
        //avatarUrl: profileImage,
      });
      await AsyncStorage.setItem('userId', docRef.id);
      alert('Usuario registrado');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      alert('Error al registrar usuario');
      console.error(error);
    }
  };

const handlePickImage = async () => {
/*  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Se requieren permisos para acceder a las fotos.');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (!result.canceled && result.assets && result.assets.length > 0) {
    setProfileImage(result.assets[0].uri);
  }*/
  };

  return (
    <View style={styles.background}>
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      <View style={styles.container}>
        {/*
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handlePickImage}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('../assets/user.png')
              }
              style={styles.avatar}
            />

            <View style={styles.editIcon}>
              <MaterialIcons name="edit" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
        */}

        <Text style={styles.title}>Registro de usuario</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Apellido"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
         <TextInput
          style={styles.input}
          placeholder="Edad"
          value={age}
          onChangeText={setAge}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarse</Text>
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
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50, 
    borderWidth: 2,
    borderColor: '#082512',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#082512',
    borderRadius: 16,
    width: 32, 
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#082512',
    marginBottom: 24,
    fontWeight: 'bold',
    marginTop: 16,
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

export default RegisterUser;