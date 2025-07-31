import { createApiHandlers } from '@/lib/api-helpers';
import { getCategories, createCategory } from '@/lib/actions/categories';
import { categoryCreateSchema } from '@/lib/schemas';

export const { GET, POST } = createApiHandlers({
  getHandler: (session, params) => {
    const status = params?.get('status') || undefined;
    return getCategories(session.user.id, status);
  },
  postHandler: {
    action: (data, session) => createCategory(data, session.user.id),
    schema: categoryCreateSchema,
    allowedRoles: ['admin', 'gudang'],
  },
});