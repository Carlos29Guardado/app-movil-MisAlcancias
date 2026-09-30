import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ListaAlcanciasScreen() {
  const router = useRouter();
  const [alcancias, setAlcancias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Función para obtener los datos del backend
  const cargarAlcancias = async () => {
    try {
      const usuarioString = await AsyncStorage.getItem('userData');
      if(!usuarioString){
        Alert.alert('Error', 'No se encontró la sesión del usuario');
        setCargando(false);
        setRefrescando(false);
        return;
      }
      const usuario = JSON.parse(usuarioString);
      const respuesta = await fetch(`http://192.168.10.225:3000/api/alcancias/comunidad/${usuario.comunidad_id}`); 
      const datos = await respuesta.json();

      if (respuesta.ok) {
        setAlcancias(datos);
      } else {
        Alert.alert('Error', datos.error || 'No se pudieron cargar las alcancías.');
      }
    } catch (error) {
      console.error('Error al cargar la lista:', error);
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  // Se ejecuta automáticamente al abrir la pantalla
 useFocusEffect(
    useCallback(() => {
      cargarAlcancias();
    }, [])
  );

  // Función para jalar hacia abajo y recargar
  const onRefresh = () => {
    setRefrescando(true);
    cargarAlcancias();
  };

  // Función para determinar qué estado mostrar basado en los booleanos de tu BD
  const obtenerInfoEstado = (item: any) => {
    if (item.faltante) return { texto: 'Faltante', color: '#C06C6C', fondo: 'rgba(192, 108, 108, 0.2)' }; // Rojo oscuro
    if (item.devuelta) return { texto: 'Devuelta', color: '#8FBC8F', fondo: 'rgba(143, 188, 143, 0.2)' }; // Verde sutil
    return { texto: 'Colocada', color: '#C2DFE3', fondo: 'rgba(194, 223, 227, 0.2)' }; // Celeste por defecto
  };

  // El diseño de cada tarjeta individual de la lista
  const renderItem = ({ item }: { item: any }) => {
    const estado = obtenerInfoEstado(item);

    return (
      <TouchableOpacity 
      style={styles.tarjeta} 
      activeOpacity={0.7}

      onPress={() => router.push({
          pathname: '/editar_alcancia',
          params: { 
            codigo_alcancia: item.codigo_alcancia,
            nombre_persona: item.nombre_persona,
            estado_actual: estado.texto, 
            monto_actual: item.monto_entregado ? item.monto_entregado.toString() : ''
          }
        })}
      
      
      >
        
        {/* Fila superior: Código y Estado */}
        <View style={styles.tarjetaHeader}>
          <Text style={styles.numeroTexto}>#{item.codigo_alcancia}</Text>
          <View style={[styles.badgeEstado, { backgroundColor: estado.fondo }]}>
            <Text style={[styles.textoEstado, { color: estado.color }]}>{estado.texto}</Text>
          </View>
        </View>

        {/* Fila media: Nombre de la persona */}
        <Text style={styles.nombreTexto}>{item.nombre_persona}</Text>

        {/* Fila inferior: Monto */}
        <View style={styles.filaMonto}>
          <Text style={styles.labelMonto}>Monto:</Text>
          <Text style={[
            styles.valorMonto, 
            !item.monto_entregado && { color: '#9AA8AC', fontStyle: 'italic' }
          ]}>
            {item.monto_entregado ? `$${Number(item.monto_entregado).toFixed(2)}` : 'Pendiente'}
          </Text>
        </View>

      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonRegresar}>
          <Ionicons name="arrow-back" size={28} color="#C2DFE3" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Lista de Alcancías</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Cuerpo principal */}
      {cargando ? (
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#C2DFE3" />
          <Text style={styles.textoCargando}>Cargando datos...</Text>
        </View>
      ) : (
        <FlatList
          data={alcancias}
          keyExtractor={(item, index) => index.toString()} 
          renderItem={renderItem}
          contentContainerStyle={styles.listaPadding}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={onRefresh}
              tintColor="#C2DFE3" 
              colors={['#1E292D']} 
              progressBackgroundColor="#C2DFE3"
            />
          }
          ListEmptyComponent={
            <View style={styles.vacioContainer}>
              <Ionicons name="file-tray-outline" size={60} color="#3A4A50" />
              <Text style={styles.textoVacio}>No hay alcancías registradas aún.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#253237',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1E292D',
  },
  botonRegresar: {
    padding: 5,
  },
  tituloHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cargandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCargando: {
    color: '#9AA8AC',
    marginTop: 10,
    fontSize: 16,
  },
  listaPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  tarjeta: {
    backgroundColor: '#1E292D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3A4A50',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoPrincipal: {
    flex: 1,
  },
  numeroTexto: {
    color: '#C2DFE3',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  nombreTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  badgeEstado: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  textoEstado: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  filaMonto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#253237',
  },
  labelMonto: {
    color: '#9AA8AC',
    fontSize: 14,
  },
  valorMonto: {
    color: '#8FBC8F',
    fontSize: 18,
    fontWeight: 'bold',
  },
  vacioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  textoVacio: {
    color: '#9AA8AC',
    fontSize: 16,
    marginTop: 15,
  },
});