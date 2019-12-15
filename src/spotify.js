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

export {getTopTracks, getTopArtists, getUserProfile};
