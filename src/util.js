const querystring = require('querystring'),
      isProduction = (process.env.isProduction === 'true'),
      properties = isProduction ? '' : require('./properties.json'),
      clientID = isProduction ? process.env.clientID: properties.clientID,
      redirectURI = isProduction ? process.env.redirectURI: properties.redirectURI,
      scope = 'user-top-read',
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

export {joinArtists, getAccessToken, getAuthURL, generateRandomString};
