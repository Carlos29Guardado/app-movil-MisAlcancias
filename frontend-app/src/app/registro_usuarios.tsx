import React, { use, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegistroScreen() {
    const router = useRouter();

    const [nombre, setNombre] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ confirmarPassword, setConfirmarPassword ] = useState('');

    const registrarUsuario = async () => {
        if(!nombre || !email || !password || !confirmarPassword){
            Alert.alert('Datos incompletos', 'Por favor, llena todos los campos');
            return;
        }
        if(password !== confirmarPassword){
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }
        try {
      const respuesta = await fetch('http://192.168.10.225:3000/api/auth/registro', {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Únete a Mis Alcancías</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Confirmar Password"
        placeholderTextColor="#9DB4C0"
        secureTextEntry
        value={confirmarPassword}
        onChangeText={setConfirmarPassword}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={registrarUsuario}>
        <Text style={styles.primaryButtonText}>Registrarse</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.loginLink}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
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
