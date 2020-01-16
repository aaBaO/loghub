// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron');
const WebSocket = require("ws")
const dataManager = require('./src/DataManager');
const logMan = require('./src/LogMan')
const logType = require('./src/LogItem').LogType
const logItem = require('./src/LogItem').logItem

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let logServer

global.sharedObj = {
    //过滤字符串
    logFilterStr: "",
    //类型过滤遮罩0开1关,<<0:log,<<1:warning;<<2:error
    logFilterMask : 0,
    //当前正在检视的Logman
    inspectingLogman: null,
};

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 600})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.once("did-finish-load", ()=>{
    SetLisenter()
    InitPage()
  })
//   mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    logServer.close()
    logServer = null
    dataManager.clear()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function SetLisenter(){
    // ipcMain.handle('set-inspecting-logman', async (event, logman) => {
    //     console.log(logman)
    //     const result = await doSomeWork(logman)
    //     return result
    // })
}

function InitPage(){
    mainWindow.send("set-log-filter-mask", global.sharedObj.logFilterMask);
}

logServer = new WebSocket.Server({
    port: 3000,
});

logServer.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        // console.log('received: %s', message);
        var data = JSON.parse(message.toString());
        if(data.path){
            if(data.path === '/AddInstance'){
                //添加LogMan对象
                var logman = new logMan()
                logman.app_id = data.app_id;
                logman.device = data.device;
                logman.ip_address = data.ip_address;
                logman.app_version = data.app_version;
                logman.res_version = data.res_version;
                logman.uuid = data.uuid;

                dataManager.addItem(logman);
                //更新LogMan列表
                mainWindow.send("update_logman_list", dataManager.list);
            }
            if(data.path === '/Log'){
                //找到对应的LogMan对象
                var logman = dataManager.getLogMan(data.uuid);
                //当前查看的logman就是正在更新的消息
                if(logman && true){
                    //更新日志列表
                    mainWindow.send("update_list", data);
                }
            }
        }
    });
});