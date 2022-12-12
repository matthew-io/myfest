// var redirect_uri = "https://makeratplay.github.io/SpotifyWebAPI/"; // change this your value
var redirect_uri = "http://127.0.0.1:5500/index.html";
 

var client_id = "04250bc227ae411c9daba9cc95c4d407"; 
var client_secret = "5e7886f1e7084a26aa3e63ea8c0e915e"; // In a real app you should not expose your client_secret to the user

var access_token = null;
var refresh_token = null;
var currentPlaylist = "";
var radioButtons = [];

const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";


function logout() {
    localStorage.removeItem('access_token')
    location.reload();
}

function onPageLoad(){
    client_id = client_id
    client_secret = client_secret;
    if ( window.location.search.length > 0 ){
        handleRedirect();
    }
    else{
        access_token = localStorage.getItem("access_token");
        if ( access_token == null ){
            document.getElementById('festContainer').style.display = 'none';
            document.getElementById('logout').style.display = 'none';
            document.getElementById('para').style.display = 'none'
        }
        else {
            getTopArtists();
            document.getElementById('container').style.display = 'none'
            document.getElementById('login').style.display = 'none';
            document.getElementById('festContainer').style.display = 'block';
            // document.getElementById('logout').style.display = 'block';
        }
    }
}

function handleRedirect(){
    let code = getCode();
    fetchAccessToken( code );
    window.history.pushState("", "", redirect_uri); // remove param from url
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function requestAuthorization(){
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private user-top-read";
    window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function refreshDevices(){
    callApi( "GET", DEVICES, null, handleDevicesResponse );
}

function getTopArtists() {
    callApi("GET", 'https://api.spotify.com/v1/me/top/artists?limit=35', null, handleArtistsReponse);    
}

function handleArtistsReponse() {
    if ( this.status == 200 ) {
        var data = JSON.parse(this.responseText);
        displayArtists(data);
    }
}

function displayArtists(data) {
    let dayOne = document.getElementById('dayOne'), days = document.getElementsByClassName('day');
    let subacts = document.createElement('div');
    let topArtists = document.getElementById('topArtists')
    let dataArr = [] = data.items, nameArr = [], actsArr = [];

    console.log(data.items)

    // for (let i = 0;i<5;i++) {
    //     let name = document.createElement('h1')
    //     name.innerHTML = data.items[i].name
    //     topArtists.append(name);
    // }

    let chunkSize = 3;

    for (let i =3;i<dataArr.length;i+=chunkSize) {
        const chunk = dataArr.slice(i, i + chunkSize);
        nameArr.push(chunk)
    }

    chunkSize = 8;

    for (let i=12;i<dataArr.length;i+=chunkSize) {
        const chunk = dataArr.slice(i,i+chunkSize);
        actsArr.push(chunk)
    }

    for (let i =0;i<days.length;i++) {
        let headliner = data.items[i].name;
        const name = document.createElement('h1')
        name.innerHTML = headliner;
        name.classList.add('text-white')
        name.classList.add('font-weight-bold')
        let subacts = document.createElement('div');
        let acts = document.createElement('div')
        let dot = document.createElement('span')
        dot.innerHTML = ' • '

        for (let j = 0;j<nameArr[i].length;j++) {
            let subact = document.createElement('span')
                subact.classList.add('text-white')
                subact.classList.add('h3')
                if (j != nameArr[i].length -1) {
                subact.innerHTML = nameArr[i][j].name.toUpperCase() + ' • '
            }   else {
                subact.innerHTML = nameArr[i][j].name.toUpperCase();
            }
            subacts.append(subact)
        }

        for (let k=0;k<actsArr[i].length;k++) {
            let act = document.createElement('span')

        
            if (k != actsArr[i].length -1) {
                act.innerHTML = actsArr[i][k].name.toUpperCase() + ' • '
            }   else {
                act.innerHTML = actsArr[i][k].name.toUpperCase();
            }
            acts.append(act);
        }

        days[i].append(name)
        days[i].append(subacts)
        days[i].append(acts);
    }
}

function handleDevicesResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "devices" );
        data.devices.forEach(item => addDevice(item));
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addDevice(item){
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name;
    document.getElementById("devices").appendChild(node); 
}

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function refreshPlaylists(){
    callApi( "GET", PLAYLISTS, null, handlePlaylistsResponse );
}

function handlePlaylistsResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "playlists" );
        data.items.forEach(item => addPlaylist(item));
        document.getElementById('playlists').value=currentPlaylist;
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addPlaylist(item){
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name + " (" + item.tracks.total + ")";
    document.getElementById("playlists").appendChild(node); 
}

