import React from 'react';
import { Bell, X, Info } from 'lucide-react';

interface NotificationsProps {
  onClose: () => void;
}

export function Notifications({ onClose }: NotificationsProps) {
  // Simulated notifications - In a real app, these would come from the database
  const notifications = [
    {
      id: 1,
      type: 'promo',
      title: 'Promoção Especial',
      message: 'Ganhe 15% de desconto na próxima revisão!',
      date: '2024-01-15'
    },
    {
      id: 2,
      type: 'info',
      title: 'Novidade',
      message: 'Agora você pode adicionar múltiplas motos ao seu perfil!',
      date: '2024-01-10'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Manutenção Preventiva',
      message: 'Lembre-se de verificar o óleo da sua moto regularmente.',
      date: '2024-01-05'
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-end z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white/90 backdrop-blur-md w-full max-w-sm rounded-2xl shadow-lg overflow-hidden animate-slide-left"
        style={{
          maxHeight: 'calc(100vh - 2rem)',
          animation: 'slide-left 0.3s ease-out'
        }}
      >
        <style>
          {`
            @keyframes slide-left {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .animate-slide-left {
              animation: slide-left 0.3s ease-out;
            }
          `}
        </style>

        <div className="p-4 border-b border-gray-200/80 flex justify-between items-center bg-blue-600/90 backdrop-blur text-white">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </h2>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem - 60px)' }}>
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-200/60">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="p-4 hover:bg-white/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-100 rounded-full p-1">
                      <Info className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <p className="text-gray-600 mt-1 text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Nenhuma notificação no momento
            </div>
          )}
        </div>
      </div>
    </div>
  );
}