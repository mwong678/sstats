const request = require('request-promise'),
      querystring = require('querystring');

function getTopTracks(token, timeRange){
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

function getTopArtists(token, timeRange){
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

export {getTopTracks, getTopArtists};
