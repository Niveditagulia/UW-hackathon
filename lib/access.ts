import {currentUser} from './local-session';
export const identity=currentUser;
export {sameOrigin} from './request-origin';
export const privateHeaders={'Cache-Control':'private, no-store'};
