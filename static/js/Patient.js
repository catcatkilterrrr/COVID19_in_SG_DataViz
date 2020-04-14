// different mesh colors for different clusters
const clusColors = { 
    'CHN': 0x999900,'MHD': 0x990099, 'I': 0x1ce6ff,'U': 0xff34ff,
    'L': 0xff4a46,'YTH': 0xff8c66,'LCM': 0xffff66, 'GAOG': 0x8cff66,
    'GH': 0x66ffd9,'SAH': 0x8cff66,'SAFRA': 0x6699ff,'BG': 0x8c66ff,
    'COS': 0xff66ff,'MAM': 0xff668c,'RG': 0xbfff00,'PCF': 0xf0110f,
    'DCIS': 0x0080ff,'SPC': 0x4000ff, 'TWB': 0xbf00ff,'WR': 0xff00ff,
    'SDP': 0xcccc00,'WTG':0x00cc66,'SKL': 0x0099cc,'LAMH':0xcc00cc,
    'MUSC':0x5500ff,'MMRT':0xaacaff,'KS': 0xee3355,'WT': 0x0cbdf0,
    'CLI':0x0cbd66,'CLII':0x95ff33,'STL':0x0f33ff,'TGD':0x4000ff,
    'PG':0x20fff0,'TD':0xcc66ef,'CLV':0xff66ff,'HER':0x0080ff,
    'SCC':0x00ffbf,'TOB':0x999900,'SKD':0x99FF00,'STG':0x999900,
    'KL':0x990000,'SHAW':0x0103cc,'6BR': 0xff0000,'ICA': 0xff44cc,
    'NUH' : 0x0035ff,'CP':0xf0ff45,'SKA':0x0ffa3f,'NCL': 0x30ffaf,
    'SEN':0xff3500, 'MCD':0xcc3500, 'WW':0x0035ff, 'WIP':0x343590,
    'TVD':0xcc35ff , 'TPC':0xcc35ff, '8KD':0x0035ff, 'ABC':0x0035ff,
    'AL':0xccff35, 'BT':0xff35ff, 'CW':0x00ff35, 'KUBS':0xee3533
    };

const genColors = {'M': 0x6666ff,
                    'F': 0xff5555,
                'Pending': 0x666666};

let clusterKeys = Object.keys(clusColors);
console.log(clusterKeys.length);
var angles = {};
var i = 0;
for (var phi = 0; phi < 2*Math.PI ; phi += 2*Math.PI/20) {
    for (var theta = 0; theta < Math.PI; theta += 2*Math.PI/20) {
        angles[i] = {};
        angles[i]['t'] = theta;
        angles[i]['p'] = phi;
        i++;
    }
}


class Patient {
    constructor(currentDateId, cn, data, clusIds, clusSort){
        this.caseNumber = cn;
        this.age = data.Age;
        this.gender = data.Gender;
        this.nat = data.Nationality;
        this.hosp = data.Hospital;
        this.links= data.Links;
        this.clus = data.Cluster;
        this.dis=data.Discharged;
        this.demised = data.Death;
        this.dDateId;
        this.dischState = 'h';
        this.th = data.TravelHistory;
        for (let key of Object.keys(clusIds)) {
            if (clusIds[key] === data.Cluster.split(',')[0]) {
                this.phi = angles[key]['p'];
                this.theta = angles[key]['t'];
            }
        }
        for (let i = 0; i<clusSort.length; i++) {
            if (clusSort[i][0] == data.Cluster.split(',')[0]){
                this.proportion = clusSort[i][1];
                break;
            }
        }
        if (data.Cluster == 'U') {
            this.x=Math.random()-0.5;
            this.y=Math.random()-0.5;
            this.z = Math.random()-0.5;
        } else {
            if (currentDateId < 20 && this.proportion < 0.1) {
                this.proportion *= 200;
             }
            else {
                if (this.proportion < 0.1) {
                    this.proportion /= 8;
                } else {
                    this.proportion /= 13;
                }
                this.proportion *= currentDateId;
            }
            this.x =  Math.sin(this.phi+ Math.random()*this.proportion)*Math.cos(this.theta + Math.random()*this.proportion);
            this.y = Math.sin(this.phi+Math.random()*this.proportion)*Math.sin(this.theta + Math.random()*this.proportion);
            this.z = Math.cos(this.phi+Math.random()*this.proportion); 
        }
        this.translate = new THREE.Vector3(this.x, this.y, this.z).setLength((currentDateId-1)*0.4);
        this.geom, this.material; 
        this.linklines = [];
    }

    create() { 
        let geometry = new THREE.SphereBufferGeometry(0.1,6,6);
        geometry.translate(this.translate.x, this.translate.y, this.translate.z);
        this.material = new THREE.MeshBasicMaterial();
        this.material.color.setHex( clusColors[this.clus.split(',')[0]] ? clusColors[this.clus.split(',')[0]] : 0xffffff ); 
        this.geom = new THREE.Mesh(geometry, this.material);
    }

