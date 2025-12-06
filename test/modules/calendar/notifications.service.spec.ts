import { NotificationsService } from '../../../src/app/modules/calendar/notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    service = new NotificationsService();
  });

  describe('createForUser', () => {
    it('debe crear una notificación para un usuario', () => {
      const result = service.createForUser('user1', [
        { eventId: 'e1', summary: 'Evento 1', start: '2025-01-01' },
      ]);

      expect(result.length).toBe(1);
      expect(result[0].userId).toBe('user1');
      expect(result[0].eventId).toBe('e1');
      expect(result[0].read).toBe(false);
      expect(result[0].id).toBeDefined();
      expect(typeof result[0].createdAt).toBe('string');
    });

    it('debe crear múltiples notificaciones', () => {
      const items = [
        { eventId: 'e1', summary: 'A' },
        { eventId: 'e2', summary: 'B' },
      ];

      const res = service.createForUser('user1', items);

      expect(res.length).toBe(2);
      expect(service.findForUser('user1').length).toBe(2);
    });

    it('debe asignar eventId vacío si no viene', () => {
      const res = service.createForUser('user1', [{ summary: 'Sin ID' }]);

      expect(res[0].eventId).toBe('');
    });
  });

  describe('findForUser', () => {
    it('debe retornar lista vacía si no hay notificaciones', () => {
      const res = service.findForUser('unknown');
      expect(res).toEqual([]);
    });

    it('debe retornar las notificaciones del usuario', () => {
      service.createForUser('user1', [{ eventId: 'e1' }]);

      const res = service.findForUser('user1');
      expect(res.length).toBe(1);
      expect(res[0].eventId).toBe('e1');
    });
  });

  describe('markRead', () => {
    it('debe marcar una notificación como leída', () => {
      const created = service.createForUser('user1', [{ eventId: 'e1' }]);
      const id = created[0].id;

      const result = service.markRead('user1', id);
      expect(result).toBe(true);

      const updated = service.findForUser('user1');
      expect(updated[0].read).toBe(true);
    });

    it('debe retornar false si la notificación no existe', () => {
      service.createForUser('user1', [{ eventId: 'e1' }]);

      const res = service.markRead('user1', 'id-inexistente');
      expect(res).toBe(false);
    });
  });

  describe('clearForUser', () => {
    it('debe eliminar todas las notificaciones del usuario', () => {
      service.createForUser('user1', [{ eventId: 'e1' }]);
      service.clearForUser('user1');

      expect(service.findForUser('user1')).toEqual([]);
    });

    it('no debe fallar si el usuario no existe', () => {
      expect(() => service.clearForUser('unknown')).not.toThrow();
    });
  });
});
