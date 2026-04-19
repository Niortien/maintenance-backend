import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ResponsableSite, Site } from '@prisma/client';

export type ResponsableWithSite = ResponsableSite & { site: Site };

export const CurrentResponsable = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ResponsableWithSite => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as ResponsableWithSite;
  },
);
