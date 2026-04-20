import { useGetNotifications, useMarkNotificationRead, getGetNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Briefcase, Calendar, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Notifications() {
  const { data: notificationsData, isLoading } = useGetNotifications();
  const markAsRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead.mutateAsync({ data: { notificationId: id } });
      queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notificationsData?.data.filter(n => !n.read) || [];
    for (const notif of unread) {
      await markAsRead.mutateAsync({ data: { notificationId: notif.id } });
    }
    queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'case_assigned': return <Briefcase className="w-5 h-5 text-amber-500" />;
      case 'case_updated': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'deadline_reminder': return <Calendar className="w-5 h-5 text-red-500" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-zinc-500" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-zinc-500">Carregando...</div>;
  }

  const unreadCount = notificationsData?.data.filter(n => !n.read).length || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Notificações</h1>
          <p className="text-zinc-400">Suas atualizações e alertas do sistema</p>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={handleMarkAllAsRead}>
            <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notificationsData?.data.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 border border-zinc-800 border-dashed rounded-lg bg-zinc-900/20">
            Você não possui notificações.
          </div>
        ) : (
          notificationsData?.data.map((notif) => (
            <Card key={notif.id} className={`border-zinc-800 transition-colors ${notif.read ? 'bg-[#121214]/50' : 'bg-zinc-900 border-l-2 border-l-amber-500'}`}>
              <CardContent className="p-4 sm:p-5 flex gap-4">
                <div className={`mt-1 flex-shrink-0 ${notif.read ? 'opacity-50' : 'opacity-100'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                    <h4 className={`font-medium ${notif.read ? 'text-zinc-400' : 'text-zinc-100'}`}>
                      {notif.title}
                    </h4>
                    {notif.createdAt && (
                      <span className="text-xs text-zinc-500 whitespace-nowrap">
                        {format(new Date(notif.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed mb-3 ${notif.read ? 'text-zinc-500' : 'text-zinc-300'}`}>
                    {notif.message}
                  </p>
                  
                  {!notif.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-xs text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Marcar como lida
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
