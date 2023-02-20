import { Manager, Socket } from 'socket.io-client';

// la version del socket -io debe ser similar a la der socket en el servidor
// cada vez q se recarge el navegador se desconecta el anterior socket y se conecta uno nuevo
let socket: Socket;
export const connectToServer = (token: string) => {
    const manager = new Manager('http://localhost:3000/socket.io/socket.io.js', {
        extraHeaders: {
            nuevoHeader: 'un valor',
            authentication: token
        }
    });
    // se tiene q remover porque a pesar q desde el backend se desconecta en el front aun siguen existiendo los listeners
    socket?.removeAllListeners();
    // se conecta al namespace root
    // los clientes no se conectan entre sí
    // los clientes están conectados al servidor y el servidor es quien decide a quien le llega el mensaje
    socket = manager.socket('/');
    // console.log({ socket });
    addListeners();
}

const addListeners = () => {
    const serverStatusLabel = document.querySelector('#server-status')!;
    const clientsUl = document.querySelector('#clients-ul')!;
    const messageForm = document.querySelector<HTMLFormElement>('#message-form')!;
    const messageInput = document.querySelector<HTMLInputElement>('#message-input')!;

    const messagesUl = document.querySelector<HTMLUListElement>('#message-ul')!;

    // escuchar eventos q vienen del servidor
    socket.on('connect', () => {
        serverStatusLabel.innerHTML = 'connected'
    })
    // por ejemplo cuando el servidor cerro la conexión bajando el server
    socket.on('disconnect', () => {
        serverStatusLabel.innerHTML = 'disconnected'
    })

    socket.on('client-updated', (clients: string[]) => {
        let clientsHTML = '';
        clients.forEach(clientId => {
            clientsHTML += `
                <li>${clientId}</li>
            `
        });
        clientsUl.innerHTML = clientsHTML;
    })

    // si se quiere hablar con el servidor es con emit
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (messageInput.value.trim().length <= 0) return;
        // emit('nombre del evento q se quiere emitir al servidor', lo q se quiere emitir, q funcion se ejecuta si en caso se emite el mensaje)
        socket.emit('message-from-client', {
            id: 'ID',
            message: messageInput.value
        })
        messageInput.value = '';
    })

    socket.on('message-from-server', (payload: { fullName: string, message: string }) => {
        const newMessage = `
           <li>
                <strong>${ payload.fullName }</strong>
                <span>${ payload.message }</span>
           </li>
        `;

        const li = document.createElement('li');
        li.innerHTML = newMessage;
        messagesUl.append(li);
    })

}
