import io from 'socket.io-client';
import toast from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (this.socket) return;

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8086', {
      auth: {
        token: localStorage.getItem('accessToken')
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification service');
      this.socket.emit('join-room', userId);
    });

    this.socket.on('notification', (data) => {
      this.handleNotification(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  handleNotification(data) {
    switch (data.type) {
      case 'rental_request':
        toast.success(`New rental request for ${data.itemTitle}`);
        break;
      case 'rental_approved':
        toast.success('Your rental request has been approved!');
        break;
      case 'rental_rejected':
        toast.error('Your rental request has been rejected');
        break;
      case 'payment_received':
        toast.success('Payment received successfully');
        break;
      case 'new_message':
        toast(`New message from ${data.senderName}`);
        break;
      default:
        toast(data.message || 'New notification');
    }
  }
}

export default new NotificationService();