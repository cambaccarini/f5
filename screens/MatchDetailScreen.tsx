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

type JoinedPlayer = {
  id: string;
  name: string;
  lastName: string;
  phoneNumber: string;
};

const formatDateToDDMMYYYY = (value?: string) => {
  if (!value) {
    return '';
  }

  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (ddmmyyyy.test(value)) {
    return value;
  }

  const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;
  const parsed = value.match(yyyymmdd);
  if (parsed) {
    return `${parsed[3]}/${parsed[2]}/${parsed[1]}`;
  }

  return value;
};

const MatchDetailScreen = () => {
  const route = useRoute<MatchDetailRouteProp>();
  const { matchId } = route.params;
  const [match, setMatch] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [organizerFullName, setOrganizerFullName] = useState('');
  const [organizerPhoneNumber, setOrganizerPhoneNumber] = useState('');
  const [joinedPlayers, setJoinedPlayers] = useState<JoinedPlayer[]>([]);
  const [showJoinedPlayers, setShowJoinedPlayers] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      const docRef = doc(db, 'matches', matchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const matchData = { id: docSnap.id, ...docSnap.data() } as any;
        setMatch(matchData);

        if (matchData.organizerId) {
          const organizerRef = doc(db, 'users', matchData.organizerId);
          const organizerSnap = await getDoc(organizerRef);

          if (organizerSnap.exists()) {
            const organizerData = organizerSnap.data() as { name?: string; lastName?: string; phoneNumber?: string };
            const fullName = [organizerData.name, organizerData.lastName]
              .filter(Boolean)
              .join(' ')
              .trim();
            setOrganizerFullName(fullName || 'Organizador desconocido');
            setOrganizerPhoneNumber(organizerData.phoneNumber || 'Sin teléfono');
          } else {
            setOrganizerFullName('Organizador desconocido');
            setOrganizerPhoneNumber('Sin teléfono');
          }
        } else {
          setOrganizerFullName('Organizador desconocido');
          setOrganizerPhoneNumber('Sin teléfono');
        }
      }
    };

    const fetchCurrentUser = async () => {
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);
    };

    fetchCurrentUser();
    fetchMatch();
  }, [matchId]);

  useEffect(() => {
    const fetchJoinedPlayers = async () => {
      if (!currentUserId || !match || match.organizerId !== currentUserId) {
        setJoinedPlayers([]);
        setShowJoinedPlayers(false);
        return;
      }

      if (!match?.players || !Array.isArray(match.players)) {
        setJoinedPlayers([]);
        return;
      }

      const playerIds = match.players.filter((playerId: string) => playerId !== match.organizerId);
      if (playerIds.length === 0) {
        setJoinedPlayers([]);
        return;
      }

      try {
        const playersData = await Promise.all(
          playerIds.map(async (playerId: string) => {
            const playerRef = doc(db, 'users', playerId);
            const playerSnap = await getDoc(playerRef);

            if (!playerSnap.exists()) {
              return {
                id: playerId,
                name: 'Jugador',
                lastName: 'desconocido',
                phoneNumber: 'Sin teléfono',
              };
            }

            const playerData = playerSnap.data() as {
              name?: string;
              lastName?: string;
              phoneNumber?: string;
            };

            return {
              id: playerId,
              name: playerData.name || 'Jugador',
              lastName: playerData.lastName || 'desconocido',
              phoneNumber: playerData.phoneNumber || 'Sin teléfono',
            };
          })
        );

        setJoinedPlayers(playersData);
      } catch (error) {
        console.error('Error al obtener jugadores sumados:', error);
        setJoinedPlayers([]);
      }
    };

    fetchJoinedPlayers();
  }, [match, currentUserId]);

  if (!match) {
    return (
      <Layout>
        <View style={styles.container}>
          <Text>Cargando partido...</Text>
        </View>
      </Layout>
    );
  }

  const formattedDate = formatDateToDDMMYYYY(match.date);
  const dateLabel = formattedDate || 'Sin fecha';
  const timeLabel = match.time || 'Sin hora';
  const remainingPlayers = Math.max(match.requiredPlayers || 0, 0);
  const isFull = remainingPlayers === 0;
  const isOwnMatch = !!currentUserId && match.organizerId === currentUserId;
  const playersStatusLabel = isFull ? 'Partido completo' : `Faltan ${remainingPlayers} jugadores`;

  const handleJoinMatch = async () => {
    if (isOwnMatch) {
      alert('No puedes sumarte a un partido que creaste');
      return;
    }

    if (isFull) {
      alert('El partido ya está completo');
      return;
    }

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
      const updatedRequiredPlayers = Math.max((match.requiredPlayers || 0) - 1, 0);
      await updateDoc(matchRef, {
        players: [...match.players, userId],
        requiredPlayers: updatedRequiredPlayers,
      });
      setMatch({
        ...match,
        players: [...match.players, userId],
        requiredPlayers: updatedRequiredPlayers,
      });
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
          <Text style={styles.text}>{dateLabel}</Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="schedule" size={28} color="#082512" style={styles.icon} />
          <Text style={styles.text}>{timeLabel}</Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="location-on" size={28} color="#082512" style={styles.icon} />
          <Text style={styles.text}>{match.location || 'Sin ubicación'}</Text>
        </View>
        <View style={styles.row}>
          <Image source={require('../assets/user.png')} style={styles.icon} />
          <Text style={styles.text}>Organiza: {organizerFullName}</Text>
        </View>
        {!isOwnMatch && (
          <View style={styles.row}>
            <MaterialIcons name="phone" size={26} color="#082512" style={styles.icon} />
            <Text style={styles.text}>Contacta al organizador: {organizerPhoneNumber}</Text>
          </View>
        )}
        {isOwnMatch ? (
          <TouchableOpacity style={styles.row} onPress={() => setShowJoinedPlayers(prev => !prev)}>
            <FontAwesome5 name="users" size={26} color="#082512" style={styles.icon} />
            <Text style={styles.text}>{playersStatusLabel}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <FontAwesome5 name="users" size={26} color="#082512" style={styles.icon} />
            <Text style={styles.text}>{playersStatusLabel}</Text>
          </View>
        )}
        {isOwnMatch && showJoinedPlayers && (
          <View style={styles.playersListContainer}>
            <Text style={styles.playersListTitle}>Jugadores sumados:</Text>
            {joinedPlayers.length === 0 ? (
              <Text style={styles.playersListItem}>Todavía no se sumó nadie.</Text>
            ) : (
              joinedPlayers.map(player => (
                <Text key={player.id} style={styles.playersListItem}>
                  {player.name} {player.lastName} - teléfono: {player.phoneNumber}
                </Text>
              ))
            )}
          </View>
        )}
        {!isOwnMatch && !isFull ? (
          <TouchableOpacity style={styles.button} onPress={handleJoinMatch}>
            <Text style={styles.buttonText}>Sumarse</Text>
          </TouchableOpacity>
        ) : null}
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
    width: '100%',
    maxWidth: 360,
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
    textAlign: 'left',
    flexShrink: 1,
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
  fullText: {
    marginTop: 32,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#082512',
  },
  playersListContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#e9eac7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  playersListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#082512',
    marginBottom: 8,
  },
  playersListItem: {
    fontSize: 14,
    color: '#082512',
    marginBottom: 4,
  },
});

export default MatchDetailScreen;