const querystring = require('querystring'),
      clientID = process.env.REACT_APP_CLIENT_ID,
      redirectURI = process.env.REACT_APP_REDIRECT_URI,
      scope = 'user-top-read user-read-email playlist-modify-public',
      accessTokenField = 'access_token=',
      tokenTypeField = '&token_type';

 const joinArtists = (arrayArtists) => {
  let artists = [];
  for (let i = 0;i < arrayArtists.length; i++){
    artists.push(arrayArtists[i].name);
  }
  return artists.join(', ');
}

const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
   text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const getAuthURL = () => {
  return 'https://accounts.spotify.com/authorize?' +
  querystring.stringify({
   response_type: 'token',
   client_id: clientID,
   scope: scope,
   redirect_uri: redirectURI,
   state: generateRandomString(16),
   show_dialog: true
  });
}

const getAccessToken = (uri) => {
  if (!uri.includes(accessTokenField)){
    return '';
  }
  return uri.substring(uri.indexOf(accessTokenField) +
                accessTokenField.length, uri.indexOf(tokenTypeField));
}

const getRandomRGB = (n) => {
  let rgb = [];
  for (let i = 0; i < n; i++){
    rgb.push(`rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`);
  }

  return rgb;
}

const generateAnalysis = (energy, valence) => {
  let energyMessage = '',
      valenceMessage = '';

  if (energy > 66){
    energyMessage = 'you listen to higher energy songs';
  }else if (energy > 33){
    energyMessage = 'you listen to medium energy songs';
  }else{
    energyMessage = 'you listen to lower energy songs';
  }

  if (valence > 60){
    valenceMessage = 'you listen to more positive songs';
  }else if (valence > 40){
    valenceMessage = 'you listen to a mix of positive and negative songs';
  }else{
    valenceMessage = 'you listen to more negative songs';
  }


  return `Based on your listening habits, ${energyMessage}, and ${valenceMessage}`;
}

export {
          joinArtists,
          getAccessToken,
          getAuthURL,
          generateRandomString,
          getRandomRGB,
          generateAnalysis
        };
