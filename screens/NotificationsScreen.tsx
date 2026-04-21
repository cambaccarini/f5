import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Layout from '../components/Layout';
import { collection, getDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';

interface Match {
  id: string;
  title: string;
  requiredPlayers: number;
  players: string[];
  organizerId?: string;
}

interface NotificationItem {
  id: string;
  matchId: string;
  matchTitle: string;
  playerName: string;
  remainingPlayers: number;
}

const NotificacionesScreen = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          setNotifications([]);
          return;
        }

        const querySnapshot = await getDocs(collection(db, 'matches'));
        const allMatches: Match[] = querySnapshot.docs.map(matchDoc => ({
          id: matchDoc.id,
          ...matchDoc.data(),
        })) as Match[];

        const ownMatches = allMatches.filter(match => match.organizerId === userId);
        const builtNotifications: NotificationItem[] = [];

        for (const match of ownMatches) {
          const playersJoined = (match.players || []).filter(playerId => playerId !== userId);
          const remainingPlayers = Math.max(match.requiredPlayers - (match.players?.length || 0), 0);

          for (const playerId of playersJoined) {
            let playerName = 'Un jugador';

            try {
              const userRef = doc(db, 'users', playerId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userData = userSnap.data() as { name?: string; lastName?: string };
                const fullName = [userData.name, userData.lastName].filter(Boolean).join(' ').trim();
                if (fullName) {
                  playerName = fullName;
                }
              }
            } catch (error) {
              console.error('Error al obtener usuario de notificacion:', error);
            }

            builtNotifications.push({
              id: `${match.id}-${playerId}`,
              matchId: match.id,
              matchTitle: match.title,
              playerName,
              remainingPlayers,
            });
          }
        }

        setNotifications(builtNotifications);
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={styles.notificationBar}
      onPress={() => navigation.navigate('MatchDetail', { matchId: item.matchId })}
    >
      <Text style={styles.notificationTitle}>{item.matchTitle}</Text>
      <Text style={styles.notificationText}>{item.playerName} se sumó a tu partido</Text>
      <Text style={styles.notificationText}>Faltan {item.remainingPlayers} jugadores</Text>
    </TouchableOpacity>
  );

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Notificaciones</Text>
        {loading ? (
          <Text style={styles.infoText}>Cargando notificaciones...</Text>
        ) : notifications.length === 0 ? (
          <Text style={styles.infoText}>Todavia no hay notificaciones.</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={renderNotification}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#082512',
  },
  listContent: {
    paddingBottom: 120,
  },
  notificationBar: {
    backgroundColor: '#c9f37a',
    borderWidth: 1,
    borderColor: '#82a04d',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    minHeight: 70,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#082512',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 13,
    color: '#333',
  },
  infoText: {
    marginTop: 20,
    fontSize: 16,
    color: '#082512',
  },
});

export default NotificacionesScreen;
