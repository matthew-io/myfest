var redirect_uri = "http://127.0.0.1:5500/index.html";
 

var client_id = "04250bc227ae411c9daba9cc95c4d407"; 
var client_secret = "5e7886f1e7084a26aa3e63ea8c0e915e"; 

// In a real world app I know you wouldn't show API keys like this, but just for ease I've left 
// them in here

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
            document.getElementById('similar').style.display = 'none';
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

let count = 0, toSwap, hold;

function swapArtist(el) {
    count++;


    if (count % 2 == 1) {
        el.srcElement.style.color = '#4dff6d'
        hold = el;
        toSwap = el.srcElement.innerHTML;
    } else if (count % 2 == 0) {
        hold.srcElement.style.color = 'white'

        if (hold.srcElement.innerHTML.indexOf('•') >= 0 && el.srcElement.innerHTML.indexOf('•') == -1) {
            el.srcElement.innerHTML = el.srcElement.innerHTML += ' • '
            toSwap = toSwap.split(' • ').join('');
        }

        if (el.srcElement.innerHTML.indexOf('•') >= 0 && hold.srcElement.innerHTML.indexOf('•') == -1) {
            hold.srcElement.innerHTMl = hold.srcElement.innerHTML += ' • '
            el.srcElement.innerHTML = el.srcElement.innerHTML.split(' • ').join('')
            toSwap += ' • '
        }

        hold.srcElement.innerHTML = el.srcElement.innerHTML
        el.srcElement.innerHTML = hold.srcElement.innerHTML;
        el.srcElement.innerHTML = toSwap;
    }

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

function getSimilarArtists(artist) {
    fetch(`https://tastedive.com/api/similar?info=1&q=${artist}&k=445716-MyFest-X8G4LRTR`)
        .then((response) => response.json())
        .then((data) => displaySimilar(data));
}

function displaySimilar(data) {
    if (data.Similar.Results.length == 0) {
    } else {

        let mainContent = document.getElementById('similar');

        for (let i = 0;i<2;i++) {
            let a = document.createElement('a')
            a.href = data.Similar.Results[i].wUrl;
            a.target = '_blank'
            a.style.textDecoration = 'none'

            let artistCard = document.createElement('div'), cardBody = document.createElement('div'), artistName = document.createElement('h4')

            artistName.innerHTML = data.Similar.Results[i].Name;

            artistCard.classList.add('card', 'border-primary','mb-3', 'w-75', 'mx-auto')
            cardBody.classList.add('card-body', 'row')
            artistName.classList.add('card-title', 'text-left', 'col-6', 'my-auto')

            cardBody.appendChild(artistName);
            artistCard.appendChild(cardBody);
            a.appendChild(artistCard);
            mainContent.append(a);
        }
    }
}

function handleApiResponse() {
    if ( this.status == 200 ) {
        var data = JSON.parse(this.responseText);
        console.log(data);
    }
}

function handleArtistsReponse() {
    if ( this.status == 200 ) {
        var data = JSON.parse(this.responseText);
        displayArtists(data);
    }
}

function displayArtists(data) {

    let dayOne = document.getElementById('dayOne'), days = document.getElementsByClassName('day');
     subacts = document.createElement('div');
     topArtists = document.getElementById('topArtists')
     dataArr = [] = data.items, nameArr = [], actsArr = [];

     let chunkSize = 3;


     for (let i = 0; i < 5; i++) {
        getSimilarArtists(data.items[i].name);
    }

    for (let i =3;i<dataArr.length;i+=chunkSize) {
        const chunk = dataArr.slice(i, i + chunkSize);
        nameArr.push(chunk)
    }

    chunkSize = 8;

    for (let i=12;i<dataArr.length;i+=chunkSize) {
        const chunk = dataArr.slice(i,i+chunkSize);
        actsArr.push(chunk)
    }

    for (let i = 0;i < 5; i++) {
        document.getElementById('topArtists');
        let a = document.createElement('a')
        let artistCard = document.createElement('div'), cardBody = document.createElement('div'), artistImg = document.createElement('img'), artistName = document.createElement('h4');
        
        artistImg.src = data.items[i].images[0].url
        artistName.innerHTML = data.items[i].name;
        a.href = data.items[i].external_urls.spotify;
        a.target = '_blank'
        a.style.textDecoration = 'none';

        artistImg.classList.add('col-2', 'my-auto')
        artistCard.classList.add('card', 'border-primary', 'mb-3')
        cardBody.classList.add('card-body', 'row')
        artistName.classList.add('card-title', 'text-left', 'col-6', 'my-auto')

        artistImg.style.height = '50px';
        artistImg.style.width = '75px';

        cardBody.appendChild(artistImg);
        cardBody.appendChild(artistName);
        artistCard.appendChild(cardBody);
        a.append(artistCard);
        topArtists.append(a);
    }

    for (let i =0;i<days.length;i++) {
        let headliner = data.items[i].name;
        const name = document.createElement('h1')
        name.style.cursor = 'pointer';
        name.innerHTML = headliner.toUpperCase();
        name.classList.add('font-weight-bold')
        let subacts = document.createElement('div');
        let acts = document.createElement('div')
        let dot = document.createElement('span')
        dot.innerHTML = ' • '

        name.style.color = 'white'

        name.addEventListener('click', swapArtist)

        for (let j = 0;j<nameArr[i].length;j++) {
            let subact = document.createElement('span')
                subact.style.cursor = 'pointer'
                subact.classList.add('h3')
                if (j != nameArr[i].length -1) {
                subact.innerHTML = nameArr[i][j].name.toUpperCase() + ' • '
            }   else {
                subact.innerHTML = nameArr[i][j].name.toUpperCase();
            }
            subact.style.color = 'white'
            subact.addEventListener('click', swapArtist)
            subacts.append(subact)
        }

        for (let k=0;k<actsArr[i].length;k++) {
            let act = document.createElement('span')
            act.style.cursor = 'pointer';

        
            if (k != actsArr[i].length -1) {
                act.innerHTML = actsArr[i][k].name.toUpperCase() + ' • '
            }   else {
                act.innerHTML = actsArr[i][k].name.toUpperCase();
            }
            act.addEventListener('click', swapArtist)
            acts.append(act);
        }

        days[i].append(name)
        days[i].append(subacts)
        days[i].append(acts);
    }
}

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}
