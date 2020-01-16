// const electron = require('electron');
// const path = require('path');
// const fs = require('fs');


class DataManager{
    constructor(){
        console.log("Datamanager Init");
        // const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        // console.log("userDataPath:", userDataPath);
        // this.filepath = path.join(userDataPath, 'db.json');
        // try {
        //     this._logManSet = JSON.parse(fs.readFileSync(this.filepath));
        // } catch(error) {
        //     this._logManSet = new Set();
        // }
        this.m_logManSet = new Set();
    }

    addItem(item){
        if (this.hasItem(item)){
            this.removeItem(item)
        }
        this.m_logManSet.add(item);
    }

    removeItem(item){
        if (!item){
            return;
        }
        var theMan = null;
        for (let man of this.m_logManSet) {
            if(man.uuid === item.uuid){
                theMan = man;
                break;
            }
        }
        this.m_logManSet.delete(theMan);
    }

    hasItem(item){ 
        for (let man of this.m_logManSet) {
            if(item.equals(man)){
                return true;
            }
        }
        return false;
    }

    getLogMan(uuid){
        for (let item of this.m_logManSet) {
            if(item.uuid == uuid){
                return item;
            }
        }
        return null;
    } 

    get list(){
        var li = [];
        for (let item of this.m_logManSet) {
            li.push(item);
        }
        return li;
    }

    clear(){
        this.m_logManSet = null;
    }

    // writefile(){
    //     fs.writeFileSync(this.filepath, JSON.stringify(this._logManSet));
    // }
}

module.exports = new DataManager();