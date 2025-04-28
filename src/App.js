import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://34.93.246.160:4000');

function App() {
  const [roomId, setRoomId] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [board, setBoard] = useState(Array(9).fill(''));
  const [playerSymbol, setPlayerSymbol] = useState('');
  const [playersCount, setPlayersCount] = useState(0);

  useEffect(() => {
    socket.on('joinedRoom', (playerNum) => {
      setInRoom(true);
      setPlayerSymbol(playerNum === 1 ? 'X' : 'O');
    });

    socket.on('roomFull', () => {
      alert('Room is full!');
    });

    socket.on('receiveMove', ({ index, symbol }) => {
      setBoard(prev => {
        const updated = [...prev];
        updated[index] = symbol;
        return updated;
      });
      setCurrentPlayer(symbol === 'X' ? 'O' : 'X');
    });

    socket.on('playersUpdate', (count) => {
      setPlayersCount(count);
    });
  }, []);

  const joinRoom = () => {
    if (roomId) {
      socket.emit('joinRoom', roomId);
    }
  };

  const handleCellClick = (index) => {
    if (board[index] === '' && currentPlayer === playerSymbol) {
      setBoard(prev => {
        const updated = [...prev];
        updated[index] = playerSymbol;
        return updated;
      });
      socket.emit('playMove', { roomId, index, symbol: playerSymbol });
      setCurrentPlayer(playerSymbol === 'X' ? 'O' : 'X');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '30px' }}>
      {!inRoom ? (
        <div>
          <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Enter Room ID" />
          <button onClick={joinRoom}>Join Game</button>
        </div>
      ) : (
        <div>
          <h2>Room: {roomId}</h2>
          <h3>You are: {playerSymbol}</h3>
          <h4>Players connected: {playersCount}/2</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 100px)',
            gridGap: '5px',
            justifyContent: 'center'
          }}>
            {board.map((cell, idx) => (
              <div
                key={idx}
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2em',
                  cursor: 'pointer'
                }}
                onClick={() => handleCellClick(idx)}
              >
                {cell}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
