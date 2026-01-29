import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuthState } from './authStore';

export function useNotifications() {
  const { user } = useAuthState();
  const registerPushToken = useMutation(api.auth.registerPushToken);

  useEffect(() => {
    // Expo push notifications are not supported on web, and we currently
    // haven't enabled admin-triggered pushes anyway.
    if (Platform.OS === 'web') return;
    if (!user) return;

    // Configure notification behavior (native only)
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const setupNotifications = async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
          });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          return;
        }

        const projectId =
          (Constants.expoConfig as any)?.extra?.eas?.projectId ??
          (Constants as any)?.easConfig?.projectId;

        const token = projectId
          ? await Notifications.getExpoPushTokenAsync({ projectId })
          : await Notifications.getExpoPushTokenAsync();

        await registerPushToken({
          userId: user.userId,
          pushToken: token.data,
        });
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    const notificationListener = Notifications.addNotificationReceivedListener(() => {});
    const responseListener = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [user, registerPushToken]);

  return {};
}