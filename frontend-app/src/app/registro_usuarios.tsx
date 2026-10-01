import React, { use, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../../config/config';
import { Ionicons } from '@expo/vector-icons';

export default function RegistroScreen() {
  const router = useRouter();

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const registrarUsuario = async () => {
    if (!nombre || !email || !password || !confirmarPassword) {
      Alert.alert('Datos incompletos', 'Por favor, llena todos los campos');
      return;
    }
    if (password !== confirmarPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    try {
      const respuesta = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        Alert.alert('Éxito', 'Tu cuenta ha sido creada correctamente.');
        router.back();
      } else {
        Alert.alert('Error', data.mensaje || 'No se pudo crear la cuenta.');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a Recauda</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          placeholderTextColor="#9DB4C0"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo"
          placeholderTextColor="#9DB4C0"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"/>
          {/* Campo de Contraseña */}
<View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            placeholderTextColor="#9DB4C0"
            secureTextEntry={!mostrarPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setMostrarPassword(!mostrarPassword)}
          >
            <Ionicons
              name={mostrarPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#9DB4C0"
            />
          </TouchableOpacity>
        </View>

        {/* Campo de Confirmar Contraseña */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#9DB4C0"
            secureTextEntry={!mostrarConfirmarPassword}
            value={confirmarPassword}
            onChangeText={setConfirmarPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
          >
            <Ionicons
              name={mostrarConfirmarPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#9DB4C0"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={registrarUsuario}>
          <Text style={styles.primaryButtonText}>Registrarse</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#253237',
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  passwordContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#5C6B73', 
    borderRadius: 12,
    paddingHorizontal: 16, 
    height: 55, 
    marginBottom: 16, 
  },
  passwordInput: {
    flex: 1, 
    color: '#FFFFFF',
    fontSize: 16, 
    height: '100%',
    padding: 0, 
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#E0FBFC',
  },
  subtitle: {
    fontSize: 14,
    color: '#9DB4C0',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#5C6B73',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#9DB4C0',
    fontSize: 15,
  },
  loginLink: {
    color: '#E0FBFC',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
