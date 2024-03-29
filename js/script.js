import * as THREE from './three/build/three.js';
// var THREE = require('/node_modules/three/build/three');
import {Patients} from './Patient.js';
// import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { OrbitControls } from './three/examples/js/controls/OrbitControls.js';
// import { EffectComposer } from 'https://threejs.org/examples/jsm/postprocessing/EffectComposer.js';
import { EffectComposer } from './three/examples/js/postprocessing/EffectComposer.js';
// import { RenderPass } from 'https://threejs.org/examples/jsm/postprocessing/RenderPass.js';
import { RenderPass } from './three/examples/js/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'https://threejs.org/examples/jsm/postprocessing/UnrealBloomPass.js';
import { UnrealBloomPass } from './three/examples/js/postprocessing/UnrealBloomPass.js';
// import { BokehPass } from 'https://threejs.org/examples/jsm/postprocessing/BokehPass.js';
import { BokehPass } from './three/examples/js/postprocessing/BokehPass.js';

var camera, renderer, prevMouse;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(-10, -10);
var scene = new THREE.Scene();
var nodeGraph = new THREE.Object3D();
var allPatients = new Patients(nodeGraph);
var currentDateId=1;
const clusNames = {
    '6BR': '6 Battery Road','8KD': '85 Kallang Dorm','ABC': 'ABC Hostel',
    'AL': 'Acacia Lodge','BG': 'boulder+ Gym','BT': 'The Black Tap',
    'CHN': 'Initial imported China cluster','CLI': 'Cochrane Lodge 1','CLII': 'Cochrane Lodge 2',
    'CLV': 'Ce La Vi','COS': 'Church of Singapore','CP': 'Cassia@Penjuru',
    'CW': 'CitiWall', 'DCIS': 'Dover Court International School', 'GAOG': 'Grace Assembly of God church',
    'GH': 'Grand Hyatt','HER': 'Hero’s','I': 'Imported',
    'ICA': 'ICA building','KD': 'Kranji Dorm', 'KL': 'Kranji Lodge','KS': 'Keppel Shipyard',
    'KUBS': 'Keppel/UBS','L': 'Linked','LAMH': 'Lee Ah Mooi Home',
    'LCM': 'Life Church and Missions','LGP': 'Little Gems Preschool','MAM': 'Masjid Al',
    'MCD': 'McDonalds','MHD': 'Mei Hwan Drive', 'MMRT': 'Maxwell MRT Construction Site',
    'MUSC': 'Mustafa Center', 'NCL': 'North Coast Lodge','NUH': 'NUH Construction',
    'PCF': 'PCF Fengshan','PG': 'Project Glory', 'RG': 'Religious gathering in Malaysia',
    'SAFRA': 'SAFRA Jurong','SAH': 'Seletar Aerospace Heights','SCC': 'Singapore Cricket Club',
    'SDP': 'S11 Dormitory','SENL': 'Senoko Loop Dorm','SHAW': 'Shaw Lodge',
    'SKA': 'Sungei Kadut Ave','SKD': 'Sungei Kadut Dorm','SKL': 'Sungei Kadut Dorm',
    'SPC': 'Singpost Center','STL': 'Sungei Tengah Lodge','TD': 'Tampines Dorm',
    'TGD': 'Toh Guan Dorm','TOB': 'The Orange Ballroom','TPC': 'Tech Park Crescent Dorm',
    'TVD': 'Tuas View Dorm','TWB': 'The Wedding Brocade','U': 'Unlinked',
    'WIP': '36 Woodlands Industrial Park','WR': 'Wilby Residences','WT': 'Wizlearn Technologies',
    'WTG': 'Westlite Toh Guan Dormitory','WW': 'Westlite Woodlands','YTH': 'Yong Thai Hang',
    'PPTA': 'PPT Lodge 1A', 'SENW': '13 Senoko Way', 'KTC': '10 Kian Teck Crescent', 'KTD': 'Kian Teck Dorm',
    '234BR': '234 Balestier Road', 'MLI': 'Mandai Lodge I', 'LEO': 'Leo Dorm',
    'SJD': 'SJ Dorm', 'WM':'Westlite Mandai', 'SKS': '17 Sungei Kadut Street 4',
    'GWB': 'Grandwork Building', 'TSD': 'Tuas South Dorm', 'ALD': 'Avery Lodge Dorm',
    'JPD': 'Jurong Penjuru Dorm', '4SKS': '4 Sungei Kadut Street 2', 'HL': 'Homestay Lodge',
    'CTD': 'CDPL Tuas Dorm', 'TTJ':'TTJ Design & Engineering'
};

