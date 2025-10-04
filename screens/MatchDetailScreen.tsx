import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Layout from '../components/Layout';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateDoc } from 'firebase/firestore';

type MatchDetailRouteProp = RouteProp<RootStackParamList, 'MatchDetail'>;

const MatchDetailScreen = () => {
  const route = useRoute<MatchDetailRouteProp>();
  const { matchId } = route.params;
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      const docRef = doc(db, 'matches', matchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMatch({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchMatch();
  }, [matchId]);

  if (!match) {
    return (
      <Layout>
        <View style={styles.container}>
          <Text>Cargando partido...</Text>
        </View>
      </Layout>
    );
  }

    const handleJoinMatch = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      alert('Debes iniciar sesión');
      return;
    }
    if (match.players.includes(userId)) {
      alert('Ya estás en este partido');
      return;
    }
    try {
      const matchRef = doc(db, 'matches', matchId);
      await updateDoc(matchRef, {
        players: [...match.players, userId],
      });
      setMatch({ ...match, players: [...match.players, userId] });
      alert('¡Te sumaste al partido!');
    } catch (error) {
      alert('Error al sumarse');
      console.error(error);
    }
  };
  

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>{match.title}</Text>
        <View style={styles.row}>
          <MaterialIcons name="calendar-today" size={28} color="#082512" style={styles.icon} />
          <Text style={styles.text}>{match.dateTime || 'Sin fecha'}</Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="location-on" size={28} color="#082512" style={styles.icon} />
          <Text style={styles.text}>{match.location || 'Sin ubicación'}</Text>
        </View>
        <View style={styles.row}>
          <Image source={require('../assets/user.png')} style={styles.icon} />
          <Text style={styles.text}>Organiza: {match.organizerName || match.organizerId}</Text>
        </View>
        <View style={styles.row}>
          <FontAwesome5 name="users" size={26} color="#082512" style={styles.icon} />
          <Text style={styles.text}>Hay {match.players?.length || 0} de {match.requiredPlayers} jugadores</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleJoinMatch}>
          <Text style={styles.buttonText}>Sumarse</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#C7CD7A',
    alignItems: 'center',         
    justifyContent: 'center',     
  },
  title: {
    fontSize: 24,
    color: '#082512',
    fontWeight: 'bold',
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    color: '#082512',
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 32,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MatchDetailScreen;