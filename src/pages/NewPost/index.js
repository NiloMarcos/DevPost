import React, {useState, useLayoutEffect, useContext} from 'react';
import {useNavigation} from '@react-navigation/native';

import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {AuthContext} from '../../contexts/auth';

import {Container, Input, Button, ButtonText} from './styles';

export default function NewPost() {
  const [post, setPost] = useState('');
  const navigation = useNavigation();
  const {user} = useContext(AuthContext);

  useLayoutEffect(() => {
    const options = navigation.setOptions({
      headerRight: () => (
        <Button onPress={() => handlePost()}>  
          <ButtonText>Compartilhar</ButtonText>  
        </Button>
      )
    })
  }, [navigation, post]);

  async function handlePost(){
    if(post === ''){
      console.log('Seu post contem conteudo invalido.');
      return;
    }

    let avatarUrl = null;
    try{
      let response = await storage().ref('users').child(user?.uid).getDownloadURL();
      avatarUrl = response;

    }catch(err){
      avatarUrl = null;
    }

    await firestore().collection('posts')
    .add({
      created: new Date(),
      content: post,
      autor: user.nome,
      likes: 0,
      avatarUrl,
      userId: user.uid,
    })
    .then(() => {
      setPost('');
      console.log('Post Realizado com Sucesso')
    })
    .catch((error) => {
      console.log(error);
    })

    navigation.goBack();
  }


 return (
   <Container>
       <Input placeholder="O que esta acontecendo?" 
              placeholderTextColor="#DDD" 
              multiline={true}
              maxLength={300}
              value={post}
              onChangeText={(text) => setPost(text)}
              autoCorrect={false}
              />
   </Container>
  );
}