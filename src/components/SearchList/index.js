import React from 'react';
import { View, Text } from 'react-native';

import {useNavigation} from '@react-navigation/native';

import {Container, Name} from './styles';

export default function SearchList({data}){
 const navigation = useNavigation();

 return (
   <Container onPress={() => navigation.navigate('PostUser', {title: data.nome, userId: data.id})}>
       <Name>{data.nome}</Name>
   </Container>
  );
}