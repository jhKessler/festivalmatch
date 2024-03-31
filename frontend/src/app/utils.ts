export function prepareUrl(base: string, path: string, params: any) {
  path = path.startsWith("/") ? path.slice(1) : path; // remove leading slash
  base = base.endsWith("/") ? base.slice(0, -1) : base; // remove trailing slash
  const url = new URL(`${base}/${path}`);
  Object.keys(params).forEach((key) => {
    url.searchParams.append(key, params[key]);
  });
  return url.toString();
}

export function prepareFrontendUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_FRONTEND_URL!;
  return prepareUrl(base, path, {});
}

export function prepareBackendUrl(
  path: string,
  params: any = {},
  isClientSide: boolean = false
) {
  // if it is on client side we want to access the public url, otherwise we want to access the internal url
  const base = isClientSide
    ? process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL!
    : process.env.NEXT_PUBLIC_BACKEND_URL;
  return prepareUrl(base!, path, params);
}
