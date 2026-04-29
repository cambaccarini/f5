import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const parseMatchDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const ddmmyyyy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]);
    const year = Number(ddmmyyyy[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  return null;
};

const deletePastMatches = async () => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const matchesSnapshot = await getDocs(collection(db, 'matches'));

  const deletions = matchesSnapshot.docs
    .filter(matchDoc => {
      const matchDate = parseMatchDate(matchDoc.data()?.date);
      return !!matchDate && matchDate < todayStart;
    })
    .map(matchDoc => deleteDoc(doc(db, 'matches', matchDoc.id)));

  await Promise.all(deletions);
};

const AuthLoadingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const checkSession = async () => {
      try {
        await deletePastMatches();
      } catch (error) {
        console.error('Error al borrar partidos vencidos:', error);
      }

      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    };
    checkSession();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#082512" />
    </View>
  );
};

export default AuthLoadingScreen;