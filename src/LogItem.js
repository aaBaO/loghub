var LogType = {
    Log: 0,
    Warning: 1,
    Error: 2,
}

class LogItem{
    constructor(){
        this.condition = "";
        this.stacktrace = "";
        this.type = LogType.Log;
        this.time = "";
    }
}

module.exports = {LogItem, LogType};