    colorSet(par, currentDateId) {
        let dischColor;
        if (currentDateId >= this.dDateId) {
            if (this.demised == 'Y') {
                dischColor = 0xee2020;
            } else {
                dischColor = 0x55ff55;
            }
        } else {
            dischColor = 0x9055ff;
        }
        switch (par) {
            case 'age':
                let ageColor = this.age/102;
               // console.log(ageColor);
                this.material.color.setHSL(0.85-(ageColor/2), 1.0, 0.4+(ageColor/1.85));
                break;
            case 'cluster':
                this.material.color.setHex(clusColors[this.clus.split(',')[0]]);
                break;
            case 'gender':
                this.material.color.setHex(genColors[this.gender]);
                break;
            case 'nat':
                if (this.nat.includes('Singapore Permanent Resident')) {
                    this.material.color.setHex(0x6699ff);
                    return;
                } else if (this.nat.includes('Singapore Citizen')) {
                    this.material.color.setHex(0xffffff);
                    return;
                } else if (this.nat.includes('Long Term Pass holder')) {
                    this.material.color.setHex(0x00ff55);
                    return;
                } else if (this.nat.includes('Work Pass holder')) {
                    this.material.color.setHex(0x01ff33);
                    return;
                } else if (this.nat.includes('Pending')){
                    this.material.color.setHex(0x555555);
                    return;
                } else {
                    this.material.color.setHex(0xaa3030);
                    return;
                }
            case 'disch':
                this.material.color.setHex(dischColor);
                break;
            case 'highlight':
                this.material.color.setHex(0xaaccee);
                break;
        }
    }

    createLink(start, end) {
        let points = [start, end];
        let mat = new THREE.LineBasicMaterial({color: clusColors[this.clus]});
        let geo = new THREE.BufferGeometry().setFromPoints(points);
        this.linklines.push(new THREE.Line(geo, mat));
    }
}

class Patients {
    constructor(parent) {
        this.p = parent;
        this.allPatients = [];
        this.clusterCounts = {};
        this.currentParColor;
        this.clusterSort = [];
        this.data;
        this.clusIds = {};
        this.totalCaseCount=0;
        for (let i = 0; i<200; i++) {
            this.clusIds[i] = null;
        }
        this.distribute = [155, 55, 1, 100, 43,48,143,148,63,68,
            163,168,34,37,74,77,174,134,137,22,
        24,26,28,122,124,126,128,82,84,86,
        88,182,184,186,188,12,14,16,18,112,
        114,116,118,92,94,96,98,192,194,196,
        198,151,61,13,113,45,51,145,150,65];
    }

    addPatient(currentDateId, cn, data) {
        let newPatient = new Patient(currentDateId, cn, data, this.clusIds, this.clusterSort);
        newPatient.create();
        for (let key of Object.keys(this.data)){
            if (newPatient.dis == this.data[key]['date']) {
                newPatient.dDateId = key;
                break;
            }
        }
        if (newPatient.links!='') {
            let linkNumbers = newPatient.links.split(",");
            for (let linkN of linkNumbers) {
                let linkedPatient = this.allPatients[parseInt(linkN)-1];
                if (linkedPatient) {
                    newPatient.createLink(linkedPatient.translate, newPatient.translate);
                }
            }
        }
        this.allPatients.push(newPatient);
    }

    setColor(currentDateId) {
        for (let patient of this.allPatients) {
            patient.colorSet(this.currentParColor, currentDateId);
        }
    }

    display(currentDateId) {
        let totalCases = parseInt(this.data[currentDateId]['totalCases']);
     
        for (let i = 0; i<totalCases; i++) {
            this.p.add(this.allPatients[i].geom);
            if (this.allPatients[i].linklines.length!=0 && this.allPatients[i].material.color.getHex() == clusColors[this.allPatients[i].clus]){
                for (let line of this.allPatients[i].linklines) {
                    this.p.add(line);
                }
            }
        }
        if (this.allPatients.length>totalCases) {
            let removePatients = this.allPatients.slice(totalCases, this.allPatients.length+1);
            for (let patient of removePatients) {
                this.p.remove(patient.geom);
                if (patient.linklines.length!=0){
                    for (let line of patient.linklines){
                        this.p.remove(line);
                    }
                }
            }
        }
        
    }

    showLinks(currentDateId){
        let totalCases = parseInt(this.data[currentDateId-1]['totalCases']) ;
        for (let i=0; i<totalCases; i++){
            for (let line of this.allPatients[i].linklines){
                this.p.add(line);
            }
        }
    }

    hideLinks(currentDateId) {
        let totalCases = parseInt(this.data[currentDateId-1]['totalCases']);
        for (let i=0; i<this.allPatients.length; i++){
            for (let line of this.allPatients[i].linklines){
                this.p.remove(line);
            }
        }        
    }

    getClusterProportions() {
        for (let dateid of Object.keys(this.data)) {
            for (let pats of Object.keys(this.data[dateid]['cases'])) {
                this.totalCaseCount += 1;
                let patCluster = this.data[dateid]['cases'][pats].Cluster.split(',')[0];
                if (this.clusterCounts[patCluster]) {
                    this.clusterCounts[patCluster] += 1;
                } else {
                    this.clusterCounts[patCluster] = 1;
                }
            }
        }
        //an array of arrays [cluster, proportion]
        for (let key of Object.keys(this.clusterCounts)) {
            this.clusterSort.push([key, this.clusterCounts[key]/this.totalCaseCount]);
        }
        this.clusterSort.sort(function(a, b) {return b[1]-a[1]}); //sorts largest - smallest
        for (let i = 0; i< this.clusterSort.length; i++) {
            this.clusIds[this.distribute[i%60]]=this.clusterSort[i][0];
        }
    }

}

export {Patient, Patients};
