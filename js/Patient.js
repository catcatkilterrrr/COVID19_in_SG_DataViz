// different mesh colors for different clusters
const clusColors = {
    'CHN': 0x33d0c0, 'MHD': 0x990099, 'I': 0x40c9f0,
    'U': 0xbe2222, 'L': 0x30aa43, 'YTH': 0xff8c66,
    'LCM': 0xeeff55, 'GAOG': 0x8cef36, 'GH': 0x60eede,
    'SAH': 0xee82ee, 'SAFRA': 0x31aa20, 'BG': 0x3acfef,
    'COS': 0x5dff2f, 'MAM': 0x90cd00, 'RG': 0x6aff00,
    'PCF': 0xffb6c1, 'DCIS': 0xffc0cb, 'SPC': 0xba77d8,
    'TWB': 0xdf60ff, 'WR': 0xf0368c, 'SDP': 0xff776a,
    'WTG': 0xeba210, 'SKL': 0xfffacd, 'LAMH': 0x34dfa9,
    'MUSC': 0x1199ff, 'MMRT': 0xf4a460, 'KS': 0xee3355,
    'WT': 0xfcb0f3, 'CLI': 0xffc033, 'CLII': 0x95ff33,
    'STL': 0xeff3c0, 'TGD': 0xffd232, 'PG': 0x20fff0,
    'TD': 0xcef053, 'CLV': 0x99edbb, 'HER': 0x7fffd4,
    'SCC': 0x10ffbf, 'TOB': 0x46dbff, 'SKD': 0xfa951f,
    'LGP': 0x999900, 'KL': 0xffa946, 'SHAW': 0xfee010,
    '6BR': 0xff9510, 'ICA': 0xff69b4, 'NUH': 0xd2691e,
    'CP': 0xf0ef45, 'SKA': 0xff540f, 'NCL': 0x30ffaf,
    'SENL': 0xff3500, 'MCD': 0x7fffd4, 'WW': 0xffa500, 'WIP': 0xff7f50,
    'TVD': 0xff8c00, 'TPC': 0xee3522, '8KD': 0xffee00, 'ABC': 0xffe500,
    'AL': 0xee9947, 'BT': 0x22eeee, 'CW': 0x10ff35, 'KUBS': 0xee3533,
    'PPTA': 0xffdab9, 'SENW': 0xf0e68c, 'KD': 0xfe5604, 'KTC': 0xffff00,
    'KTD': 0xef9200, '234BR': 0xfe5609, 'ML': 0xe0f0a0
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
                    this.proportion /= 15;
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
                } else if (this.nat.includes('Work') || this.nat.includes('S Pass')) {
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
        198,151,61,13,113,45,51,145,150,65,165,
        35, 75, 79, 135, 25, 125, 85, 185, 15, 115];
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
            if (this.allPatients[i].clus == 'SDP') {
                console.log('SDP');
            }
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
            this.clusIds[this.distribute[i]]=this.clusterSort[i][0];
        }
    }

}

export {Patient, Patients};
