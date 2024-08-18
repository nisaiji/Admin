
export const KEY_ACCESS_TOKEN = 'access_token';

export function getItem(key){
    return localStorage.getItem(key);
}

export function setItem(value){
    localStorage.setItem(KEY_ACCESS_TOKEN,value);
}

export function removeItem(key){
    localStorage.removeItem(key);
}

export function setUsername(value){
    localStorage.setItem("username",value);
}

export function setFirstname(value){
    localStorage.setItem("firstname",value);
}
