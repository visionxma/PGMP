// //C:\PROJETOS\PGMP\src\screens\auth\LoginScreen.js

// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useNavigation } from '@react-navigation/native';


// export default function LoginScreen() {
//   const [nome, setNome] = useState('');
//   const [email, setEmail] = useState('');
//   const [senha, setSenha] = useState('');
//   const [repetirSenha, setRepetirSenha] = useState('');
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const [isLogin, setIsLogin] = useState(true);
//   const [isPasswordFocused, setIsPasswordFocused] = useState(false);

//   const requisitosSenha = {
//     tamanhoMinimo: senha.length >= 6,
//     possuiMaiuscula: /[A-Z]/.test(senha),
//     possuiMinuscula: /[a-z]/.test(senha),
//     possuiNumero: /\d/.test(senha),
//   };

//   const validarNome = (nome) => /^[a-zA-Z\s]+$/.test(nome.trim());
//   const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   const senhaValida = Object.values(requisitosSenha).every((item) => item);

//   useEffect(() => {
//     const unsubscribe = auth().onAuthStateChanged((user) => {
//       if (user) {
//         console.log('Usuário autenticado, navegação será tratada pelo App.js.');
//       }
//     });
//     return unsubscribe;
//   }, []);
  
//   const navigation = useNavigation();

//   const handleAuthentication = async () => {
//     if (!isLogin && !validarNome(nome)) {
//       alert('Por favor, insira um nome válido contendo apenas letras.');
//       return;
//     }

//     if (!validarEmail(email)) {
//       alert('Por favor, insira um email válido.');
//       return;
//     }

//     if (!senhaValida) {
//       alert('A senha deve conter pelo menos 6 caracteres, incluindo uma letra maiúscula, uma letra minúscula e um número.');
//       return;
//     }

//     if (!isLogin && senha !== repetirSenha) {
//       alert('As senhas não coincidem. Por favor, verifique.');
//       return;
//     }

//     try {
//       if (isLogin) {
//         await auth().signInWithEmailAndPassword(/*auth,*/ email, senha);
//         await AsyncStorage.setItem('userEmail', email);
//       } else {
//         await auth().createUserWithEmailAndPassword(/*auth,*/ email, senha);
//         await AsyncStorage.setItem('userEmail', email);
//       }
//     } catch (error) {
//       if (error.code === 'auth/email-alread y-in-use') {
//         alert('O e-mail já está em uso. Por favor, use outro e-mail ou faça login.');
//       } else if (error.code === 'auth/invalid-email') {
//         alert('O e-mail fornecido é inválido.');
//       } else if (error.code === 'auth/weak-password') {
//         alert('A senha é muito fraca. Por favor, crie uma senha mais forte.');
//       } else {
//         alert('Erro de autenticação: ' + error.message);
//       }
//     }
//   };
  

//   return (
//       <View style={styles.authContainer}>
// <Image source={require('../../../assets/logo.png')} style={styles.logo} />

// <Text style={styles.welcome}>
//     {isLogin ? 'Entre para acessar seus dados' : 'Crie uma conta para começar a ter um controle avançado'}
//   </Text>
    
// {!isLogin && ( // Campo Nome apenas na tela de cadastro
//   <>
//     <Text style={styles.label}>Nome</Text>
//     <TextInput
//       style={styles.input}
//       value={nome}
//       onChangeText={setNome}
//       placeholder="Digite o seu nome"
//       autoCapitalize="none"
//     />
//   </>
// )}

// <Text style={styles.label}>E-mail</Text>
// <TextInput
//   style={styles.input}
//   value={email}
//   onChangeText={setEmail}
//   placeholder="Digite seu e-mail"
//   autoCapitalize="none"
// />

// <Text style={styles.label}>Senha</Text>
// <View style={styles.passwordContainer}>
//   <TextInput
//     style={styles.passwordInput}
//     value={senha}
//     onChangeText={setSenha}
//     placeholder="Digite sua senha"
//     secureTextEntry={!isPasswordVisible}
//     onFocus={() => setIsPasswordFocused(true)}
//     onBlur={() => setIsPasswordFocused(false)}
//   />
//   <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
//     <Icon
//       name={isPasswordVisible ? 'visibility' : 'visibility-off'}
//       size={24}
//       color="#058301"
//     />
//   </TouchableOpacity>
// </View>

// {isLogin && (<TouchableOpacity onPress={() => navigation.navigate("RedefinirSenha")}>
//   <Text style={{ color: "#058301", marginTop: 5, marginLeft: 270, marginBottom: 15 }}>
//     Esqueceu sua senha?
//   </Text>
// </TouchableOpacity>
// )}


// {!isLogin && ( // Campo Repetir Senha apenas na tela de cadastro
//   <>
//     <Text style={styles.label}>Repetir Senha</Text>
//     <View style={styles.passwordContainer}>
//       <TextInput
//         style={styles.passwordInput}
//         value={repetirSenha}
//         onChangeText={setRepetirSenha}
//         placeholder="Repita sua senha"
//         secureTextEntry={!isPasswordVisible}
//       />
//       <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
//         <Icon
//           name={isPasswordVisible ? 'visibility' : 'visibility-off'}
//           size={24}
//           color="#058301"
//         />
//       </TouchableOpacity>
//     </View>
//   </>
// )}

// {!isLogin && isPasswordFocused && (
//   <View style={styles.requisitosContainer}>
//     <Text style={requisitosSenha.tamanhoMinimo ? styles.valid : styles.invalid}>
//       - Pelo menos 6 caracteres
//     </Text>
//     <Text style={requisitosSenha.possuiMaiuscula ? styles.valid : styles.invalid}>
//       - Pelo menos 1 letra maiúscula
//     </Text>
//     <Text style={requisitosSenha.possuiMinuscula ? styles.valid : styles.invalid}>
//       - Pelo menos 1 letra minúscula
//     </Text>
//     <Text style={requisitosSenha.possuiNumero ? styles.valid : styles.invalid}>
//       - Pelo menos 1 número
//     </Text>
//   </View>
// )}

//         <View style={styles.buttonContainer}>
//           <Button  title={isLogin ? 'Entrar' : 'Cadastrar'} onPress={handleAuthentication} color="#058301" />
//         </View>

//         <Text style={styles.ou}>ou</Text>
//         <Text></Text>


//         <View style={styles.buttonContainer}>
//         <SigninGoogle
//         androidClientId="1032695653888-ctl8rqffmniqn8m895qreu4mq2s7lrvl.apps.googleusercontent.com"
//         text="Entrar com Google"
//         style={{
//           fontSize: 18,
//           heigth: 56,
//           borderRadius: 12
//         }
//       }
// />


// <View style={styles.legalContainer}>
//   <Text style={styles.legalText}>
//     Ao continuar, você concorda com nossos{" "}
//     <Text
//       style={styles.linkText}
//       onPress={() => navigation.navigate("TermsOfUse")}
//     >
//       Termos de Uso
//     </Text>{" "}
//     e{" "}
//     <Text
//       style={styles.linkText}
//       onPress={() => navigation.navigate("Privacy")}
//     >
//       Política de Privacidade
//     </Text>.
//   </Text>
// </View>



 

// </View>
// <TouchableOpacity 
//   onPress={() => setIsLogin(!isLogin)} 
//   activeOpacity={0.6} // Reduz a opacidade ao toque
// >
//   <Text style={styles.toggleText}>
//     {isLogin ? 'Precisa de uma conta? Cadastre-se' : 'Já tem uma conta? Conecte-se'}
//   </Text>
// </TouchableOpacity>
//       </View>
//   );
// }