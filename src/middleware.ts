import { defineMiddleware } from "astro:middleware";
import cms from '../_cms.ts';

export const onRequest = defineMiddleware((context, next) => {
  if (context.url.pathname.startsWith('/admin')) {
    return cms.fetch(context.request);
  }
  return next();
});
