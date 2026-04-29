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
  type: 'player_joined' | 'match_completed';
  playerName?: string;
  remainingPlayers: number;
  createdAt: number;
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
        const notificationsStorageKey = `notifications:${userId}`;
        const storedNotificationsRaw = await AsyncStorage.getItem(notificationsStorageKey);
        const storedNotifications: NotificationItem[] = storedNotificationsRaw
          ? JSON.parse(storedNotificationsRaw)
          : [];
        const storedById = new Map(storedNotifications.map(notification => [notification.id, notification]));
        const builtNotifications: NotificationItem[] = [];
        let orderSeed = Date.now();

        for (const match of ownMatches) {
          const playersJoined = (match.players || []).filter(playerId => playerId !== userId);
          const remainingPlayers = Math.max(match.requiredPlayers || 0, 0);

          for (let index = 0; index < playersJoined.length; index += 1) {
            const playerId = playersJoined[index];
            let playerName = 'Un jugador';
            const remainingPlayersAtJoin = Math.max((match.requiredPlayers || 0) + (playersJoined.length - index - 1), 0);
            const notificationId = `${match.id}-${playerId}`;

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

            const storedNotification = storedById.get(notificationId);

            if (storedNotification) {
              builtNotifications.push({
                ...storedNotification,
                matchTitle: match.title,
              });
            } else {
              builtNotifications.push({
                id: notificationId,
                matchId: match.id,
                matchTitle: match.title,
                type: 'player_joined',
                playerName,
                remainingPlayers: remainingPlayersAtJoin,
                createdAt: orderSeed,
              });
              orderSeed += 1;
            }
          }

          if (remainingPlayers === 0 && playersJoined.length > 0) {
            const notificationId = `${match.id}-completed`;
            const storedNotification = storedById.get(notificationId);

            if (storedNotification) {
              builtNotifications.push({
                ...storedNotification,
                matchTitle: match.title,
              });
            } else {
              builtNotifications.push({
                id: notificationId,
                matchId: match.id,
                matchTitle: match.title,
                type: 'match_completed',
                remainingPlayers,
                createdAt: orderSeed,
              });
              orderSeed += 1;
            }
          }
        }

        builtNotifications.sort((a, b) => b.createdAt - a.createdAt);
        await AsyncStorage.setItem(notificationsStorageKey, JSON.stringify(builtNotifications));

        const readNotificationsKey = `readNotificationIds:${userId}`;
        const currentNotificationIds = builtNotifications.map(notification => notification.id);
        const readNotificationsRaw = await AsyncStorage.getItem(readNotificationsKey);
        const readNotificationIds: string[] = readNotificationsRaw ? JSON.parse(readNotificationsRaw) : [];
        const mergedReadNotificationIds = Array.from(new Set([...readNotificationIds, ...currentNotificationIds]));

        await AsyncStorage.setItem(readNotificationsKey, JSON.stringify(mergedReadNotificationIds));
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
      {item.type === 'match_completed' ? (
        <Text style={styles.notificationText}>Tu partido está completo</Text>
      ) : (
        <Text style={styles.notificationText}>{item.playerName} se sumó a tu partido</Text>
      )}
      {item.type === 'player_joined' ? (
        <Text style={styles.notificationText}>
          {item.remainingPlayers === 0
            ? 'Ya no faltan jugadores'
            : `${item.remainingPlayers === 1 ? 'Falta' : 'Faltan'} ${item.remainingPlayers} ${item.remainingPlayers === 1 ? 'jugador' : 'jugadores'}`}
        </Text>
      ) : null}
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
