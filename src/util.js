

function joinArtists(arrayArtists){
  let artists = [];
  for (let i = 0;i < arrayArtists.length; i++){
    artists.push(arrayArtists[i].name);
  }
  return artists.join(', ');
}

export {joinArtists};