const clusColorsS = {
    '234BR': 'fe5609','4SKS': 'fee010','6BR': 'ff9510','8KD': 'ffee00',
    'ABC': 'ffe500','AL': 'ee9947','ALD': 'fee010','BG': '3acfef','BT': '22eeee',
    'CHN': '33d0c0','CLI': 'ffc033','CLII': '95ff33','CLV': '99edbb',
    'COS': '5dff2f','CP': 'f0ef45','CW': '10ff35','DCIS': 'ffc0cb',
    'GAOG': '8cef36','GH': '60eede','GWB': 'fee010','HER': '7fffd4',
    'I': '30c0e0','ICA': 'ff69b4','JPD': 'fee010','KD': 'fe5604',
    'KL': 'ffa946','KS': 'ee3355','KTC': 'ffff00','KTD': 'ef9200',
    'KUBS': 'ee3533','L': '30a043','LAMH': '34dfa9','LCM': 'eeff55',
    'LEO': 'fee010','LGP': '999900','MAM': '90cd00','MCD': '7fffd4',
    'MHD': '990099','MLI': 'e0f0a0','MMRT': 'f4a460','MUSC': '1199ff',
    'NCL': '30ffaf','NUH': 'd2691e','PCF': 'ffb6c1','PG': '20fff0',
    'PPTA': 'ffdab9','RG': '6aff00','SAFRA': '31aa20','SAH': 'ee82ee',
    'SCC': '10ffbf','SDP': 'ff776a','SENL': 'ff3500','SENW': 'f0e68c',
    'SHAW': 'fee010','SJD': 'eff3a0','SKA': 'ff540f','SKD': 'fa9500',
    'SKL': 'fffacd','SKS': 'eff3a0','SPC': 'ba77d8','STL': 'eff3a0',
    'TD': 'cef053','TGD': 'ffd232','TOB': '46dbff','TPC': 'ee3522',
    'TSD': 'fee010','TVD': 'ff8c00','TWB': 'df60ff','U': 'be2222',
    'WIP': 'ff7f50','WM': 'ffff00','WR': 'f0368c','WT': 'fcb0f3',
    'WTG': 'eba210','WW': 'ffa500','YTH': 'ff8c66'};

const ageColors = {'y':'hsl(306,100%,40%)', 'o': 'hsl(126,100%,95%)', 'm':'hsl(236,100%,60%)' };
const natColors = {'Citizen': 'ffffff', 'PR':'6699ff', 'Long term pass': '00ff55', 'Work pass':'01ff33', 'Other':'aa3030'};
const dischColors = {'Discharged':'55ff55', 'Hospitalized': '9055ff', 'Demised':'ee2020'};
const genderColors = {'Male':'6666ff', 'Female': 'ff5555', 'Pending': '666666'};

var composer; 
var params = {
    exposure: 0,
    bloomStrength: 0.5,
    bloomThreshold: 0.2,
    bloomRadius: 1
};

var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;
raycaster.far = 10;
raycaster.near = 0.1;

$(document).ready(() => {
    init();}
);

