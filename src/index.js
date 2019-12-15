import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import {getTopTracks, getTopArtists, getUserProfile} from './spotify'
import {joinArtists, getAccessToken, getAuthURL} from './util'

const rootElement = document.getElementById('root');

class Dashboard extends React.Component {
  constructor(){
    super();

    let currentURI = window.location.href,
        accessToken = getAccessToken(currentURI);

    this.state = {
      'accessToken': accessToken,
      'currTopBar': 'tracks',
      'currTrackTimeRange': 'medium_term',
      'currArtistTimeRange': 'medium_term',
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
      'welcome' : {display: 'block'},
      'app' : {display: 'none'},
      'displayName': ''

    };
  }

  componentDidMount(){
    if (this.state.accessToken !== ''){
      this.getTracks('short_term');
      this.getTracks('medium_term');
      this.getTracks('long_term');

      this.getArtists('short_term');
      this.getArtists('medium_term');
      this.getArtists('long_term');

      this.userProfile();

      this.setState({ 'welcome': {display: 'none'}, 'app': {display: 'block'}});
    }else{
      this.setState({ 'welcome': {display: 'block'}, 'app': {display: 'none'}});
    }
  }

  userProfile = async () => {
    const profile = await getUserProfile(this.state.accessToken);
    this.setState({'displayName': profile.display_name});
  }

  getTracks = async (timeRange) => {
    if (timeRange !== 'short_term' && timeRange !== 'medium_term' && timeRange !== 'long_term'){
      console.log('Invalid time range');
      return;
    }

    let songList = [];

    const tracks = await getTopTracks(this.state.accessToken, timeRange);

    for (var i = 0; i < tracks.items.length; i++){
      let curr = tracks.items[i];
      songList.push({
                      name: curr.name,
                      artists: joinArtists(curr.artists),
                      popularity: curr.popularity,
                      id: curr.id,
                      link: curr.external_urls.spotify,
                      picture: (curr.album.images.length > 0) ? curr.album.images[2].url : ''
                    });
    }

   let tempTracks = this.state.tracks;
   tempTracks[timeRange] = songList
   this.setState(tempTracks);
  }

  getArtists = async (timeRange) => {
    if (timeRange !== 'short_term' && timeRange !== 'medium_term' && timeRange !== 'long_term'){
      console.log('Invalid time range');
      return;
    }

    let artistList = [];

    const artists = await getTopArtists(this.state.accessToken, timeRange);

    for (var i = 0; i < artists.items.length; i++){
      let curr = artists.items[i];
      artistList.push({
                      name: curr.name,
                      id: curr.name,
                      popularity: curr.popularity,
                      genres: curr.genres,
                      link: curr.external_urls.spotify,
                      picture: (curr.images.length > 0) ? curr.images[2].url : ''
                    });
    }

   let tempArtists = this.state.artists;
   tempArtists[timeRange] = artistList
   this.setState(tempArtists);
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
      document.getElementsByClassName('trackSection')[0].style.display = 'block';
      document.getElementsByClassName('artistSection')[0].style.display = 'none';
    }else{
      document.getElementsByClassName('artistSection')[0].style.display = 'block';
      document.getElementsByClassName('trackSection')[0].style.display = 'none';
    }

    this.setState({ 'currTopBar': selectedMode });
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
        </div>
        <div className='fade' id='app'  style={this.state.app}>
          <div className='topBarSection'>
            <div className='topBarTitle'><h3>Spotify Statistics for {this.state.displayName}</h3></div>
            <a  href='/#' value='tracks' onClick={this.topBarSwitch.bind(this)}>
                <div className='topBarSelected'>Tracks</div>
            </a>
            <a  href='/#' value='artists' onClick={this.topBarSwitch.bind(this)}>
              <div className='topBar'>Artists</div>
            </a>
          </div>
          <div className='trackSection'>
            <div className='trackHeaderDiv'>
              <h2>Top Tracks</h2>
            </div>
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

          <div className='artistSection'>
            <div className='artistHeaderDiv'>
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
        </div>
      </div>
    );
  }

}

ReactDOM.render(<Dashboard />, rootElement);
