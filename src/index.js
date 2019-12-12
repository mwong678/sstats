import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import {getTopTracks, getTopArtists} from './spotify'
import {joinArtists} from './util'

const querystring = require('querystring'),
      properties = require('./properties.json');

const clientID = properties.clientID,
      clientSecret = properties.clientSecret,
      redirectURI = properties.redirectURILocal,
      scope = 'user-top-read';

const rootElement = document.getElementById('root');
const accessTokenField = 'access_token=',
      tokenTypeField = '&token_type';

class Dashboard extends React.Component {
  constructor(){
    super();
    let currentURI = window.location.href,
        accessToken = '';
    console.log(currentURI);
    if (currentURI.includes(accessTokenField)){
      accessToken = currentURI.substring(currentURI.indexOf(accessTokenField) +
                    accessTokenField.length, currentURI.indexOf(tokenTypeField));
    }
    this.state = {
      'accessToken': accessToken,
      'shortTermTracks': [],
      'mediumTermTracks': [],
      'longTermTracks': []
    };
  }

  componentWillMount(){
    console.log('First this called');
  }

  componentDidMount(){
    if (this.state.accessToken !== ''){
      this.getTracks('short_term');
      this.getTracks('medium_term');
      this.getTracks('long_term');
    }
  }
  generateRandomString = (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
     text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  getAuthURL = () => {
    return 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
     response_type: 'token',
     client_id: clientID,
     scope: scope,
     redirect_uri: redirectURI,
     state: this.generateRandomString(16),
     show_dialog: true
    });
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
      songList.push({name: curr.name, artists: joinArtists(curr.artists), popularity: curr.popularity})
    }

    songList.sort((a, b) => (b.popularity > a.popularity) ? 1 : -1);
    
    if (timeRange === 'short_term'){
      this.setState({ 'shortTermTracks': songList });
    }else if (timeRange === 'medium_term'){
      this.setState({ 'mediumTermTracks': songList });
    }else{
      this.setState({ 'longTermTracks': songList });
    }
  }

  render(){
    if (this.state.accessToken === ''){
      return (
        <div className='Dashboard'>
          <h1>Welcome to SStats</h1>
          <a href={this.getAuthURL()}>Get Spotify Stats</a>
        </div>
      );
    }else{
      const Tracks = ({tracks}) => (
        <>
          {tracks.map(tracks => (
            <div className="track" key={tracks.name}>{tracks.name}, {tracks.artists} -> {tracks.popularity} <br /><br /></div>
          ))}
        </>
      );

      return (
        <div className='Dashboard'>
          <h1>Spotify Statistics</h1>
          <h3>Short Term Tracks (4 weeks)</h3>
          <div>
            <Tracks tracks={this.state.shortTermTracks} />
          </div>
          <h3>Medium Term Tracks (6 months)</h3>
          <div>
            <Tracks tracks={this.state.mediumTermTracks} />
          </div>
          <h3>Long Term Tracks (Couple Years)</h3>
          <div>
            <Tracks tracks={this.state.longTermTracks} />
          </div>
        </div>
      );
    }
  }

}

ReactDOM.render(<Dashboard />, rootElement);