function init(){
    //grab data for all cases, dates
    $.getJSON('data/covidData_apr17.json', function(json){
        allPatients.data = json;
        allPatients.currentParColor = 'cluster';
        allPatients.getClusterProportions(); 
        for (let dateid of Object.keys(allPatients.data)) {
            for (let pats of Object.keys(allPatients.data[dateid]['cases'])) {
                allPatients.addPatient(dateid, pats, allPatients.data[dateid]['cases'][pats]);
            }
        }
        toNext();
    });
    
    // set up graph canvas
    const gw = $('#graph').width();
    const gh = $('#graph').height();

    window.addEventListener( 'resize', onWindowResize, false );
    $('#graph').mousemove(onDocumentMouseMove);
    camera = new THREE.PerspectiveCamera(60, gw / gh, 0.1, 1000);
    camera.position.set(0, 0, 15); 

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(gw, gh);
    
    var renderScene = new RenderPass( scene, camera );
    var bokehPass = new BokehPass( scene, camera, {
        focus: 1.0,
        aperture:	10.5,
        maxblur:	3.0,
    
        width: gw,
        height: gh
    } );
    composer = new EffectComposer( renderer );
    composer.addPass( renderScene );
    composer.addPass( bokehPass );
    composer.addPass( bloomPass );

    let controls = new OrbitControls(camera, renderer.domElement);
    
    controls.update();
    scene.add(nodeGraph);

    $('#graph').append(renderer.domElement);

    // set up HTML, key, buttons, UI elements etc.
    let keyHtml = '';
    for (let color of Object.keys(clusColorsS)) {
        keyHtml += `<div style="width:30%;font-size:12px;display:flex;align-items:center;">
        <svg width="20" height="20"><rect width="15" height="15" style="fill:#${clusColorsS[color]};" /></svg>  ${clusNames[color]}</div>`
    }
    $('#keyColors').html(keyHtml);
    highlight('#clus');
    $('#next').click(toNext);
    $('#prev').click(toPrev);
    $(document).keydown(function(e) {
        let keycode = e.which;
        if (keycode == 39) {
            e.preventDefault();
            toNext();
            return
        }
        if  (keycode ==  37) {
            e.preventDefault();
            toPrev();
            return       
        }
    });

    $('#gend').click(() => {switchColor('gender'); highlight('#gend');});
    $('#clus').click(()=>{switchColor('cluster'); highlight('#clus');});
    $('#age').click(()=>{switchColor('age'); highlight('#age')});
    $('#hospStat').click(() => {switchColor('disch'); highlight('#hospStat')});
    $('#nat').click(() => {switchColor('nat'); highlight('#nat')});

    $('#ok').click(()=>{$('#overlay').css('display', 'none')});
    animate();

    function animate() {
        nodeGraph.rotation.y += 0.0001;
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( nodeGraph.children );
        for ( let i = 0; i < intersects.length; i++ ) {
            for (let j = 0; j <  allPatients.allPatients.length; j++) {
                if (intersects[i].object.uuid == allPatients.allPatients[j].geom.uuid) {
                    let currMouse = allPatients.allPatients[j];
                    if (currMouse != prevMouse) {
                        currMouse.colorSet('highlight', currentDateId);
                        updatePatientData(currMouse);
                        (prevMouse) ? prevMouse.colorSet(allPatients.currentParColor, currentDateId): null;
                        prevMouse = currMouse;
                    } 
                }                
            }
         }

        controls.update();
        requestAnimationFrame(animate);
        composer.render();
    };
}

function onWindowResize(){

    const gw = $('#graph').width();
    const gh = $('#graph').height();

    camera.aspect = gw / gh;
    camera.updateProjectionMatrix();
    composer.setSize( gw, gh );
    renderer.setSize( gw, gh );
}

function createDailyData(obj) {
    const months = {'01':'January', '02': 'February','03': 'March', '04': 'April', '05': 'May'};
    let currDateData = [];
    currDateData.push('<div id="number">Total Cases<br>' + '<div id="stat">' + obj['totalCases'] + '</div>');
    currDateData.push('<div id="number"">New Cases<br>' + '<div id="stat">' +obj['newCases']+ '</div>');
    currDateData.push('<div id="number">Discharged<br>' + '<div id="stat">' + obj['totalRecovered']+ '</div>');
    currDateData.push('<div id="number">ICU<br>' + '<div id="stat">' + obj['icu']+ '</div>');
    currDateData.push('<div id="number">Hospitalized<br>' + '<div id="stat">' + obj['inHospital']+ '</div>');   
    let date = obj['date'].split('/');
    let currMonth = months[date[1]];
    $('#dateData').html(`<h1>${date[0]} ${currMonth} 2020</h1> <div id="numbers"> ${currDateData.join("</div>")}</div>`);

    $('#news').html(`From the news<a href="${obj['news']['link']}" target="_blank"><h2>${obj['news']['headline']}</h2></a>
    <p>${obj['news']['para']}</p>`); 

    let dict = obj['social media'];
    let platform = dict['platform'];
    let username = dict['username'];
    let comment = dict['comment'];
    let link = dict['link'];

    $('#sm').html(`From <a href="${link}" target="_blank">${platform}</a><br><h3>${username}</h3><br>${comment}`);
  
}

