import React, {useContext, useState,useEffect} from 'react';
import {AuthContext} from '../../contexts/auth';

import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage';

import ImagePicker from 'react-native-image-picker';

import { Modal, Platform} from 'react-native';
import {Container, UploadingButton, UploadingText, Avatar, Name, Email, Button, ButtonText, ModalContainer, ButtonBack, Input} from './styles';

import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';


export default function Profile() {
  const {signOut, user, storageUser,setUser} = useContext(AuthContext);
  
  const [nome, setNome] = useState(user?.nome);
  const [url, setUrl] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load(){
      try{
        let response = await storage().ref('users').child(user?.uid).getDownloadURL();
        setUrl(response);
      }catch(err){
        console.log('ERROR, Nenhuma foto foi encontrada. ')
      }
    }
    load();
  }, [])

  // Atualizar Perfil
  async function updateProfile(){
    if(nome === ''){
      return;
    }

    await firestore().collection('users')
          .doc(user.uid).update({
            nome: nome
          })

          // Buscar todos os post desse usuario
          const postDocs = await firestore().collection('posts')
                                 .where('userId', '==', user.uid).get();

          // Percorrer e Atualizar o nome do autor do posts
          postDocs.forEach(async doc => {
            await firestore().collection('posts').doc(doc.id).update({
              autor: nome
            })

          })

          let data = {
            uid: user.uid,
            nome: nome,
            email: user.email
          };

          setUser(data);
          storageUser(data);
          setOpen(false);
  }

  const uploadFile = () => {
    const options = {
      noData: true,
      mediaType: 'photo'
    };

    ImagePicker.launchImageLibrary(options, response => {
      if(response.didCancel){
        console.log('CANCELOU O MODAL.');
      }else if(response.error){
        console.log('Parece que deu algum erro: ' + response.error);
      }else{

        uploadFileFirebase(response)
        .then(() => {
          uploadAvatarPosts();
        })
        setUrl(response.uri);

      }
    })
  }

  const getFileLocalPath = response => {
    const { path, uri } = response;
    return Platform.OS === 'android' ? path : uri;
  }

  const uploadFileFirebase = async response => {
    const fileSource = getFileLocalPath(response);
    const storageRef = storage().ref('users').child(user?.uid);
    return await storageRef.putFile(fileSource)
  }; 

  async function uploadAvatarPosts(){
    const storageRef = storage().ref('users').child(user?.uid);
    const url = await storageRef.getDownloadURL()
    .then(async image => {
      // Atualizar todos avatarUlr do post user
      const postDocs = await firestore().collection('posts')
      .where('userId', '==', user.uid).get();

      postDocs.forEach(async doc => {
        await firestore().collection('posts').doc(doc.id).update({
          avatarUrl: image
        })
      })
    })
    .catch((error) => {
      console.log(error);
    })
  }

 return (
   <Container>
     <Header />

     {
       url ?
       (
         <UploadingButton onPress={uploadFile}>
           <UploadingText> + </UploadingText>
           <Avatar source={{uri: url}}/>
         </UploadingButton>
       ) :
       (
        <UploadingButton onPress={uploadFile}>
          <UploadingText> + </UploadingText>
        </UploadingButton>
       )
     }

     <Name numberOfLines={1}>{user.nome}</Name>
     <Email numberOfLines={1}>{user.email}</Email>

     <Button bg="#428cfd" onPress={() => setOpen(true)}>
       <ButtonText color="#FFF">Atualizar Perfil</ButtonText>
     </Button>

     <Button bg="#F1F1F1" onPress={() => signOut()}>
       <ButtonText color="#3b3b3b">Sair</ButtonText>
     </Button>

     <Modal visible={open} animationType="fade" transparent={true} >
      <ModalContainer behavior={Platform.OS === 'android' ? '' : 'padding'}>
        <ButtonBack onPress={() => setOpen(false)}>
          <Feather name="arrow-left" size={22} color="#121212"/>
          <ButtonText color="#121212">Voltar</ButtonText>
        </ButtonBack>

        <Input placeholder={user?.nome} value={nome} onChangeText={(text) => setNome(text)}/>

        <Button bg="#428cfd" onPress={updateProfile}>
          <ButtonText color="#f1f1f1">Atualizar</ButtonText>
        </Button>


      </ModalContainer>
     </Modal>

   </Container>
  );
}