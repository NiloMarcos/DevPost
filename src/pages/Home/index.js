import React, {useState, useContext, useEffect} from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

import firestore from '@react-native-firebase/firestore';
import {AuthContext} from '../../contexts/auth';

import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

import {Container, ButtonPost, ListPosts} from './styles';
import Header from '../../components/Header';
import PostsList from '../../components/PostsList';

export default function Home() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const {user} = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const subscriber = firestore()
                       .collection('posts')
                       .orderBy('created', 'desc')
                       .onSnapshot(snapshot => {
                        const postList = [];

                        snapshot.forEach(doc => {
                          postList.push({
                            ...doc.data(),
                            id: doc.id,
                          });
                        });
                        setPosts(postList);
                        setLoading(false);
                       })

                       return() => subscriber();
  }, []);

 return (
   <Container>
       <Header />

        {loading ? 
        (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size={50} color="#E52246"/>
          </View>
        ) :
        (
          <ListPosts 
          showsVerticalScrollIndicator={false}
          data={posts}
          renderItem={({item}) => <PostsList data={item} userId={user.uid}/>}
          />
        )
        }

       <ButtonPost onPress={() => navigation.navigate('NewPost')}>
        <Feather name="edit-2" color="#FFF" size={25} />
       </ButtonPost>
   </Container>
  );
}