function removeAllItems( elementId ){
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function play(){
    let playlist_id = document.getElementById("playlists").value;
    let trackindex = document.getElementById("tracks").value;
    let album = document.getElementById("album").value;
    let body = {};
    if ( album.length > 0 ){
        body.context_uri = album;
    }
    else{
        body.context_uri = "spotify:playlist:" + playlist_id;
    }
    body.offset = {};
    body.offset.position = trackindex.length > 0 ? Number(trackindex) : 0;
    body.offset.position_ms = 0;
    callApi( "PUT", PLAY + "?device_id=" + deviceId(), JSON.stringify(body), handleApiResponse );
}

function shuffle(){
    callApi( "PUT", SHUFFLE + "?state=true&device_id=" + deviceId(), null, handleApiResponse );
    play(); 
}

function pause(){
    callApi( "PUT", PAUSE + "?device_id=" + deviceId(), null, handleApiResponse );
}

function next(){
    callApi( "POST", NEXT + "?device_id=" + deviceId(), null, handleApiResponse );
}

function previous(){
    callApi( "POST", PREVIOUS + "?device_id=" + deviceId(), null, handleApiResponse );
}

function transfer(){
    let body = {};
    body.device_ids = [];
    body.device_ids.push(deviceId())
    callApi( "PUT", PLAYER, JSON.stringify(body), handleApiResponse );
}

function handleApiResponse(){
    if ( this.status == 200){
        console.log(this.responseText);
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 204 ){
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    
}

function deviceId(){
    return document.getElementById("devices").value;
}

function fetchTracks(){
    let playlist_id = document.getElementById("playlists").value;
    if ( playlist_id.length > 0 ){
        url = TRACKS.replace("{{PlaylistId}}", playlist_id);
        callApi( "GET", url, null, handleTracksResponse );
    }
}

function handleTracksResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "tracks" );
        data.items.forEach( (item, index) => addTrack(item, index));
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addTrack(item, index){
    let node = document.createElement("option");
    node.value = index;
    node.innerHTML = item.track.name + " (" + item.track.artists[0].name + ")";
    document.getElementById("tracks").appendChild(node); 
}

function currentlyPlaying(){
    callApi( "GET", PLAYER + "?market=US", null, handleCurrentlyPlayingResponse );
}

function handleCurrentlyPlayingResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        if ( data.item != null ){
            document.getElementById("albumImage").src = data.item.album.images[0].url;
            document.getElementById("trackTitle").innerHTML = data.item.name;
            document.getElementById("trackArtist").innerHTML = data.item.artists[0].name;
        }


        if ( data.device != null ){
            // select device
            currentDevice = data.device.id;
            document.getElementById('devices').value=currentDevice;
        }

        if ( data.context != null ){
            // select playlist
            currentPlaylist = data.context.uri;
            currentPlaylist = currentPlaylist.substring( currentPlaylist.lastIndexOf(":") + 1,  currentPlaylist.length );
            document.getElementById('playlists').value=currentPlaylist;
        }
    }
    else if ( this.status == 204 ){

    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function saveNewRadioButton(){
    let item = {};
    item.deviceId = deviceId();
    item.playlistId = document.getElementById("playlists").value;
    radioButtons.push(item);
    localStorage.setItem("radio_button", JSON.stringify(radioButtons));
    refreshRadioButtons();
}

function refreshRadioButtons(){
    let data = localStorage.getItem("radio_button");
    if ( data != null){
        radioButtons = JSON.parse(data);
        if ( Array.isArray(radioButtons) ){
            removeAllItems("radioButtons");
            radioButtons.forEach( (item, index) => addRadioButton(item, index));
        }
    }
}

function onRadioButton( deviceId, playlistId ){
    let body = {};
    body.context_uri = "spotify:playlist:" + playlistId;
    body.offset = {};
    body.offset.position = 0;
    body.offset.position_ms = 0;
    callApi( "PUT", PLAY + "?device_id=" + deviceId, JSON.stringify(body), handleApiResponse );
    //callApi( "PUT", SHUFFLE + "?state=true&device_id=" + deviceId, null, handleApiResponse );
}

function addRadioButton(item, index){
    let node = document.createElement("button");
    node.className = "btn btn-primary m-2";
    node.innerText = index;
    node.onclick = function() { onRadioButton( item.deviceId, item.playlistId ) };
    document.getElementById("radioButtons").appendChild(node);
}
