import React from 'react';
import ReactDOM from 'react-dom';
import Chart from 'chart.js';
import './styles.css';
import {getTopTracks, getTopArtists, getUserProfile, getTrackStats, generatePlaylist} from './spotify'
import {joinArtists, getAccessToken, getAuthURL, getRandomRGB, generateAnalysis} from './util'

const rootElement = document.getElementById('root'),
      timeRanges = ['short_term', 'medium_term', 'long_term'];

class Dashboard extends React.Component {
  constructor(){
    super();

    let currentURI = window.location.href,
        accessToken = getAccessToken(currentURI);

    this.state = {
      'accessToken': accessToken,
      'currTrackTimeRange': 'medium_term',
      'currArtistTimeRange': 'medium_term',
      'displayName': '',
      'userId': '',
      'tracks': {
        'short_term': [],
        'medium_term': [],
        'long_term': []
      },
      'artists': {
        'short_term': [],
        'medium_term': [],
        'long_term': []
      },
      'stats': {
        'short_term': {
          'energy': 0,
          'tempo': 0,
          'valence': 0
        },
        'medium_term' : {
          'energy': 0,
          'tempo': 0,
          'valence': 0
        },
        'long_term': {
          'energy': 0,
          'tempo': 0,
          'valence': 0
        }
      },
      'genres': {},
      'welcome' : {display: 'block'},
      'app' : {display: 'none'},
      'loading' : {display: 'none'},
      'trackSection': {display: 'block'},
      'artistSection': {display: 'none'},
      'statSection': {display: 'none'}
    };
  }

  async componentDidMount(){
    if (this.state.accessToken !== ''){
      this.setState({ 'loading': {display: 'block'}});

      this.userProfile();
      await this.parseArtists();
      await this.parseTracks();
      this.initGenreChart();
      this.setState({ 'welcome': {display: 'none'}, 'app': {display: 'block'}});
    }else{
      this.setState({ 'welcome': {display: 'block'}, 'app': {display: 'none'}});
    }
  }

