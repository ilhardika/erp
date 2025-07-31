import { createApiHandlers } from '@/lib/api-helpers';
import { getSatuans, addSatuan } from '@/lib/actions/satuans';
import { satuanCreateSchema } from '@/lib/schemas';

export const { GET, POST } = createApiHandlers({
  getHandler: (session) => getSatuans(session.user.id),
  postHandler: {
    action: (data, session) => addSatuan(data.nama, session.user.id),
    schema: satuanCreateSchema,
    // Semua peran diizinkan untuk membuat satuan, jadi tidak perlu `allowedRoles`
  },
});