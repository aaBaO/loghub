class LogMan{
    constructor(){
        this.device = "undefined";
        this.ip_address = "";
        this.app_id = "qyn";
        this.app_version = "1.0";
        this.res_version = "1.0";
        this.log_list = [];
        this.uuid = "";
    }

    equals(other){
        return other.uuid === this.uuid;
    }
}

module.exports = LogMan;