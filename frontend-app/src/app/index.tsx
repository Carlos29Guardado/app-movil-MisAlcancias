import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Link } from 'expo-router';
// Configuración global de Google
GoogleSignin.configure({
  webClientId: '106176284106-krnssjjd8i427cl9nh3vtitatjtu2u6j.apps.googleusercontent.com',
});

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const iniciarSesionNativo = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();

      // En las versiones más recientes de la librería, el token puede venir anidado en .data
      const idToken = userInfo.data?.idToken;

      const respuesta = await fetch('http://192.168.10.225:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      const data = await respuesta.json();

      if (data.token && data.usuario) {
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.usuario));
        router.replace('/bienvenida'); 
      } else {
        Alert.alert('Error', 'No se pudo verificar el usuario en tu base de datos.');
      }
    } catch (error) {
      console.error('Error en el login nativo:', error);
      Alert.alert('Cancelado', 'El inicio de sesión fue cancelado o hubo un error.');
    }
  };
  const iniciarSesionManual = async () => {
    if (!email || !password) {
      Alert.alert('Datos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      // Nota: Asumo que crearás esta ruta '/login' en tu backend
      const respuesta = await fetch('http://192.168.10.225:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await respuesta.json();

      if (data.token && data.usuario) {
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.usuario));
        router.replace('/bienvenida'); 
      } else {
        Alert.alert('Error', data.mensaje || 'Credenciales incorrectas.');
      }
    } catch (error) {
      console.error('Error en login manual:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };


  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Ingresar</Text>
        <Text style={styles.subtitle}>Bienvenido a Mis Alcancías</Text>
      </View>

      {/* Campos de texto (Para futuro uso) */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9DB4C0"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address" 

      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9DB4C0"
        secureTextEntry 
        value={password}
        onChangeText={setPassword}
      />

      {/* Botón Principal (Log In manual) */}
      <TouchableOpacity style={styles.primaryButton} onPress={iniciarSesionManual}>
        <Text style={styles.primaryButtonText}>Log In</Text>
      </TouchableOpacity>

      {/* --- NUEVO: Enlace de Registro --- */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
        <Link href="/registro_usuarios" asChild>
          <TouchableOpacity>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Separador "Or" */}
      <View style={styles.separatorContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.line} />
      </View>

      {/* Botón de Google */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={iniciarSesionNativo}
      >
        <AntDesign name="google" size={24} color="#253237" style={styles.googleIcon} />
        <Text style={styles.googleButtonText}>Iniciar con Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#253237', // Fondo oscuro Jet Black
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#E0FBFC', // Tono claro para resaltar
  },
  subtitle: {
    fontSize: 14,
    color: '#9DB4C0',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#5C6B73', // Fondo gris azulado
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#C2DFE3',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#253237',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 35,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#9DB4C0',
    opacity: 0.5,
  },
  orText: {
    color: '#E0FBFC',
    marginHorizontal: 15,
    fontWeight: '600',
    fontSize: 16,
  },
  googleButton: {
    backgroundColor: '#E0FBFC', // Fondo casi blanco
    borderRadius: 25,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#253237', // Letra oscura para buen contraste
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20, // Reducido para que quede cerquita del botón de Log In
  },
  registerText: {
    color: '#9DB4C0',
    fontSize: 15,
  },
  registerLink: {
    color: '#E0FBFC',
    fontSize: 15,
    fontWeight: 'bold',
  },
});