import axios from 'axios';

export default ({ req }) => {
  // kubectl get namespace
  // kubectl get services -n {NAMESPACE}

  /**
    Get the cookie from original request (from browser)
    and then I need to forward this request back to Ingress
    Cross Namespace Service Communication
      for e.g: http://SERVICENAME.NAMESPACE.svc.cluster.local

    All requests coming from a component
      - request from browser
    All requests coming from getinitialProps
      - execute on the server
        - hard refresh on page
        - clicking link from diff domain
        - typing url into addr bar

      - execute on the client
        - navigating from one page to another while in the app
 */

  const isServer = typeof window === 'undefined';
  const SERVICE = 'ingress-nginx-controller';
  const NAMESPACE = 'ingress-nginx';

  return isServer
    ? axios.create({
        baseURL: `http://${SERVICE}.${NAMESPACE}.svc.cluster.local`,
        headers: req.headers,
      })
    : axios.create({
        baseURL: '/',
      });
};
