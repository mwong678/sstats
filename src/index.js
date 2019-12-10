import React from "react";
import ReactDOM from "react-dom";
import { Redirect } from 'react-router-dom';
import "./styles.css";

const request = require('request'),
      requestPromise = require('request-promise'),
      querystring = require('querystring'),
      properties = require('./properties.json');

const clientID = properties.clientID,
      clientSecret = properties.clientSecret,
      redirectURI = properties.redirectURILocal,
      scope = "user-top-read";

function Welcome() {
  let auth = false;
  console.log(window.location.href);
  if (!auth){
    return (
      <div className="Welcome">
        <h1>Welcome to SStats</h1>
        <a href={getAuthURL()}>Get Spotify Stats</a>
      </div>
    );
  }else{
    return (
      <div className="Welcome">
        <h1>Spotify Statistics</h1>
      </div>
    );
  }
}

function getAuthURL(){
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


function generateRandomString(length){
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
   text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


const rootElement = document.getElementById("root");
ReactDOM.render(<Welcome />, rootElement);
