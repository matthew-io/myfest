var redirect_uri = "http://127.0.0.1:5500/index.html";
 

var client_id = "04250bc227ae411c9daba9cc95c4d407"; 
var client_secret = "5e7886f1e7084a26aa3e63ea8c0e915e"; 

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
        }
    }
}

function handleRedirect(){
    let code = getCode();
    fetchAccessToken( code );
    window.history.pushState("", "", redirect_uri);
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
    localStorage.setItem("client_secret", client_secret);
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private user-top-read";
    window.location.href = url;
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