  initGenreChart = () => {
    let n = Math.floor(Object.keys(this.state.genres).length * .09),
        rgba = getRandomRGB(n),
        topGenres = this.getTopGenres(n),
        genreNames = topGenres.map(g => g[0]),
        genreValues = topGenres.map(g => g[1]);

    let genreChart = new Chart(document.getElementById('genreChart'), {
        type: 'horizontalBar',
        data: {
          labels: genreNames,
          datasets: [{
              data: genreValues,
              backgroundColor: rgba,
              borderColor: rgba,
              borderWidth: 1,
              barPercentage: .5
          }]
      },
      options: {
          legend: {
            display: false
          },
          scales: {
              xAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
    });
  };

  getTopGenres = (n) => {
    let toSort = [];
    for (let genre in this.state.genres){
      toSort.push([genre, this.state.genres[genre]]);
    }
    toSort.sort((a,b) => {return b[1] - a[1]});
    return toSort.slice(0, n);
  };

  userProfile = async () => {
    const profile = await getUserProfile(this.state.accessToken);
    this.setState({'displayName': profile.display_name});
    this.setState({'userId': profile.id});
  };

  parseTracks = async () => {
    for (let i = 0; i < timeRanges.length; i++){
      let currRange = timeRanges[i];
      let songList = [];
      let ids = [];

      const tracks = await getTopTracks(this.state.accessToken, currRange);

      for (let i = 0; i < tracks.items.length; i++){
        let curr = tracks.items[i];
        songList.push({
                        name: curr.name,
                        artists: joinArtists(curr.artists),
                        popularity: curr.popularity,
                        id: curr.id,
                        uri: curr.uri,
                        link: curr.external_urls.spotify,
                        picture: (curr.album.images.length > 0) ? curr.album.images[2].url : ''
                      });
        ids.push(curr.id);
      }

      let tempTracks = this.state.tracks;
      tempTracks[currRange] = songList;
      this.setState({'tracks': tempTracks});

      let avgEnergy = 0,
          avgTempo = 0,
          avgValence = 0;

      const analysis = await getTrackStats(this.state.accessToken, ids);

      for (let j = 0; j < analysis.audio_features.length; j++){
        let curr = analysis.audio_features[j];
        avgEnergy += curr.energy;
        avgTempo += curr.tempo;
        avgValence += curr.valence;
        //console.log(tracks.items[j].name + ': ' + curr.valence);
      }

      let tempStats = this.state.stats;
      tempStats[currRange] = {
                                'energy': Math.round((avgEnergy / 50) * 100),
                                'tempo': Math.round(avgTempo / 50),
                                'valence': Math.round((avgValence / 50) * 100)
                              };
      this.setState({'stats': tempStats});
    }
  }

  parseArtists = async () => {

    for (let i = 0; i < timeRanges.length; i++){
      let artistList = [];
      let tempGenres = this.state.genres;
      let currRange = timeRanges[i];
      const artists = await getTopArtists(this.state.accessToken, currRange);

      for (let i = 0; i < artists.items.length; i++){
        let curr = artists.items[i];
        artistList.push({
                        name: curr.name,
                        id: curr.name,
                        popularity: curr.popularity,
                        genres: curr.genres,
                        link: curr.external_urls.spotify,
                        picture: (curr.images.length > 0) ? curr.images[1].url : ''
                      });
        for (let j = 0; j < curr.genres.length; j++){
          let currGenre = curr.genres[j];
          if (currGenre in tempGenres){
            tempGenres[currGenre]++;
          }else{
            tempGenres[currGenre] = 1;
          }
        }

        let tempArtists = this.state.artists;
        tempArtists[currRange] = artistList
        this.setState({'artists': tempArtists});
        this.setState({'genres': tempGenres});
      }

    }

  }

  trackSwitch(e){
    e.preventDefault();
    //get value of selected element
    let selectedRange = e.currentTarget.getAttribute('value').split('.')[0];
    //revert selected class
    document.getElementsByClassName('timeRangeTrackSelected')[0].setAttribute('class', 'timeRangeTrack');
    //set new highlighted class
    e.target.setAttribute('class', 'timeRangeTrackSelected');

    this.setState({ 'currTrackTimeRange': selectedRange });
  }

  artistSwitch(e){
    e.preventDefault();
    //get value of selected element
    let selectedRange = e.currentTarget.getAttribute('value').split('.')[0];
    //revert selected class
    document.getElementsByClassName('timeRangeArtistSelected')[0].setAttribute('class', 'timeRangeTrack');
    //set new highlighted class
    e.target.setAttribute('class', 'timeRangeArtistSelected');

    this.setState({ 'currArtistTimeRange': selectedRange });
  }

  topBarSwitch(e){
    e.preventDefault();

    //get value of selected element
    let selectedMode = e.currentTarget.getAttribute('value').split('.')[0];
    //revert selected class
    document.getElementsByClassName('topBarSelected')[0].setAttribute('class', 'topBar');
    //set new highlighted class
    e.target.setAttribute('class', 'topBarSelected');


    if (selectedMode === 'tracks'){
      this.setState({
                      'trackSection': {display: 'block'},
                      'artistSection': {display: 'none'},
                      'statSection': {display: 'none'}
                    });
    }else if (selectedMode === 'artists'){
      this.setState({
                      'trackSection': {display: 'none'},
                      'artistSection': {display: 'block'},
                      'statSection': {display: 'none'}
                    });
    }else {
      this.setState({
                      'trackSection': {display: 'none'},
                      'artistSection': {display: 'none'},
                      'statSection': {display: 'block'}
                    });
    }
  }

  async confirmTopPlaylist(e){
    let timeRange = '',
        playlistName = '',
        playlistDescription = '';

    const date = new Date();

    switch (this.state.currTrackTimeRange){
      case 'short_term':
        timeRange = 'past 4 weeks';
        playlistName = 'Your Top Songs 4 Weeks';
        playlistDescription = `Your top songs for the past 4 weeks, generated by SpotStats on ${date}`
        break;
      case 'medium_term':
        timeRange = 'past 6 months';
        playlistName = 'Your Top Songs 6 months';
        playlistDescription = `Your top songs for the past 6 months, generated by SpotStats on ${date}`
        break;
      case 'long_term':
        timeRange = 'all time';
        playlistName = 'Your Top Songs All Time';
        playlistDescription = `Your top songs of all time, generated by SpotStats on ${date}`
        break;
      default:
        timeRange = '';
    }

    if (timeRange === ''){
      return;
    }

    if (window.confirm(`Generate top tracks playlist from ${timeRange}?`)){
        document.getElementById('topTrackPlaylistButton').innerHTML = 'Generating...';
        let uris = this.state.tracks[this.state.currTrackTimeRange].map(t => t.uri);
        await generatePlaylist(this.state.accessToken, this.state.userId, playlistName, playlistDescription, uris);
        document.getElementById('topTrackPlaylistButton').innerHTML = 'Generate Playlist';
    }
  }

  render(){
    const Tracks = ({tracks}) => (
      <>
        {tracks.map((tracks, index) => (
          <div className="trackDiv" key={tracks.id}>
            <p className="numberTrackP">{index + 1}.</p>
            <img className="songImg" alt="" src={tracks.picture} />
            <div className="songInfoDiv">
              <p className="songNameP">{tracks.name}</p>
              <p className="songArtistNameP">{tracks.artists}</p>
            </div>
          </div>
        ))}
      </>
    );

    const Artists = ({artists}) => (
      <>
        {artists.map((artists, index) => (
          <div className="artistDiv" key={artists.id}>
            <p className="numberArtistP">{index + 1}.</p>
            <img className="artistImg" alt="" src={artists.picture} />
            <div className="artistInfoDiv">
              <p className="artistNameP">{artists.name}</p>
            </div>
          </div>
        ))}
      </>
    );

    return (
      <div className='Dashboard'>
        <div className='fade' id='welcome' style={this.state.welcome} >
          <h1>Welcome to SpotStats</h1>
          <a href={getAuthURL()}>
            <div className='spotifyAuth'>Get Spotify Stats</div>
          </a>
          <p id='loading' className='fadeInOut' style={this.state.loading}>Loading...</p>
        </div>
        <div className='fade' id='app'  style={this.state.app}>
          <div className='topBarSection'>
            <div className='topBarTitle'><h3>Spotify Statistics for {this.state.displayName}</h3></div>
            <a href='/#' value='tracks' onClick={this.topBarSwitch.bind(this)}>
                <div className='topBarSelected'>Tracks</div>
            </a>
            <a href='/#' value='artists' onClick={this.topBarSwitch.bind(this)}>
              <div className='topBar'>Artists</div>
            </a>
            <a href='/#' value='stats' onClick={this.topBarSwitch.bind(this)}>
              <div className='topBar'>Stats</div>
            </a>
          </div>
          <div className='trackSection' style={this.state.trackSection}>
            <div className='sectionHeaderDiv'>
              <h2>Top Tracks</h2>
            </div>
            <a href='/#' onClick={this.confirmTopPlaylist.bind(this)}>
              <div id='topTrackPlaylistButton'>Generate Playlist</div>
            </a>
            <div className='timeRangeTrackDiv'>
                <a  href='/#' value="short_term.track" onClick={this.trackSwitch.bind(this)}>
                  <div className='timeRangeTrack'>4 Weeks</div>
                </a>
                <a  href='/#' value="medium_term.track" onClick={this.trackSwitch.bind(this)}>
                  <div className='timeRangeTrackSelected'>6 Months</div>
                </a>
                <a href='/#' value="long_term.track" onClick={this.trackSwitch.bind(this)}>
                  <div className='timeRangeTrack'>All Time</div>
                </a>
            </div>
            <div className='trackContainer'>
              <div>
                <Tracks tracks={this.state.tracks[this.state.currTrackTimeRange]} />
              </div>
            </div>
          </div>

          <div className='artistSection' style={this.state.artistSection}>
            <div className='sectionHeaderDiv'>
              <h2>Top Artists</h2>
            </div>
            <div className='timeRangeArtistDiv'>
                <a  href='/#' value="short_term.artist" onClick={this.artistSwitch.bind(this)}>
                  <div className='timeRangeArtist'>4 Weeks</div>
                </a>
                <a  href='/#' value="medium_term.artist" onClick={this.artistSwitch.bind(this)}>
                  <div className='timeRangeArtistSelected'>6 Months</div>
                </a>
                <a href='/#' value="long_term.artist" onClick={this.artistSwitch.bind(this)}>
                  <div className='timeRangeArtist'>All Time</div>
                </a>
            </div>
            <div className='artistContainer'>
              <div>
                <Artists artists={this.state.artists[this.state.currArtistTimeRange]} />
              </div>
            </div>
          </div>
          <div className='statSection' style={this.state.statSection}>
            <div className='sectionHeaderDiv'>
              <h2>Your Statistics</h2>
            </div>
            <div className='statContainer'>
              <p className='statTitle'>Top Genres</p>
              <canvas id="genreChart"></canvas>
              <div className='chartAnalysis'>
                <p className='analysisMessageChart'>
                  {`You've listened to ${Object.keys(this.state.genres).length} different genres`}
                </p>
              </div>
              <p className='statTitle'>Other Stats</p>
              <div className='statAnalysis'>
                <p className='analysisMessage'>
                  {generateAnalysis(this.state.stats.medium_term.energy, this.state.stats.medium_term.valence)}
                </p>
              </div>
              <div className='statBlock' id="tempoStat">
                <p className='statHeader'>BPM</p>
                {this.state.stats.long_term.tempo}
              </div>
              <div className='statBlock' id="energyStat">
                <p className='statHeader'>Energy</p>
                {this.state.stats.long_term.energy}%
              </div>
              <div className='statBlock' id="valenceStat">
                <p className='statHeader'>Mood</p>
                {this.state.stats.long_term.valence}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

ReactDOM.render(<Dashboard />, rootElement);
