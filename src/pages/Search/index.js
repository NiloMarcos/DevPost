import React, {useState, useEffect} from 'react';
import { View, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Feather from 'react-native-vector-icons/Feather'

import SearchList from '../../components/SearchList';

import {Container, AreaInput, Input, List} from './styles';

export default function Search() {
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);


  useEffect(() => {
    if(input === '' || input === undefined){
      setUsers([]);
      return;
    }

    const subscriber = firestore().collection('users')
                       .where('nome', '>=', input)
                       .where('nome', '<=', input + "\uf8ff")
                       .onSnapshot(snapshot => {
                         const ListUsers = [];

                         snapshot.forEach(doc => {
                           ListUsers.push({
                             ...doc.data(),
                             id: doc.id
                           });
                         });

                         setUsers(ListUsers);
                         console.log(ListUsers);

                       })

                       return () => subscriber();

  }, [input]);

 return (
   <Container>
       <AreaInput>
        <Feather name="search" size={20} color="#e52246"/>

        <Input placeholder="Procurando alguem?" 
               placeholderTextColor="#353840" 
               value={input} 
               onChangeText={(text) => setInput(text)}
        />
       </AreaInput>

       <List 
       showVerticalSchollIndicator={false}
       data={users}
       keyExtractor={(item) => item.id }
       renderItem={({item}) => <SearchList  data={item} />}
       />
   </Container>
  );
}