import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/config';

export default function BienvenidaScreen() {
  const router = useRouter();

  const [verificando, setVerificando] = useState(true);

  const [mostrarInput, setMostrarInput] = useState(false);//Estado para controlar si el input está visible o no
  const [codigo, setCodigo] = useState('');//Estado para guardar el codigo que escribe el usuario.

  useEffect(()=>{
    const checarEstadoUsuario = async () => {
      try {
        const usuarioString = await AsyncStorage.getItem('userData');
        if(usuarioString){
          const usuario = JSON.parse(usuarioString);

          if(usuario.comunidad_id){
            router.replace('/explore');
            return;
          }
        }
      } catch (error) {
        console.error('Error al leer el stirage:', error);
      } finally{
        setVerificando(false);
      }
    };
    checarEstadoUsuario();
  }, []);

  //Logica del boton si
  const manejarBotonSi = async () => {
    if (!mostrarInput) {
      setMostrarInput(true);
    } else {
      if (!codigo.trim()) {
        Alert.alert('Error', 'Por favor ingresa el código de verificación.');
        return;
      }

      try {
        const usuarioString = await AsyncStorage.getItem('userData');
        if (!usuarioString) {
          Alert.alert('Error', 'No se encontro la sesión del usuario')
          return;
        }

        const usuario = JSON.parse(usuarioString);
        const respuesta = await fetch(`${API_URL}/comunidad/unirse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            codigo_invitacion: codigo,
            emailUsuario: usuario.email, // Enviamos el email para identificarlo en la BD
          }),
        });

        const data = await respuesta.json();
        if (respuesta.ok) {
          // 3. Actualizar la sesión local con el nuevo comunidad_id
          usuario.comunidad_id = data.comunidad_id;
          usuario.comunidad_nombre = data.comunidad_nombre;
          await AsyncStorage.setItem('userData', JSON.stringify(usuario));

          Alert.alert('¡Éxito!', `Te has unido al grupo: ${data.comunidad_nombre}`);

          // 4. Redirigir al menú principal (ajusta la ruta según tu archivo)
          router.replace('/explore'); 
        } else {
          // El código no existe o es inválido
          Alert.alert('Error', data.mensaje);
        }
      } catch (error) {
        console.error('Error en la petición:', error);
        Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
      }
    }
  };
  if (verificando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    // 1. Envolvemos toda la pantalla para evitar el teclado
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 2. Permite cerrar el teclado al tocar el fondo oscuro */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>!Bienvenido!</Text>
            <Text style={styles.subtitle}>¿Ya estas unido a una comunidad?</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={manejarBotonSi}>
              <Text style={styles.primaryButtonText}>
                {mostrarInput ? 'Verificar código' : 'Sí, tengo un codigo'}
              </Text>
            </TouchableOpacity>

            {mostrarInput && (
              <View style={{ width: '100%', alignItems: 'center', marginBottom: 15 }}>
                <TextInput
                  style={[styles.input, { textAlign: 'left', paddingHorizontal: 15, marginBottom: 10 }]}
                  placeholder="Código de verificación"
                  placeholderTextColor="#a0a0a0"
                  value={codigo}
                  onChangeText={setCodigo}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  onPress={() => {
                    setMostrarInput(false);
                    setCodigo('');
                  }}
                >
                  <Text style={{ color: '#C2DFE3', fontSize: 15, textDecorationLine: 'underline' }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/crear_comunidad')}
            >
              <Text style={styles.primaryButtonText}>No, crear una comunidad</Text>
            </TouchableOpacity>
          </View>
        </View>

      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#253237',
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E0FBFC',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0FBFC',
  },
  buttonsContainer: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#C2DFE3',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#253237',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 30,
    textAlign: 'center', // Centrado suele verse mejor cuando empuja los botones
  },
});