// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote
const {ipcRenderer} = require("electron")

ipcRenderer.on("update_logman_list", function(event, data){
    var logman_list = document.getElementById("logman-list")

    for(let logman of data){
        var item = document.createElement("div");
        item.className = 'log-man'
        var app_id = document.createElement('p');
        app_id.innerHTML = 'app_id:' + logman.app_id
        var device_name = document.createElement('p');
        device_name.innerHTML = 'device:' + logman.device
        var app_version = document.createElement('p');
        app_version.innerHTML = 'app_version:' + logman.app_version
        var res_version = document.createElement('p');
        res_version.innerHTML = 'res_version:' + logman.res_version

        item.appendChild(app_id);
        item.appendChild(device_name);
        item.appendChild(app_version);
        item.appendChild(res_version);

        // item.addEventListener('click', ()=>{
        //     //设置新的检视对象，等待主线程返回
        //     ipcRenderer.invoke('set-inspecting-logman', logman).then((result) => {
        //     })
        // })

        logman_list.appendChild(item);
    }
})

ipcRenderer.on("update_list", function(event, data){
    const mask = remote.getGlobal('sharedObj').logFilterMask; 

    //创建行
    var item = document.createElement("log_item");
    if(data.type === 0){
        item.classList.add("log");
    }else if(data.type === 1){
        item.classList.add("warning");
    }else if(data.type === 2){
        item.classList.add("error");
    }

    var condition= document.createElement("p");
    condition.className = "condition";
    condition.innerHTML = data.condition;
    item.appendChild(condition);

    var stacktrace= document.createElement("p");
    stacktrace.className = "stack_trace";
    stacktrace.innerHTML = data.stackTrace;
    item.appendChild(stacktrace);

    var time = document.createElement("p");
    time.className = "time";
    time.innerHTML = data.time;
    item.appendChild(time);

    toggleLogItemDisplay(item, data.type);

    let list = document.getElementById('log_list');
    list.appendChild(item);
})

let search_input = document.getElementById("filter-input");
search_input.addEventListener("change", (event)=>{
    event.preventDefault();
    const input  = event.target.value;
    remote.getGlobal('sharedObj').logFilterStr = input
    toggleLogListDisplay();
})

ipcRenderer.on("set-log-filter-mask", (event, data)=>{
    let mask = data;
    //log标签
    let togLog = document.getElementById("t-log");
    togLog.addEventListener('click', ()=>{
        let mLog = (1<<0 & mask) == 0;
        if(mLog){
            mask |= 1<<0 ;
        }else{
            mask &= ~(1<<0);
        }
        remote.getGlobal('sharedObj').logFilterMask = mask; 
        toggleLogListDisplay();
    })

    //warning标签
    let togWarning = document.getElementById("t-warning");
    togWarning.addEventListener('click', ()=>{
        let mWarning = (1<<1 & mask) == 0;
        if(mWarning){
            mask |= 1<<1;
        }else{
            mask &= ~(1<<1);
        }
        remote.getGlobal('sharedObj').logFilterMask = mask; 
        toggleLogListDisplay();
    })
    
    //error标签
    let togError = document.getElementById("t-error");
    togError.addEventListener('click', ()=>{
        let mError = (1<<2 & mask) == 0;
        if(mError){
            mask |= 1<<2;
        }else{
            mask &= ~(1<<2);
        }
        remote.getGlobal('sharedObj').logFilterMask = mask; 
        toggleLogListDisplay();
    })
})

function toggleLogListDisplay(){
    const mask = remote.getGlobal('sharedObj').logFilterMask;
    const log_elements = document.querySelectorAll('log_item.log');
    const warning_elements = document.querySelectorAll('log_item.warning');
    const error_elements = document.querySelectorAll('log_item.error');

    const show_log = (1<<0 & mask) == 0;
    const show_warning = (1<<1 & mask) == 0;
    const show_error = (1<<2 & mask) == 0;

    const search_str = remote.getGlobal('sharedObj').logFilterStr;
    for(let ele of log_elements){
        const match = searchLogItem(ele, search_str);
        if(!show_log || !match){
            ele.classList.toggle("hide", true);
        }
        else if(show_log || match){
            ele.classList.toggle("hide", false);
        }
    }
    for(let ele of warning_elements){
        const match = searchLogItem(ele, search_str);
        if(!show_warning || !match){
            ele.classList.toggle("hide", true);
        }
        else if(show_warning || match){
            ele.classList.toggle("hide", false);
        }
    }
    for(let ele of error_elements){
        const match = searchLogItem(ele, search_str);
        if(!show_error || !match){
            ele.classList.toggle("hide", true);
        }
        else if(show_error || match){
            ele.classList.toggle("hide", false);
        }
    }
}

function toggleLogItemDisplay(item, type){
    const mask = remote.getGlobal('sharedObj').logFilterMask;
    const type_show = (1<<type & mask) == 0;
    const search_str = remote.getGlobal('sharedObj').logFilterStr;
    
    const match = searchLogItem(item, search_str);
    if(!type_show || !match){
        item.classList.toggle("hide", true);
    }
    else if(type_show || match){
        item.classList.toggle("hide", false);
    }
}

function searchLogItem(element, str){
    if(str === '')
        return true;

    for(let child of element.children){
        if (child.innerHTML.match(str)){
            return true;
        }
    }
    return false;
}