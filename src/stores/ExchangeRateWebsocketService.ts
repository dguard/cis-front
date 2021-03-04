

let onMessageCallback;
let _send;
let socket;
let onConnected;
let status;

class ExchangeRateWebsocketService {

    constructor() {
    }

    protected promiseConnect;
    startWebsocketConnection() {
        if(!socket) {
            this.promiseConnect = this.connect();
        }
        return this.promiseConnect;
    }

    connect = () => {
        return new Promise((resolve, reject)=>{
            this.tryToConnect().then(()=>{
                // succeed
                status = 'connected';
                resolve();
            }).catch(()=>{
                setTimeout(()=>{
                    this.connect().then(resolve).catch(reject);
                }, 300);
            });
        })
    };

    tryToConnect() {
        return new Promise((resolve, reject)=>{
            socket = new WebSocket(`${process.env.WEBSOCKET_HOST}`);
            socket.onerror = function (error) {
                reject(error);
            };

            socket.onopen = function () {
                // eslint-disable-next-line no-console
                console.log("Connected");
                setTimeout(() => {
                    onConnected && onConnected();
                });
                resolve(socket);
            };

            socket.onmessage = (event) => {
                onMessageCallback && onMessageCallback(event);
            };

            socket.onclose = (err) => {
                status = 'disconnected';
                // eslint-disable-next-line no-console
                console.log('disconnected', err.code, err.reason);
            };
            _send = socket.send.bind(socket);
        })
    }

    send(data){
        if('connected' === status) {
            _send(data);
        } else {
            this.connect().then(()=>{
                _send(data);
            });
        }
    }

    registerMessageCallback = (fn) => {
        onMessageCallback = fn;
    }
    registerOnConnectedCallback = (fn) => {
        onConnected = fn;
    }

}
export default new ExchangeRateWebsocketService();
