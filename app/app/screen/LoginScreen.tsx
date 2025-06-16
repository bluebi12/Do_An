// Import các thư viện cần thiết
import React, { useState } from 'react';
import {Text,TextInput,View,StyleSheet,TouchableOpacity,Alert,ImageBackground,KeyboardAvoidingView,Platform,ScrollView,} from 'react-native';
import { auth } from '@/constants/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/components/Navigation';
import { router } from 'expo-router';

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
// State quản lý email, password, chế độ đăng ký, và hiển thị mật khẩu
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all the information!');
      return;
    }

    try {
      if (isRegistering) {
         // Đăng ký tài khoản
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Sign up successful!');
      } else {
        // Đăng nhập tài khoản
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Sign in successful!');
        setTimeout(() => {
        // Chuyển sang HomeScreen sau khi đăng nhập thành công
        router.replace('/screen/HomeScreen');
        }, 2000);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    }
  };
  const handleGoogleLogin = () => {
    Alert.alert('Đăng nhập', 'Đăng nhập bằng Google');
  };

  return ( 
    // Giao diện đăng nhập và đăng ký
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      resizeMode="cover"
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Text style={styles.header}>{isRegistering ? 'Sign Up' : 'Sign in'}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={24} color="#007aff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={24} color="#007aff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#007aff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleAuth}>
              <Text style={styles.buttonText}>{isRegistering ? 'Sign up' : 'Sign in'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
              <Text style={styles.switchText}>
                {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
              </Text>
            </TouchableOpacity>
            <View style={styles.orContainer}>
              <Text style={styles.orText}>Or</Text>
            </View>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
              <Ionicons name="logo-google" size={24} color="#fff" />
              <Text style={styles.socialText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    width: '100%',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    alignItems: 'center',
    width: '100%',
  },
  header: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 25,
    color: '#fff',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#007aff',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    marginTop: 20,
    backgroundColor: '#007aff',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  switchText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  orContainer: {
    marginVertical: 20,
  },
  orText: {
    color: '#fff',
    fontSize: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#db4437',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
  },
  socialText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
  },
});

export default LoginScreen;