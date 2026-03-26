import { Redirect } from 'expo-router';

export default function RutaInicial() {
  return <Redirect href="/(auth)/login" />;
}
