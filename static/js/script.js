// import * as THREE from '/node_modules/three/build/three.js';
// var THREE = require('/node_modules/three/build/three');
import {Patients} from './Patient.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://threejs.org/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://threejs.org/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://threejs.org/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'https://threejs.org/examples/jsm/postprocessing/BokehPass.js';

var camera, renderer, prevMouse;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(-10, -10);
var scene = new THREE.Scene();
var nodeGraph = new THREE.Object3D();
var allPatients = new Patients(nodeGraph);
var currentDateId=1;

const clusColorsS = { 
    'CHN': '999900', 'MHD': '990099', 'I': '1ce6ff',
    'U': 'ff34ff','L': 'ff4a46', 'YTH': 'ff8c66',
    'LCM': 'ffff66','GAOG': '8cff66','GH': '66ffd9',
    'SAH': '8cff66','SAFRA': '6699ff','BG': '8c66ff',
    'COS': 'ff66ff', 'MAM': 'ff668c','RG': 'bfff00',
    'PCF': 'f0110f','DCIS': '0080ff','SPC': '4000ff',
    'TWB': 'bf00ff','WR': 'ff00ff','SDP': 'cccc00',
    'WTG':'00cc66', 'SKL': '0099cc', 'LAMH':'cc00cc',
    'MUSC':'5500ff','MMRT':'aaccff','KS': 'ee3355',
    'WT': '0cbdf0','CLI':'0cbd66','CLII': '95ff33',
    'STL':'0f33ff','TGD':'4000ff', 'PG':'20fff0',
    'TD':'cc66ef', 'CLV':'ff66ff','HER':'0080ff',
    'SCC':'00ffbf','TOB':'999900','SKD':'99FF00',
    'STG':'999900', 'KL':'990000', 'SHAW':'0103cc',
    '6BR': 'ff0000','ICA': 'ff44cc','NUH' : '0035ff',
    'CP':'f0ff45','SKA':'0ffa3f','NCL': '30ffaf',
    };

const ageColors = {'y':'hsl(306,100%,40%)', 'o': 'hsl(126,100%,90%)', 'm':'hsl(236,100%,60%)' };
const natColors = {'Citizen': 'ffffff', 'PR':'6699ff', 'Long term pass': '00ff55', 'Work pass':'01ff33', 'Other':'aa3030'};
const dischColors = {'Discharged':'55ff55', 'Hospitalized': '9055ff', 'Demised':'ee2020'};
const genderColors = {'Male':'6666ff', 'Female': 'ff5555'};

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
    $.getJSON('static/data/covidData_apr11.json', function(json){
        allPatients.data = json;
        allPatients.currentParColor = 'cluster';
        allPatients.getClusterProportions(); 
        console.log(allPatients.clusterCounts, allPatients.totalCaseCount);
        for (let dateid of Object.keys(allPatients.data)) {
            for (let pats of Object.keys(allPatients.data[dateid]['cases'])) {
                allPatients.addPatient(dateid, pats, allPatients.data[dateid]['cases'][pats]);
            }
        }
        toNext();
    });
    
    const gw = $('#graph').width();
    const gh = $('#graph').height();

    window.addEventListener( 'resize', onWindowResize, false );
    $('#graph').mousemove(onDocumentMouseMove);
    camera = new THREE.PerspectiveCamera(60, gw / gh, 0.1, 1000);
    camera.position.set(0, 0, 20); 

    let keyHtml = '';
    for (let color of Object.keys(clusColorsS)) {
        console.log(clusColorsS[color]);
        keyHtml += `<div style="width:30%;font-size:14px;display:flex;align-items:center;">
        <svg width="20" height="20"><rect width="15" height="15" style="fill:#${clusColorsS[color]};" /></svg>  ${color}</div>`
    }

    $('#keyColors').html(keyHtml);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(gw, gh);
    $('#next').click(toNext);
    $('#prev').click(toPrev);

    $('#gend').click(() => switchColor('gender'));
    $('#clus').click(() => switchColor('cluster'));
    $('#age').click(() => switchColor('age'));
    $('#hospStat').click(() => switchColor('disch'));
    $('#nat').click(() => switchColor('nat'));
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
    // $(renderer.domElement).insertBefore('#dataViz');

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
        // renderer.render(scene, camera);
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

    $('#news').html(`From the news<a href="${obj['news']['link']}"><h2>${obj['news']['headline']}</h2></a>
    <p>${obj['news']['para']}</p>`); 

    let dict = obj['social media'];
    let platform = dict['platform'];
    let username = dict['username'];
    let comment = dict['comment'];
    let link = dict['link'];

    $('#sm').html(`From <a href = "${link}">${platform}</a><br><h3>${username}</h3><br>${comment}`);
  
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
    ptntData.push(`Case Number <br> <div id="patStat"> ${ptnt.caseNumber}</div>`);
    ptntData.push(`Age<br> <div id="patStat">${ptnt.age}</div>`);
    ptntData.push(`Gender<br> <div id="patStat">${ptnt.gender}</div>`);
    ptntData.push(`Cluster<br> <div id="patStat">${ptnt.clus}</div>`);
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
        <div style="padding:5px;">young</div>
        <div style="padding:5px;">old</div>
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
        console.log(cKey[color]);
        keyHtml += `<div style="width:${wdth};font-size:14px;display:flex;align-items:center;">
        <svg width="20" height="20"><rect width="15" height="15" style="fill:#${cKey[color]};" /></svg>   ${color}</div>`
    }
    $('#keyColors').html(keyHtml);
}