function toNext() {    
    if (currentDateId == Object.keys(allPatients.data).length + 1) {
        return
    }
    $('#news').empty();
    $('#sm').empty();
    $('#dateData').empty();
    createDailyData(allPatients.data[currentDateId]);  
    allPatients.display(currentDateId);
    allPatients.setColor(currentDateId);
    currentDateId += 1;
}

function toPrev() {
    if (currentDateId==2) {
        return
    }
    currentDateId-= 2;
    toNext();
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    let w = window.innerWidth;
    let h = window.innerHeight;
    mouse.x = ((event.clientX - 0.18*w) / (0.64*w)) * 2 - 1;
    mouse.y = -(event.clientY / (0.7*h)) * 2 + 1;
}

function updatePatientData(ptnt) {
    let ptntData = [];
    let ptntHTML = '';
    let clusters = '';
    for (let clus of ptnt.clus.split(', ')) {
        clusters += clusNames[clus] + ', ';
    }
    clusters = clusters.slice(0, -2);
    ptntData.push(`Case Number <br> <div id="patStat"> ${ptnt.caseNumber}</div>`);
    ptntData.push(`Age<br> <div id="patStat">${ptnt.age}</div>`);
    ptntData.push(`Gender<br> <div id="patStat">${ptnt.gender}</div>`);
    ptntData.push(`Cluster<br> <div id="patStat">${clusters}</div>`);
    ptntData.push(`Hospital<br><div id="patStat"> ${ptnt.hosp}</div>`);
    ptntData.push(`Nationality<br><div id="patStat"> ${ptnt.nat}</div>`);
    ptntData.push(`Travel History<br> <div id="patStat">${ptnt.th}</div>`);
    ptntData.push(`Links<br><div id="patStat"> ${ptnt.links}</div>`);
    for (let p of ptntData) {
        ptntHTML += '<div id="ptntInfo">'+ p+'</div> '
    }
    $('#ptntData').html(ptntHTML);
}

function switchColor(par) {
    let keyHtml = '';
    let cKey;
    let fontSize = '14px';
    let wdth = '47%';
    allPatients.currentParColor = par;
    allPatients.setColor(currentDateId);
    $('#keyColors').empty();
    if (par == 'cluster') {
        wdth = '30%';
        allPatients.showLinks(currentDateId);
        cKey = clusColorsS;
    } else {
        allPatients.hideLinks(currentDateId);
    }

    if (par == 'age') {
        cKey = ageColors;
        keyHtml = `<div style="width:50%;font-size:14px;display:flex;flex-flow: column || wrap;">
        <svg width="30" height="200">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${cKey['y']};stop-opacity:1" />
                <stop offset="40%" style="stop-color:${cKey['m']};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${cKey['o']};stop-opacity:1" />
            </linearGradient>
      </defs><rect width="25" height="200" style="fill:url(#grad1);" /></svg>
      <div style="display:flex; flex-wrap: wrap; flex-direction: column; justify-content: space-between;">
        <div style="padding:5px;">0 years old</div>
        <div style="padding:5px;">102 years old</div>
      </div>`
        $('#keyColors').html(keyHtml);
        return;
    } else if (par == 'gender') {
        cKey = genderColors;
        wdth = '90%';
    } else if (par == 'nat') {
        cKey = natColors;
    } else if (par == 'disch') {
        cKey = dischColors;
    }

    for (let color of Object.keys(cKey)) {
        let parLabel;
        if (par == 'cluster') {
           parLabel = clusNames[color];
           fontSize = '12px'; 
        } else {
            parLabel = color;
        }
        keyHtml += `<div style="width:${wdth};font-size:${fontSize};display:flex;align-items:center;">
        <svg width="20" height="20"><rect width="15" height="15" style="fill:#${cKey[color]}; margin: 1px;" /></svg> ${parLabel}</div>`
    }
    $('#keyColors').html(keyHtml);
}

function highlight(button_id) {
    let buttonArr = ['#gend', '#age', '#clus', '#hospStat', '#nat']	
    for (let b of buttonArr) {
        if (b === button_id) {
            $(b).css('background', '#ffffff');
            $(b).css('color', '#000000');
        } else {
            $(b).css('background', '#000000');
            $(b).css('color', '#ffffff');    
        }
    }
}

