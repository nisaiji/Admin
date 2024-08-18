import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import { getItem, KEY_ACCESS_TOKEN } from '../services/LocalStorageManager';

export default function NotRequireUser () {
  const user = getItem(KEY_ACCESS_TOKEN);
  return !user ? <Outlet /> : <Navigate to="/" />;
}