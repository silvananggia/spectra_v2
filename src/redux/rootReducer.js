// ** Reducers Imports
import { combineReducers } from '@reduxjs/toolkit';
import auth from './slices/auth';
import message from './slices/message';
import job from './slices/job';
import map from './slices/map';
import dynamicMap from './slices/dynamicMap';
import information from './slices/information';
import product from './slices/product';
import language from './slices/language';
import stacCatalog from './slices/stacCatalog';

const rootReducer = combineReducers({
    auth,
    message,
    job,
    map,
    dynamicMap,
    information,
    product,
    language,
    stacCatalog,
});

export default rootReducer;
