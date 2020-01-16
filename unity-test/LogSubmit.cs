using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Net.WebSockets;
using System.Threading;
using UnityEngine;

public class LogMan
{
    public string path = "/AddInstance";
    public string app_id = "loghub_test1";
    public string app_version = "1.0.0";
    public string res_version = "1.0.0";
    public string device = "pc";
    public string uuid = "";

    public LogMan()
    {
        uuid = Guid.NewGuid().ToString();
    }
}

public class LogItem
{
    public string path = "/Log";
    public int type;
    public string condition;
    public string stackTrace;
    public string time;
    public string uuid;
}

public class LogSubmit : MonoBehaviour
{
    private Uri m_uri;
    private ClientWebSocket m_clientws = null;
    private LogMan m_logMan = null;
    private LogItem m_logItem = null;

    const string uri = "ws://localhost:3000";
    delegate System.Threading.Tasks.Task WsSend(ArraySegment<byte> data, WebSocketMessageType messageType,bool endofmessage, CancellationToken ct);
    WsSend Send;

    // Start is called before the first frame update
    void Start()
    {
        WebSocket();
        InitLogListen();
    }

    private void OnDestroy()
    {
        RemoveLogListen(); 
    }

    async void WebSocket()
    {
        try
        {
            m_uri = new Uri(uri);
            m_clientws = new ClientWebSocket();
            await m_clientws.ConnectAsync(m_uri, new CancellationToken());
            Send = m_clientws.SendAsync;

            if (m_logMan == null) m_logMan = new LogMan();
            var data = JsonUtility.ToJson(m_logMan, false);
            await Send(new ArraySegment<byte>(Encoding.UTF8.GetBytes(data)), WebSocketMessageType.Binary, true, new CancellationToken());
        }
        catch (Exception ex)
        {
        }
    }

    // Update is called once per frame
    void Update()
    {
        Debug.Log("<color=#1e2aff>" + Time.deltaTime +"</color>");
    }

    void InitLogListen()
    {
        Application.logMessageReceivedThreaded += HanldeLog;
    }

    void RemoveLogListen()
    {
        Application.logMessageReceivedThreaded -= HanldeLog;
    }

    private void HanldeLog(string condition, string stackTrace, LogType type)
    {
        if(m_clientws != null && m_clientws.State == WebSocketState.Open && Send != null)
        {
            if(m_logItem == null) { m_logItem = new LogItem(); }
            m_logItem.condition = condition;
            m_logItem.stackTrace = stackTrace;
            m_logItem.type = GetLogType(type);
            m_logItem.time = System.DateTime.Now.ToString();
            m_logItem.uuid = m_logMan.uuid;

            var jsItem = JsonUtility.ToJson(m_logItem, false);
            Send(new ArraySegment<byte>(Encoding.UTF8.GetBytes(jsItem)), WebSocketMessageType.Binary, true, new CancellationToken());
        }
    }

    private int GetLogType(LogType type)
    {
        if (type == LogType.Exception || type == LogType.Error)
            return 2;
        if (type == LogType.Warning)
            return 1;
        return 0;
    }
}
