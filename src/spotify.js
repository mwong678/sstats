const request = require('request-promise'),
      querystring = require('querystring');

const getTopTracks = (token, timeRange) => {
  const queryURL = querystring.stringify({
   time_range: timeRange,
   limit: 50
  });

  let options = {
    uri: 'https://api.spotify.com/v1/me/top/tracks?' + queryURL,
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };

  return request.get(options);
}

const getTopArtists = (token, timeRange) => {
  const queryURL = querystring.stringify({
   time_range: timeRange,
   limit: 50
  });

  let options = {
    uri: 'https://api.spotify.com/v1/me/top/artists?' + queryURL,

    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };

  return request.get(options);
}

const getUserProfile = (token) => {
  let options = {
    uri: 'https://api.spotify.com/v1/me',

    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };

  return request.get(options);
}

const getTrackStats = (token, ids) => {
  const queryURL = querystring.stringify({
   ids: ids.join()
  });

  let options = {
    uri: 'https://api.spotify.com/v1/audio-features/?' + queryURL,
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };

  return request.get(options)
}

const generatePlaylist = async (token, userId, name, description, uris) => {
  const playlistResult = await createPlaylist(token, userId, name, description);
  const playlistID = playlistResult.id;
  return addTracks(token, playlistID, uris);
}

const createPlaylist = (token, userId, name, description) => {
  let options = {
    uri: 'https://api.spotify.com/v1/users/' + userId + '/playlists',
    body:{
      name: name,
      description: description
    },
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };

  return request.post(options);
}

const addTracks = (token, playlistID, uris) => {
  let options = {
    uri: 'https://api.spotify.com/v1/playlists/' + playlistID + '/tracks',
    body:{
      uris: uris
    },
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };

  return request.post(options);
}

export {getTopTracks, getTopArtists, getUserProfile, getTrackStats, generatePlaylist};
