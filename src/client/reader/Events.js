import EventEmitter from 'eventemitter3';

export const SET_CONTENT = 'set_content';
export const PAGING_UPDATED = 'update_page';
export const SET_READY_TO_READ = 'set_ready_to_read';
export const UPDATE_SETTING = 'update_setting';


export default new EventEmitter();
