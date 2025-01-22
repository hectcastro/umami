import { z } from 'zod';
import { canViewWebsite, checkAuth } from 'lib/auth';
import { getWebsiteReports } from 'queries';
import { pagingParams } from 'lib/schema';
import { checkRequest } from 'lib/request';
import { badRequest, unauthorized, json } from 'lib/response';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    ...pagingParams,
  });

  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { websiteId } = await params;
  const { page, pageSize, search } = query;

  const auth = await checkAuth(request);

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getWebsiteReports(websiteId, {
    page: +page,
    pageSize: +pageSize,
    search,
  });

  return json(data);
}
